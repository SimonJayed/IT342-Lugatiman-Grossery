package edu.cit.lugatiman.grossery

import android.content.Intent
import android.os.Bundle
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.GravityCompat
import androidx.drawerlayout.widget.DrawerLayout
import androidx.lifecycle.lifecycleScope
import com.google.android.material.navigation.NavigationView
import edu.cit.lugatiman.grossery.model.UserProfile
import edu.cit.lugatiman.grossery.model.ApiResponse
import edu.cit.lugatiman.grossery.network.ApiService
import edu.cit.lugatiman.grossery.network.RetrofitClient
import edu.cit.lugatiman.grossery.utils.TokenManager
import kotlinx.coroutines.launch

class MainActivity : BaseNavigationActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        // Navigation is handled by BaseNavigationActivity
    }
}