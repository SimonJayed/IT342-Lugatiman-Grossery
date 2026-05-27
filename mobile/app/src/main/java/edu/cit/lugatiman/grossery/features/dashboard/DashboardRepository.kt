package edu.cit.lugatiman.grossery.features.dashboard

import edu.cit.lugatiman.grossery.model.ApiResponse
import edu.cit.lugatiman.grossery.network.ApiService
import edu.cit.lugatiman.grossery.features.grocery.GroceryItem
import retrofit2.Response

class DashboardRepository(private val apiService: ApiService) {

    suspend fun getDashboardComparison(): Response<ApiResponse<DashboardComparison>> {
        return apiService.getDashboardComparison()
    }

    suspend fun getExpiringSoon(): Response<ApiResponse<List<GroceryItem>>> {
        return apiService.getExpiringSoon()
    }

    suspend fun logConsumption(id: Long, request: ConsumptionAdjustmentRequest): Response<ApiResponse<Any>> {
        return apiService.logConsumption(id, request)
    }
}
