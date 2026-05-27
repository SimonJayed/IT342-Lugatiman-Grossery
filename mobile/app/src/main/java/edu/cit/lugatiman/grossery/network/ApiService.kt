package edu.cit.lugatiman.grossery.network

import edu.cit.lugatiman.grossery.model.ApiResponse
import edu.cit.lugatiman.grossery.features.auth.AuthData
import edu.cit.lugatiman.grossery.features.grocery.GroceryItem
import edu.cit.lugatiman.grossery.features.auth.LoginRequest
import edu.cit.lugatiman.grossery.features.auth.RegisterRequest
import edu.cit.lugatiman.grossery.features.auth.UserProfile
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.DELETE
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.PUT
import retrofit2.http.Path

interface ApiService {

    @POST("auth/register")
    suspend fun register(@Body request: RegisterRequest): Response<ApiResponse<AuthData>>

    @POST("auth/login")
    suspend fun login(@Body request: LoginRequest): Response<ApiResponse<AuthData>>

    @GET("user/me")
    suspend fun getCurrentUser(): Response<ApiResponse<UserProfile>>

    @GET("groceries")
    suspend fun getGroceries(): Response<ApiResponse<List<GroceryItem>>>

    @POST("groceries")
    suspend fun addGrocery(@Body item: GroceryItem): Response<ApiResponse<GroceryItem>>

    @PUT("groceries/{id}")
    suspend fun updateGrocery(@Path("id") id: Long, @Body item: GroceryItem): Response<ApiResponse<GroceryItem>>

    @DELETE("groceries/{id}")
    suspend fun deleteGrocery(@Path("id") id: Long): Response<ApiResponse<Void>>

    @GET("groceries/expiring-soon")
    suspend fun getExpiringSoon(): Response<ApiResponse<List<GroceryItem>>>
    
    @GET("market-prices")
    suspend fun getMarketPrices(): Response<ApiResponse<Any>>

    @GET("dashboard/summary")
    suspend fun getDashboardSummary(): Response<ApiResponse<Any>>

    @GET("dashboard/comparison")
    suspend fun getDashboardComparison(): Response<ApiResponse<edu.cit.lugatiman.grossery.features.dashboard.DashboardComparison>>

    @POST("groceries/{id}/consumption")
    suspend fun logConsumption(
        @Path("id") id: Long,
        @Body data: Any
    ): Response<ApiResponse<Any>>

}
