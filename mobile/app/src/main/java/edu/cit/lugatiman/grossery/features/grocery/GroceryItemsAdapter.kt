package edu.cit.lugatiman.grossery.features.grocery

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import edu.cit.lugatiman.grossery.R
import java.util.Locale

class GroceryItemsAdapter(
    private val onOptionsClicked: (GroceryItem, View) -> Unit
) : RecyclerView.Adapter<GroceryItemsAdapter.ViewHolder>() {

    private var allItems: List<GroceryItem> = emptyList()
    private var filteredItems: List<GroceryItem> = emptyList()

    fun submitList(newList: List<GroceryItem>) {
        this.allItems = newList
        this.filteredItems = newList
        notifyDataSetChanged()
    }

    fun filter(query: String) {
        val cleanQuery = query.trim().lowercase(Locale.getDefault())
        filteredItems = if (cleanQuery.isEmpty()) {
            allItems
        } else {
            allItems.filter { 
                it.itemName.lowercase(Locale.getDefault()).contains(cleanQuery) || 
                (it.categoryName?.lowercase(Locale.getDefault())?.contains(cleanQuery) ?: false)
            }
        }
        notifyDataSetChanged()
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_grocery_item, parent, false)
        return ViewHolder(view)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        holder.bind(filteredItems[position], onOptionsClicked)
    }

    override fun getItemCount(): Int = filteredItems.size

    class ViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        private val tvCategoryIcon: TextView = itemView.findViewById(R.id.tvCategoryIcon)
        private val tvItemName: TextView = itemView.findViewById(R.id.tvItemName)
        private val tvSubDetails: TextView = itemView.findViewById(R.id.tvSubDetails)
        private val btnOptions: TextView = itemView.findViewById(R.id.btnOptions)

        fun bind(item: GroceryItem, onOptionsClicked: (GroceryItem, View) -> Unit) {
            tvItemName.text = item.itemName
            
            val category = item.categoryName ?: "UNASSIGNED"
            val expected = item.expectedMonthlyConsumption ?: 0.0
            val unitStr = item.unit ?: "units"
            tvSubDetails.text = String.format("%s • %.1f %s/month", category.uppercase(Locale.getDefault()), expected, unitStr)

            // Select fun emoji based on category name
            tvCategoryIcon.text = when (category.uppercase(Locale.getDefault())) {
                "PROTEIN", "MEAT", "EGGS", "POULTRY" -> "🥚"
                "DAIRY", "MILK" -> "🥛"
                "GRAINS", "RICE", "BREAD", "CARBS" -> "🌾"
                "PRODUCE", "FRUIT", "VEGETABLES" -> "🍎"
                "BEVERAGE", "DRINKS" -> "🥤"
                "SNACKS", "CHIPS" -> "🍿"
                "CONDIMENTS", "SPICES" -> "🧂"
                else -> "📦"
            }

            btnOptions.setOnClickListener { view ->
                onOptionsClicked(item, view)
            }
        }
    }
}
