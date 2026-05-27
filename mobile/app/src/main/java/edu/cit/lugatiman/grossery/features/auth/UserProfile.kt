package edu.cit.lugatiman.grossery.features.auth

import edu.cit.lugatiman.grossery.R

data class UserProfile(
    val id: Long,
    val email: String,
    val firstName: String,
    val lastName: String,
    val role: String,
    val createdAt: String? = null
)
