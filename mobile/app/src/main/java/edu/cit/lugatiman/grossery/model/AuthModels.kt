package edu.cit.lugatiman.grossery.model

data class AuthData(
    val id: Long? = null,
    val accessToken: String? = null,
    val tokenType: String? = null,
    val email: String,
    val firstName: String,
    val lastName: String,
    val role: String
)

data class LoginRequest(
    val email: String,
    val password: String
)

data class RegisterRequest(
    val email: String,
    val password: String,
    val firstName: String,
    val lastName: String
)
