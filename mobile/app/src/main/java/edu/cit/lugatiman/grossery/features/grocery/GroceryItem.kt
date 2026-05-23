package edu.cit.lugatiman.grossery.features.grocery

data class GroceryItem(
    val id: Long? = null,
    val itemName: String,
    val categoryName: String? = null,
    val unit: String?,
    val expectedMonthlyConsumption: Double?,
    val expirationDate: String? = null,
    val receiptPaths: List<String>? = emptyList()
)
