package edu.cit.lugatiman.grossery.viewmodel

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import edu.cit.lugatiman.grossery.model.AuthData
import edu.cit.lugatiman.grossery.model.LoginRequest
import edu.cit.lugatiman.grossery.model.RegisterRequest
import edu.cit.lugatiman.grossery.repository.AuthRepository
import edu.cit.lugatiman.grossery.utils.TokenManager
import kotlinx.coroutines.launch

class AuthViewModel(
    private val repository: AuthRepository,
    private val tokenManager: TokenManager
) : ViewModel() {

    private val _loginResult = MutableLiveData<Result<AuthData>>()
    val loginResult: LiveData<Result<AuthData>> = _loginResult

    private val _registerResult = MutableLiveData<Result<AuthData>>()
    val registerResult: LiveData<Result<AuthData>> = _registerResult

    fun login(email: String, pass: String) {
        viewModelScope.launch {
            try {
                val response = repository.login(LoginRequest(email, pass))
                if (response.isSuccessful && response.body()?.success == true) {
                    val authData = response.body()?.data
                    authData?.accessToken?.let { tokenManager.saveToken(it) }
                    _loginResult.postValue(Result.success(authData!!))
                } else {
                    val errorMsg = response.body()?.message ?: "Login failed (Invalid Credentials)"
                    _loginResult.postValue(Result.failure(Exception(errorMsg)))
                }
            } catch (e: Exception) {
                _loginResult.postValue(Result.failure(e))
            }
        }
    }

    fun register(email: String, pass: String, firstName: String, lastName: String) {
        viewModelScope.launch {
            try {
                val req = RegisterRequest(email, pass, firstName, lastName)
                val response = repository.register(req)
                if (response.isSuccessful && response.body()?.success == true) {
                    val authData = response.body()?.data
                    _registerResult.postValue(Result.success(authData!!))
                } else {
                    _registerResult.postValue(Result.failure(Exception(response.body()?.message ?: "Registration failed")))
                }
            } catch (e: Exception) {
                _registerResult.postValue(Result.failure(e))
            }
        }
    }
}

class AuthViewModelFactory(
    private val repository: AuthRepository,
    private val tokenManager: TokenManager
) : ViewModelProvider.Factory {
    override fun <T : ViewModel> create(modelClass: Class<T>): T {
        if (modelClass.isAssignableFrom(AuthViewModel::class.java)) {
            @Suppress("UNCHECKED_CAST")
            return AuthViewModel(repository, tokenManager) as T
        }
        throw IllegalArgumentException("Unknown ViewModel class")
    }
}
