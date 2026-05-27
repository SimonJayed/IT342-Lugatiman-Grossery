package edu.cit.lugatiman.grossery.features.grocery

import edu.cit.lugatiman.grossery.model.ApiResponse
import edu.cit.lugatiman.grossery.network.ApiService
import retrofit2.Response

class GroceryRepository(private val apiService: ApiService) {
    
    suspend fun getGroceries(): Response<ApiResponse<List<GroceryItem>>> {
        return apiService.getGroceries()
    }

    suspend fun addGrocery(item: GroceryItem): Response<ApiResponse<GroceryItem>> {
        return apiService.addGrocery(item)
    }

    suspend fun updateGrocery(id: Long, item: GroceryItem): Response<ApiResponse<GroceryItem>> {
        return apiService.updateGrocery(id, item)
    }

    suspend fun deleteGrocery(id: Long): Response<ApiResponse<Void>> {
        return apiService.deleteGrocery(id)
    }
    
    suspend fun getExpiringSoon(): Response<ApiResponse<List<GroceryItem>>> {
        return apiService.getExpiringSoon()
    }

    suspend fun logConsumption(id: Long, consumptionData: Any): Response<ApiResponse<Any>> {
        return apiService.logConsumption(id, consumptionData)
    }

    suspend fun getMarketPrices(): Response<ApiResponse<Any>> {
        return apiService.getMarketPrices()
    }

    suspend fun getDashboardSummary(): Response<ApiResponse<Any>> {
        return apiService.getDashboardSummary()
    }
}
