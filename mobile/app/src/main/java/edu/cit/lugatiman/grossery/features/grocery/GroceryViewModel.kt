package edu.cit.lugatiman.grossery.features.grocery

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.launch

class GroceryViewModel(private val repository: GroceryRepository) : ViewModel() {

    private val _groceries = MutableLiveData<Result<List<GroceryItem>>>()
    val groceries: LiveData<Result<List<GroceryItem>>> = _groceries

    private val _expiringGroceries = MutableLiveData<Result<List<GroceryItem>>>()
    val expiringGroceries: LiveData<Result<List<GroceryItem>>> = _expiringGroceries

    private val _actionResult = MutableLiveData<Result<String>>()
    val actionResult: LiveData<Result<String>> = _actionResult

    fun fetchGroceries() {
        viewModelScope.launch {
            try {
                val response = repository.getGroceries()
                if (response.isSuccessful && response.body()?.success == true) {
                    _groceries.postValue(Result.success(response.body()?.data ?: emptyList()))
                } else {
                    _groceries.postValue(Result.failure(Exception(response.body()?.message ?: "Failed to fetch groceries")))
                }
            } catch (e: Exception) {
                _groceries.postValue(Result.failure(e))
            }
        }
    }

    fun addGrocery(item: GroceryItem) {
        viewModelScope.launch {
            try {
                val response = repository.addGrocery(item)
                if (response.isSuccessful && response.body()?.success == true) {
                    _actionResult.postValue(Result.success("Added Successfully"))
                    fetchGroceries() // refresh list
                } else {
                    _actionResult.postValue(Result.failure(Exception(response.body()?.message ?: "Failed to add")))
                }
            } catch (e: Exception) {
                _actionResult.postValue(Result.failure(e))
            }
        }
    }

    fun deleteGrocery(id: Long) {
        viewModelScope.launch {
            try {
                val response = repository.deleteGrocery(id)
                if (response.isSuccessful && response.body()?.success == true) {
                    _actionResult.postValue(Result.success("Deleted Successfully"))
                    fetchGroceries() // refresh list
                } else {
                    _actionResult.postValue(Result.failure(Exception(response.body()?.message ?: "Failed to delete")))
                }
            } catch (e: Exception) {
                _actionResult.postValue(Result.failure(e))
            }
        }
    }

    fun fetchExpiringSoon() {
        viewModelScope.launch {
            try {
                val response = repository.getExpiringSoon()
                if (response.isSuccessful && response.body()?.success == true) {
                    _expiringGroceries.postValue(Result.success(response.body()?.data ?: emptyList()))
                } else {
                    _expiringGroceries.postValue(Result.failure(Exception(response.body()?.message ?: "Failed to fetch expiring soon items")))
                }
            } catch (e: Exception) {
                _expiringGroceries.postValue(Result.failure(e))
            }
        }
    }
}

class GroceryViewModelFactory(private val repository: GroceryRepository) : ViewModelProvider.Factory {
    override fun <T : ViewModel> create(modelClass: Class<T>): T {
        if (modelClass.isAssignableFrom(GroceryViewModel::class.java)) {
            @Suppress("UNCHECKED_CAST")
            return GroceryViewModel(repository) as T
        }
        throw IllegalArgumentException("Unknown ViewModel class")
    }
}
