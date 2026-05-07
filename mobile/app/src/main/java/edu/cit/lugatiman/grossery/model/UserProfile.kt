package edu.cit.lugatiman.grossery.model

data class UserProfile(
    val id: Long,
    val email: String,
    val firstName: String,
    val lastName: String,
    val role: String,
    val createdAt: String? = null
)
