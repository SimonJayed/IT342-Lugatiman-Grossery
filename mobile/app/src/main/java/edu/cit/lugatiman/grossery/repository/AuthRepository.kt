package edu.cit.lugatiman.grossery.repository

import edu.cit.lugatiman.grossery.model.ApiResponse
import edu.cit.lugatiman.grossery.model.AuthData
import edu.cit.lugatiman.grossery.model.LoginRequest
import edu.cit.lugatiman.grossery.model.RegisterRequest
import edu.cit.lugatiman.grossery.network.ApiService
import retrofit2.Response

class AuthRepository(private val apiService: ApiService) {
    
    suspend fun login(request: LoginRequest): Response<ApiResponse<AuthData>> {
        return apiService.login(request)
    }

    suspend fun register(request: RegisterRequest): Response<ApiResponse<AuthData>> {
        return apiService.register(request)
    }
}
