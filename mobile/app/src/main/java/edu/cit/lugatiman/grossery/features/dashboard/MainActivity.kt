package edu.cit.lugatiman.grossery.features.dashboard

import android.os.Bundle
import android.view.View
import android.widget.TextView
import android.widget.Toast
import androidx.core.content.ContextCompat
import androidx.lifecycle.ViewModelProvider
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import edu.cit.lugatiman.grossery.BaseNavigationActivity
import edu.cit.lugatiman.grossery.R
import java.time.LocalDate
import java.time.temporal.ChronoUnit
import androidx.lifecycle.lifecycleScope
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch

class MainActivity : BaseNavigationActivity() {

    private var pollJob: Job? = null
    private lateinit var viewModel: DashboardViewModel
    private lateinit var adapter: DashboardItemsAdapter

    private lateinit var tvExpectedCount: TextView
    private lateinit var tvExpectedSub: TextView
    private lateinit var tvActualCount: TextView
    private lateinit var tvActualSub: TextView
    private lateinit var tvExpiringCount: TextView
    private lateinit var tvExpiredCount: TextView
    private lateinit var rvDashboardItems: RecyclerView
    private lateinit var tvAlertsSummary: TextView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        // Initialize Views
        tvExpectedCount = findViewById(R.id.tvExpectedCount)
        tvExpectedSub = findViewById(R.id.tvExpectedSub)
        tvActualCount = findViewById(R.id.tvActualCount)
        tvActualSub = findViewById(R.id.tvActualSub)
        tvExpiringCount = findViewById(R.id.tvExpiringCount)
        tvExpiredCount = findViewById(R.id.tvExpiredCount)
        rvDashboardItems = findViewById(R.id.rvDashboardItems)
        tvAlertsSummary = findViewById(R.id.tvAlertsSummary)

        // Initialize RecyclerView & Adapter
        adapter = DashboardItemsAdapter { item, amount ->
            viewModel.adjustConsumption(item, amount)
        }
        rvDashboardItems.layoutManager = LinearLayoutManager(this)
        rvDashboardItems.adapter = adapter

        // Setup ViewModel
        val repository = DashboardRepository(apiService)
        val factory = DashboardViewModelFactory(repository)
        viewModel = ViewModelProvider(this, factory).get(DashboardViewModel::class.java)

        // Observe Data States
        setupObservers()
    }

    override fun onResume() {
        super.onResume()
        startPeriodicPolling()
    }

    override fun onPause() {
        super.onPause()
        stopPeriodicPolling()
    }

    private fun startPeriodicPolling() {
        pollJob = lifecycleScope.launch {
            while (isActive) {
                viewModel.fetchDashboardData()
                delay(3000)
            }
        }
    }

    private fun stopPeriodicPolling() {
        pollJob?.cancel()
        pollJob = null
    }

    private fun setupObservers() {
        viewModel.dashboardData.observe(this) { data ->
            if (data != null) {
                // Sum metrics dynamically
                val totalExpected = data.items.sumOf { it.expected }
                val totalActual = data.items.sumOf { it.actual }
                val totalVariance = totalActual - totalExpected

                tvExpectedCount.text = String.format("%.1f", totalExpected)
                tvExpectedSub.text = String.format("units/month (%s)", data.month)

                tvActualCount.text = String.format("%.1f", totalActual)
                
                if (totalVariance > 0.0) {
                    tvActualSub.text = String.format("▲ %.1f over goal", totalVariance)
                    tvActualSub.setTextColor(ContextCompat.getColor(this, R.color.error))
                } else {
                    tvActualSub.text = String.format("%.1f relative to goal", totalVariance)
                    tvActualSub.setTextColor(ContextCompat.getColor(this, R.color.text_hint))
                }

                // Render dynamic item progress rows
                adapter.submitList(data.items)
            } else {
                tvExpectedCount.text = "0.0"
                tvActualCount.text = "0.0"
                tvActualSub.text = "0.0 relative to goal"
                tvActualSub.setTextColor(ContextCompat.getColor(this, R.color.text_hint))
                adapter.submitList(emptyList())
            }
        }

        viewModel.expiringSoon.observe(this) { expiringList ->
            val items = expiringList ?: emptyList()
            val now = LocalDate.now()

            // Expired: expiration Date is in the past
            val expiredItems = items.filter { item ->
                item.expirationDate?.let { dateStr ->
                    try {
                        val date = LocalDate.parse(dateStr)
                        date.isBefore(now)
                    } catch (e: Exception) {
                        false
                    }
                } ?: false
            }

            // Expiring soon: expiration Date is within the next 3 days and not already expired
            val soonItems = items.filter { item ->
                item.expirationDate?.let { dateStr ->
                    try {
                        val date = LocalDate.parse(dateStr)
                        val days = ChronoUnit.DAYS.between(now, date)
                        !date.isBefore(now) && days <= 3
                    } catch (e: Exception) {
                        false
                    }
                } ?: false
            }

            tvExpiringCount.text = soonItems.size.toString()
            tvExpiredCount.text = expiredItems.size.toString()

            // Populate dynamic alerts text summary
            val alertsBuilder = StringBuilder()
            if (soonItems.isNotEmpty()) {
                alertsBuilder.append("⏰ Expiring Soon:\n")
                soonItems.forEach { 
                    alertsBuilder.append(String.format("• %s (expires: %s)\n", it.itemName, it.expirationDate))
                }
            }
            if (expiredItems.isNotEmpty()) {
                if (alertsBuilder.isNotEmpty()) alertsBuilder.append("\n")
                alertsBuilder.append("🥀 Expired:\n")
                expiredItems.forEach { 
                    alertsBuilder.append(String.format("• %s (expired: %s)\n", it.itemName, it.expirationDate))
                }
            }

            if (alertsBuilder.isEmpty()) {
                tvAlertsSummary.text = "Everything looks good! No alerts at this time. 🎉"
                tvAlertsSummary.setTextColor(ContextCompat.getColor(this, R.color.text_hint))
            } else {
                tvAlertsSummary.text = alertsBuilder.toString().trim()
                tvAlertsSummary.setTextColor(ContextCompat.getColor(this, R.color.dark_accent))
            }
        }

        viewModel.errorState.observe(this) { error ->
            if (error != null) {
                Toast.makeText(this, error, Toast.LENGTH_LONG).show()
                viewModel.errorState.value = null // Reset single event
            }
        }

        viewModel.toastMessage.observe(this) { message ->
            if (message != null) {
                Toast.makeText(this, message, Toast.LENGTH_SHORT).show()
                viewModel.toastMessage.value = null // Reset single event
            }
        }
    }
}