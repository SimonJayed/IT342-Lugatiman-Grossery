package edu.cit.lugatiman.grossery.features.grocery

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.core.content.ContextCompat
import androidx.recyclerview.widget.RecyclerView
import edu.cit.lugatiman.grossery.R
import java.time.LocalDate
import java.time.format.DateTimeFormatter
import java.time.temporal.ChronoUnit
import java.util.Locale

class ExpiryTrackerAdapter : RecyclerView.Adapter<ExpiryTrackerAdapter.ViewHolder>() {

    private var items: List<GroceryItem> = emptyList()

    fun submitList(newList: List<GroceryItem>) {
        this.items = newList
        notifyDataSetChanged()
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_expiry_item, parent, false)
        return ViewHolder(view)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        holder.bind(items[position])
    }

    override fun getItemCount(): Int = items.size

    class ViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        private val tvExpiryItemName: TextView = itemView.findViewById(R.id.tvExpiryItemName)
        private val tvExpiryBadge: TextView = itemView.findViewById(R.id.tvExpiryBadge)
        private val tvExpiryDetails: TextView = itemView.findViewById(R.id.tvExpiryDetails)
        private val tvExpiryCountdown: TextView = itemView.findViewById(R.id.tvExpiryCountdown)

        fun bind(item: GroceryItem) {
            val context = itemView.context
            val name = item.itemName
            val category = item.categoryName ?: "UNASSIGNED"
            val expected = item.expectedMonthlyConsumption ?: 0.0
            val unitStr = item.unit ?: "units"
            val expDateStr = item.expirationDate ?: "No date"

            // Select category emoji
            val emoji = when (category.uppercase(Locale.getDefault())) {
                "PROTEIN", "MEAT", "EGGS", "POULTRY" -> "🥚"
                "DAIRY", "MILK" -> "🥛"
                "GRAINS", "RICE", "BREAD", "CARBS" -> "🌾"
                "PRODUCE", "FRUIT", "VEGETABLES" -> "🍎"
                "BEVERAGE", "DRINKS" -> "🥤"
                "SNACKS", "CHIPS" -> "🍿"
                "CONDIMENTS", "SPICES" -> "🧂"
                else -> "📦"
            }

            tvExpiryItemName.text = String.format("%s %s", emoji, name)
            tvExpiryDetails.text = String.format("%.1f %s • %s", expected, unitStr, expDateStr)

            // Date calculations
            if (item.expirationDate != null) {
                try {
                    val expirationDate = LocalDate.parse(item.expirationDate)
                    val today = LocalDate.now()
                    val daysBetween = ChronoUnit.DAYS.between(today, expirationDate)

                    when {
                        daysBetween < 0 -> {
                            // Expired
                            tvExpiryBadge.text = "EXPIRED"
                            tvExpiryBadge.setTextColor(ContextCompat.getColor(context, R.color.error))
                            tvExpiryCountdown.text = String.format("%dd ago", Math.abs(daysBetween))
                            tvExpiryCountdown.setTextColor(ContextCompat.getColor(context, R.color.error))
                        }
                        daysBetween <= 3 -> {
                            // Expiring soon (Orange)
                            tvExpiryBadge.text = "EXPIRING SOON"
                            val orangeColor = ContextCompat.getColor(context, R.color.warning)
                            tvExpiryBadge.setTextColor(orangeColor)
                            tvExpiryCountdown.text = String.format("%d days left", daysBetween)
                            tvExpiryCountdown.setTextColor(orangeColor)
                        }
                        else -> {
                            // Fresh (Green)
                            tvExpiryBadge.text = "FRESH"
                            tvExpiryBadge.setTextColor(ContextCompat.getColor(context, R.color.primary))
                            tvExpiryCountdown.text = String.format("%d days left", daysBetween)
                            tvExpiryCountdown.setTextColor(ContextCompat.getColor(context, R.color.primary))
                        }
                    }
                } catch (e: Exception) {
                    tvExpiryBadge.text = "UNKNOWN"
                    tvExpiryBadge.setTextColor(ContextCompat.getColor(context, R.color.text_hint))
                    tvExpiryCountdown.text = "Invalid Date"
                    tvExpiryCountdown.setTextColor(ContextCompat.getColor(context, R.color.text_hint))
                }
            } else {
                tvExpiryBadge.text = "NO DATE"
                tvExpiryBadge.setTextColor(ContextCompat.getColor(context, R.color.text_hint))
                tvExpiryCountdown.text = "Infinite shelf life"
                tvExpiryCountdown.setTextColor(ContextCompat.getColor(context, R.color.text_hint))
            }
        }
    }
}
