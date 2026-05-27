package edu.cit.lugatiman.grossery.features.dashboard

import android.content.res.ColorStateList
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ProgressBar
import android.widget.TextView
import androidx.core.content.ContextCompat
import androidx.recyclerview.widget.RecyclerView
import edu.cit.lugatiman.grossery.R

class DashboardItemsAdapter(
    private val onAdjustmentClicked: (ComparisonItem, Double) -> Unit
) : RecyclerView.Adapter<DashboardItemsAdapter.ViewHolder>() {

    private var items: List<ComparisonItem> = emptyList()

    fun submitList(newItems: List<ComparisonItem>) {
        // Deep copy list to ensure RecyclerView bindings don't reference modified references directly without rendering updates
        this.items = newItems.map { 
            ComparisonItem(
                id = it.id,
                name = it.name,
                expected = it.expected,
                actual = it.actual,
                variance = it.variance,
                unit = it.unit
            )
        }
        notifyDataSetChanged()
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_dashboard_comparison, parent, false)
        return ViewHolder(view)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        holder.bind(items[position], onAdjustmentClicked)
    }

    override fun getItemCount(): Int = items.size

    class ViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        private val tvItemName: TextView = itemView.findViewById(R.id.tvItemName)
        private val tvMetricProgress: TextView = itemView.findViewById(R.id.tvMetricProgress)
        private val pbConsumption: ProgressBar = itemView.findViewById(R.id.pbConsumption)
        private val btnMinus: TextView = itemView.findViewById(R.id.btnMinus)
        private val btnPlus: TextView = itemView.findViewById(R.id.btnPlus)

        fun bind(item: ComparisonItem, onAdjustmentClicked: (ComparisonItem, Double) -> Unit) {
            val context = itemView.context
            tvItemName.text = item.name
            
            val unitStr = item.unit ?: "units"
            tvMetricProgress.text = String.format("%.1f / %.1f %s", item.actual, item.expected, unitStr)

            // Calculate percentage
            val progressPercent = if (item.expected > 0.0) {
                ((item.actual / item.expected) * 100).toInt()
            } else {
                0
            }
            pbConsumption.progress = Math.min(100, progressPercent)

            // Style Progress Bar color based on consumption status
            val isOverBudget = item.actual > item.expected
            val barColor = if (isOverBudget) {
                ContextCompat.getColor(context, R.color.error)
            } else {
                ContextCompat.getColor(context, R.color.primary)
            }
            pbConsumption.progressTintList = ColorStateList.valueOf(barColor)

            // Setup Bidirectional Quick Log click listeners
            btnPlus.setOnClickListener {
                onAdjustmentClicked(item, 1.0)
            }

            if (item.actual <= 0.0) {
                btnMinus.alpha = 0.35f
                btnMinus.isClickable = false
                btnMinus.setOnClickListener(null)
            } else {
                btnMinus.alpha = 1.0f
                btnMinus.isClickable = true
                btnMinus.setOnClickListener {
                    onAdjustmentClicked(item, -1.0)
                }
            }
        }
    }
}
