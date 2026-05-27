package edu.cit.lugatiman.grossery.features.grocery

import android.os.Bundle
import android.text.Editable
import android.text.TextWatcher
import android.view.View
import android.widget.EditText
import android.widget.PopupMenu
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

class GroceryItemsActivity : BaseNavigationActivity() {

    private var pollJob: Job? = null
    private lateinit var viewModel: GroceryViewModel
    private lateinit var adapter: GroceryItemsAdapter
    
    private lateinit var etSearch: EditText
    private lateinit var rvGroceryItems: RecyclerView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_grocery_items)

        // Initialize views
        etSearch = findViewById(R.id.etSearch)
        rvGroceryItems = findViewById(R.id.rvGroceryItems)

        // Setup Adapter
        adapter = GroceryItemsAdapter { item, view ->
            showPopupMenu(item, view)
        }
        rvGroceryItems.layoutManager = LinearLayoutManager(this)
        rvGroceryItems.adapter = adapter

        // Setup Repository & ViewModel
        val repository = GroceryRepository(apiService)
        val factory = GroceryViewModelFactory(repository)
        viewModel = ViewModelProvider(this, factory).get(GroceryViewModel::class.java)

        // Setup Observers
        setupObservers()

        // Setup Search Listener
        etSearch.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {
                adapter.filter(s.toString())
            }
            override fun afterTextChanged(s: Editable?) {}
        })
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
                viewModel.fetchGroceries()
                delay(3000)
            }
        }
    }

    private fun stopPeriodicPolling() {
        pollJob?.cancel()
        pollJob = null
    }

    private fun setupObservers() {
        viewModel.groceries.observe(this) { result ->
            result.onSuccess { list ->
                adapter.submitList(list)
                // Filter again in case there is active search text
                adapter.filter(etSearch.text.toString())
            }.onFailure { error ->
                Toast.makeText(this, error.message ?: "Failed to fetch groceries", Toast.LENGTH_SHORT).show()
            }
        }

        viewModel.actionResult.observe(this) { result ->
            result.onSuccess { message ->
                Toast.makeText(this, message, Toast.LENGTH_SHORT).show()
                // Refresh list dynamically
                viewModel.fetchGroceries()
            }.onFailure { error ->
                Toast.makeText(this, error.message ?: "Action failed", Toast.LENGTH_SHORT).show()
            }
        }
    }

    private fun showPopupMenu(item: GroceryItem, view: View) {
        val popup = PopupMenu(this, view)
        // Add Delete option dynamically
        popup.menu.add(0, 1, 0, "Delete Item")
        
        popup.setOnMenuItemClickListener { menuItem ->
            when (menuItem.itemId) {
                1 -> {
                    item.id?.let { id ->
                        viewModel.deleteGrocery(id)
                    } ?: Toast.makeText(this, "Cannot delete item without ID", Toast.LENGTH_SHORT).show()
                    true
                }
                else -> false
            }
        }
        popup.show()
    }
}
