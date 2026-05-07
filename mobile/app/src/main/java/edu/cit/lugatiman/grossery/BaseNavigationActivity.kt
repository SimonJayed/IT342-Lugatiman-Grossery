package edu.cit.lugatiman.grossery

import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.LinearLayout
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.GravityCompat
import androidx.drawerlayout.widget.DrawerLayout
import androidx.lifecycle.lifecycleScope
import edu.cit.lugatiman.grossery.model.ApiResponse
import edu.cit.lugatiman.grossery.model.UserProfile
import edu.cit.lugatiman.grossery.network.ApiService
import edu.cit.lugatiman.grossery.network.RetrofitClient
import edu.cit.lugatiman.grossery.utils.TokenManager
import kotlinx.coroutines.launch

abstract class BaseNavigationActivity : AppCompatActivity() {

    protected lateinit var drawerLayout: DrawerLayout
    protected lateinit var tokenManager: TokenManager
    protected lateinit var apiService: ApiService

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        tokenManager = TokenManager(this)
        apiService = RetrofitClient.getClient(this).create(ApiService::class.java)
    }

    override fun setContentView(layoutResID: Int) {
        super.setContentView(layoutResID)
        setupNavigation()
    }

    protected fun setupNavigation() {
        drawerLayout = findViewById(R.id.drawerLayout) ?: return
        val btnMenu = findViewById<TextView>(R.id.btnMenu)

        btnMenu?.setOnClickListener {
            drawerLayout.openDrawer(GravityCompat.START)
        }

        // Setup Custom Sidebar Item Clicks
        setupSidebarItem(R.id.nav_dashboard)
        setupSidebarItem(R.id.nav_items)
        setupSidebarItem(R.id.nav_logs)
        setupSidebarItem(R.id.nav_expiry)
        setupSidebarItem(R.id.nav_profile)
        setupSidebarItem(R.id.nav_logout)

        // Highlight current page
        highlightCurrentPage()

        // Set dynamic page title
        val tvPageTitle = findViewById<TextView>(R.id.tvPageTitle)
        tvPageTitle?.text = when (this) {
            is MainActivity -> "Dashboard"
            is GroceryItemsActivity -> "Grocery Items"
            is ConsumptionLogActivity -> "Consumption Log"
            is ExpiryTrackerActivity -> "Expiry Tracker"
            is ProfileActivity -> "User Profile"
            else -> "Grossery"
        }

        // Sidebar Profile Footer Views
        val navName = findViewById<TextView>(R.id.nav_footer_name)
        val navEmail = findViewById<TextView>(R.id.nav_footer_email)
        val navInitial = findViewById<TextView>(R.id.nav_footer_initial)

        lifecycleScope.launch {
            try {
                val response = apiService.getCurrentUser()
                if (response.isSuccessful && response.body()?.success == true) {
                    val userProfile: UserProfile? = response.body()?.data
                    navName?.text = "${userProfile?.firstName} ${userProfile?.lastName}"
                    navEmail?.text = userProfile?.email
                    navInitial?.text = userProfile?.firstName?.firstOrNull()?.toString()?.uppercase() ?: "G"
                }
            } catch (e: Exception) {
                // Ignore silent fail for header
            }
        }
    }

    private fun highlightCurrentPage() {
        val currentId = when (this) {
            is MainActivity -> R.id.nav_dashboard
            is GroceryItemsActivity -> R.id.nav_items
            is ConsumptionLogActivity -> R.id.nav_logs
            is ExpiryTrackerActivity -> R.id.nav_expiry
            is ProfileActivity -> R.id.nav_profile
            else -> -1
        }

        if (currentId != -1) {
            val row = findViewById<LinearLayout>(currentId)
            row?.setBackgroundResource(R.color.nav_selected_bg)
            
            // Show indicator
            val indicatorId = when (currentId) {
                R.id.nav_dashboard -> R.id.indicator_dashboard
                R.id.nav_items -> R.id.indicator_items
                R.id.nav_logs -> R.id.indicator_logs
                R.id.nav_expiry -> R.id.indicator_expiry
                R.id.nav_profile -> R.id.indicator_profile
                else -> -1
            }
            if (indicatorId != -1) {
                findViewById<View>(indicatorId)?.visibility = View.VISIBLE
            }

            // Highight text/icons to white for contrast
            for (i in 0 until (row?.childCount ?: 0)) {
                val child = row?.getChildAt(i)
                if (child is TextView) {
                    child.setTextColor(resources.getColor(R.color.white, theme))
                }
            }
        }
    }

    private fun setupSidebarItem(id: Int) {
        findViewById<View>(id)?.setOnClickListener {
            handleNavigation(id)
            drawerLayout.closeDrawer(GravityCompat.START)
        }
    }

    private fun handleNavigation(itemId: Int) {
        when (itemId) {
            R.id.nav_dashboard -> {
                if (this !is MainActivity) {
                    val intent = Intent(this, MainActivity::class.java)
                    intent.flags = Intent.FLAG_ACTIVITY_REORDER_TO_FRONT
                    startActivity(intent)
                }
            }
            R.id.nav_items -> {
                if (this !is GroceryItemsActivity) {
                    startActivity(Intent(this, GroceryItemsActivity::class.java))
                }
            }
            R.id.nav_logs -> {
                if (this !is ConsumptionLogActivity) {
                    startActivity(Intent(this, ConsumptionLogActivity::class.java))
                }
            }
            R.id.nav_expiry -> {
                if (this !is ExpiryTrackerActivity) {
                    startActivity(Intent(this, ExpiryTrackerActivity::class.java))
                }
            }
            R.id.nav_profile -> {
                if (this !is ProfileActivity) {
                    startActivity(Intent(this, ProfileActivity::class.java))
                }
            }
            R.id.nav_logout -> {
                tokenManager.deleteToken()
                val intent = Intent(this, LoginActivity::class.java)
                intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
                startActivity(intent)
                finish()
            }
        }
    }
}
