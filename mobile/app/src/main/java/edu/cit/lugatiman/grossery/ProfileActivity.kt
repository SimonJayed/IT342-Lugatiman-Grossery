package edu.cit.lugatiman.grossery

import android.content.Intent
import android.os.Bundle
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import edu.cit.lugatiman.grossery.model.UserProfile
import edu.cit.lugatiman.grossery.model.ApiResponse
import edu.cit.lugatiman.grossery.network.ApiService
import edu.cit.lugatiman.grossery.network.RetrofitClient
import edu.cit.lugatiman.grossery.utils.TokenManager
import kotlinx.coroutines.launch

class ProfileActivity : BaseNavigationActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_profile)

        val tvName = findViewById<TextView>(R.id.tvProfileName)
        val tvEmail = findViewById<TextView>(R.id.tvProfileEmail)
        val tvRole = findViewById<TextView>(R.id.tvProfileRole)
        val btnLogout = findViewById<TextView>(R.id.btnProfileLogout)

        // Navigation and profile fetching for sidebar is handled by base class
        // We still fetch once for the main profile card here
        lifecycleScope.launch {
            try {
                val response = apiService.getCurrentUser()
                if (response.isSuccessful && response.body()?.success == true) {
                    val userProfile: UserProfile? = response.body()?.data
                    tvName.text = "${userProfile?.firstName} ${userProfile?.lastName}"
                    tvEmail.text = userProfile?.email
                    tvRole.text = userProfile?.role
                }
            } catch (e: Exception) {
                Toast.makeText(this@ProfileActivity, "Error: ${e.message}", Toast.LENGTH_SHORT).show()
            }
        }

        btnLogout.setOnClickListener {
            tokenManager.deleteToken()
            val intent = Intent(this, LoginActivity::class.java)
            intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
            startActivity(intent)
            finish()
        }
    }
}
