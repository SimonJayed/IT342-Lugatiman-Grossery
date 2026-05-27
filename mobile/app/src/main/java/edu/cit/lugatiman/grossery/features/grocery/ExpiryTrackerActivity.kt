package edu.cit.lugatiman.grossery.features.grocery

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

class ExpiryTrackerActivity : BaseNavigationActivity() {

    private var pollJob: Job? = null
    private lateinit var viewModel: GroceryViewModel
    private lateinit var adapter: ExpiryTrackerAdapter
    private lateinit var rvExpiryItems: RecyclerView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_expiry_tracker)

        // Initialize views
        rvExpiryItems = findViewById(R.id.rvExpiryItems)

        // Setup Adapter
        adapter = ExpiryTrackerAdapter()
        rvExpiryItems.layoutManager = LinearLayoutManager(this)
        rvExpiryItems.adapter = adapter

        // Setup Repository & ViewModel
        val repository = GroceryRepository(apiService)
        val factory = GroceryViewModelFactory(repository)
        viewModel = ViewModelProvider(this, factory).get(GroceryViewModel::class.java)

        // Setup Observers
        viewModel.expiringGroceries.observe(this) { result ->
            result.onSuccess { list ->
                // Sort items by proximity to expiration date: expired first, then soon expiring, then fresh
                val sortedList = list.sortedWith(compareBy { item ->
                    item.expirationDate ?: "9999-12-31"
                })
                adapter.submitList(sortedList)
            }.onFailure { error ->
                Toast.makeText(this, error.message ?: "Failed to fetch expiring soon items", Toast.LENGTH_SHORT).show()
            }
        }
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
                viewModel.fetchExpiringSoon()
                delay(3000)
            }
        }
    }

    private fun stopPeriodicPolling() {
        pollJob?.cancel()
        pollJob = null
    }
}
