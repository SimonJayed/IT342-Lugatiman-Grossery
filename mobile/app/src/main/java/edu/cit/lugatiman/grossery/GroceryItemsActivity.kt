package edu.cit.lugatiman.grossery

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity

class GroceryItemsActivity : BaseNavigationActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_grocery_items)
        // Navigation is handled by BaseNavigationActivity
    }
}
