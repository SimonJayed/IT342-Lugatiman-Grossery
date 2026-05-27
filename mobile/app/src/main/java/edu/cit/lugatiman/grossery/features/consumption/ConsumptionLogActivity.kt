package edu.cit.lugatiman.grossery.features.consumption

import android.os.Bundle
import android.widget.Toast
import androidx.lifecycle.ViewModelProvider
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import androidx.lifecycle.lifecycleScope
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch
import edu.cit.lugatiman.grossery.BaseNavigationActivity
import edu.cit.lugatiman.grossery.R
import edu.cit.lugatiman.grossery.features.dashboard.DashboardRepository
import edu.cit.lugatiman.grossery.features.dashboard.DashboardViewModel
import edu.cit.lugatiman.grossery.features.dashboard.DashboardViewModelFactory

class ConsumptionLogActivity : BaseNavigationActivity() {

    private var pollJob: Job? = null
    private lateinit var viewModel: DashboardViewModel
    private lateinit var adapter: ConsumptionLogAdapter
    private lateinit var rvConsumptionLogs: RecyclerView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_consumption_log)

        // Initialize views
        rvConsumptionLogs = findViewById(R.id.rvConsumptionLogs)

        // Setup Adapter with bidirectional callback
        adapter = ConsumptionLogAdapter { item, amount ->
            viewModel.adjustConsumption(item, amount)
        }
        rvConsumptionLogs.layoutManager = LinearLayoutManager(this)
        rvConsumptionLogs.adapter = adapter

        // Setup Repository & ViewModel
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
                adapter.submitList(data.items)
            } else {
                adapter.submitList(emptyList())
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
