package edu.cit.lugatiman.grossery.features.dashboard

data class DashboardComparison(
    val month: String,
    val year: Int,
    val items: List<ComparisonItem>
)

data class ComparisonItem(
    val id: Long,
    val name: String,
    val expected: Double,
    var actual: Double,      // var so we can update it optimistically in memory
    var variance: Double,    // var so we can update it optimistically in memory
    val unit: String?
)

data class ConsumptionAdjustmentRequest(
    val actualConsumption: Double,
    val incremental: Boolean = true,
    val month: String,
    val year: Int
)
