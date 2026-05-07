package edu.cit.lugatiman.grossery

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity

class ExpiryTrackerActivity : BaseNavigationActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_expiry_tracker)
        // Navigation is handled by BaseNavigationActivity
    }
}
