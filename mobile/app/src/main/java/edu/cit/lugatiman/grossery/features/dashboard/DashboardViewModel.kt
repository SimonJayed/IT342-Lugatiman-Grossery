package edu.cit.lugatiman.grossery.features.dashboard

import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import edu.cit.lugatiman.grossery.features.grocery.GroceryItem
import kotlinx.coroutines.launch

class DashboardViewModel(private val repository: DashboardRepository) : ViewModel() {

    val dashboardData = MutableLiveData<DashboardComparison?>()
    val expiringSoon = MutableLiveData<List<GroceryItem>?>()
    val errorState = MutableLiveData<String?>()
    val toastMessage = MutableLiveData<String?>()

    fun fetchDashboardData() {
        viewModelScope.launch {
            try {
                val compResponse = repository.getDashboardComparison()
                if (compResponse.isSuccessful && compResponse.body()?.success == true) {
                    dashboardData.postValue(compResponse.body()?.data)
                } else {
                    errorState.postValue(compResponse.body()?.message ?: "Failed to load dashboard data")
                }

                val expResponse = repository.getExpiringSoon()
                if (expResponse.isSuccessful && expResponse.body()?.success == true) {
                    expiringSoon.postValue(expResponse.body()?.data ?: emptyList())
                }
            } catch (e: Exception) {
                errorState.postValue("Network error: Failed to sync dashboard data")
            }
        }
    }

    fun adjustConsumption(item: ComparisonItem, amount: Double) {
        if (amount < 0 && item.actual <= 0) return

        val currentData = dashboardData.value ?: return

        // 1. Snapshot previous state for rollback on error
        val previousItems = currentData.items.map { 
            ComparisonItem(
                id = it.id,
                name = it.name,
                expected = it.expected,
                actual = it.actual,
                variance = it.variance,
                unit = it.unit
            )
        }
        val previousData = DashboardComparison(
            month = currentData.month,
            year = currentData.year,
            items = previousItems
        )

        // 2. Perform optimistic update locally for instant visual feedback
        val updatedItems = currentData.items.map { i ->
            if (i.id == item.id) {
                val newActual = Math.max(0.0, i.actual + amount)
                val newVariance = newActual - i.expected
                ComparisonItem(
                    id = i.id,
                    name = i.name,
                    expected = i.expected,
                    actual = newActual,
                    variance = newVariance,
                    unit = i.unit
                )
            } else {
                i
            }
        }
        dashboardData.value = currentData.copy(items = updatedItems)

        // 3. Launch background Retrofit API post
        viewModelScope.launch {
            try {
                val request = ConsumptionAdjustmentRequest(
                    actualConsumption = amount,
                    incremental = true,
                    month = currentData.month,
                    year = currentData.year
                )
                val response = repository.logConsumption(item.id, request)
                if (response.isSuccessful && response.body()?.success == true) {
                    toastMessage.postValue(
                        if (amount > 0) "Logged +1 unit consumed for ${item.name}" 
                        else "Reduced consumption by 1 unit for ${item.name}"
                    )
                } else {
                    // Rollback if server rejects
                    dashboardData.postValue(previousData)
                    errorState.postValue(response.body()?.message ?: "Failed to adjust consumption")
                }
            } catch (e: Exception) {
                // Rollback on network failures
                dashboardData.postValue(previousData)
                errorState.postValue("Failed to adjust consumption: network error")
            }
        }
    }
}

class DashboardViewModelFactory(private val repository: DashboardRepository) : ViewModelProvider.Factory {
    override fun <T : ViewModel> create(modelClass: Class<T>): T {
        if (modelClass.isAssignableFrom(DashboardViewModel::class.java)) {
            @Suppress("UNCHECKED_CAST")
            return DashboardViewModel(repository) as T
        }
        throw IllegalArgumentException("Unknown ViewModel class")
    }
}
