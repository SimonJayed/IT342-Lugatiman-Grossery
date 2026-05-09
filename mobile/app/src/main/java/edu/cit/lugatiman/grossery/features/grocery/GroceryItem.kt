package edu.cit.lugatiman.grossery.features.grocery

data class GroceryItem(
    val id: Long? = null,
    val itemName: String,
    val unit: String?,
    val expectedMonthlyConsumption: Double?,
    val expirationDate: String?
)
// Using primitive/simple types aligning with Phase 1 backend implementation constraints.
