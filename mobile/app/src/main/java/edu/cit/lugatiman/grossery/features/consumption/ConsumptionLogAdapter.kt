package edu.cit.lugatiman.grossery.features.consumption

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.core.content.ContextCompat
import androidx.recyclerview.widget.RecyclerView
import edu.cit.lugatiman.grossery.R
import edu.cit.lugatiman.grossery.features.dashboard.ComparisonItem

class ConsumptionLogAdapter(
    private val onAdjustmentClicked: (ComparisonItem, Double) -> Unit
) : RecyclerView.Adapter<ConsumptionLogAdapter.ViewHolder>() {

    private var items: List<ComparisonItem> = emptyList()

    fun submitList(newItems: List<ComparisonItem>) {
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
            .inflate(R.layout.item_consumption_log, parent, false)
        return ViewHolder(view)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        holder.bind(items[position], onAdjustmentClicked)
    }

    override fun getItemCount(): Int = items.size

    class ViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        private val tvItemName: TextView = itemView.findViewById(R.id.tvItemName)
        private val tvStatusBadge: TextView = itemView.findViewById(R.id.tvStatusBadge)
        private val tvExpectedText: TextView = itemView.findViewById(R.id.tvExpectedText)
        private val tvActualText: TextView = itemView.findViewById(R.id.tvActualText)
        private val tvVarianceText: TextView = itemView.findViewById(R.id.tvVarianceText)
        private val btnMinus: TextView = itemView.findViewById(R.id.btnMinus)
        private val btnPlus: TextView = itemView.findViewById(R.id.btnPlus)

        fun bind(item: ComparisonItem, onAdjustmentClicked: (ComparisonItem, Double) -> Unit) {
            val context = itemView.context
            tvItemName.text = item.name

            val unitStr = item.unit ?: "units"
            tvExpectedText.text = String.format("Expected: %.1f %s", item.expected, unitStr)
            tvActualText.text = String.format("Actual: %.1f", item.actual)

            val variance = item.variance
            tvVarianceText.text = String.format("Variance: %s%.1f %s", if (variance > 0.0) "+" else "", variance, unitStr)

            // Setup variance styles and status badges dynamically
            when {
                variance > 0.0 -> {
                    tvStatusBadge.text = "OVER"
                    tvStatusBadge.setTextColor(ContextCompat.getColor(context, R.color.error))
                    tvVarianceText.setTextColor(ContextCompat.getColor(context, R.color.error))
                }
                variance < 0.0 -> {
                    tvStatusBadge.text = "UNDER"
                    val orangeColor = ContextCompat.getColor(context, R.color.warning)
                    tvStatusBadge.setTextColor(orangeColor)
                    tvVarianceText.setTextColor(orangeColor)
                }
                else -> {
                    tvStatusBadge.text = "BALANCED"
                    tvStatusBadge.setTextColor(ContextCompat.getColor(context, R.color.primary))
                    tvVarianceText.setTextColor(ContextCompat.getColor(context, R.color.primary))
                }
            }

            // Bind inline bidirectional pills
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
