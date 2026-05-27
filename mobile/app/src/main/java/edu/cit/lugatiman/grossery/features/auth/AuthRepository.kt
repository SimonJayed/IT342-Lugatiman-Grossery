package edu.cit.lugatiman.grossery.features.auth

import edu.cit.lugatiman.grossery.network.ApiService
import retrofit2.Response

class AuthRepository(private val apiService: ApiService) {
    
    suspend fun login(request: LoginRequest): Response<edu.cit.lugatiman.grossery.model.ApiResponse<AuthData>> {
        return apiService.login(request)
    }

    suspend fun register(request: RegisterRequest): Response<edu.cit.lugatiman.grossery.model.ApiResponse<AuthData>> {
        return apiService.register(request)
    }
}
