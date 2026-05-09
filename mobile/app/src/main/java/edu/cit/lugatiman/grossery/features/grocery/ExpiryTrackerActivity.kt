package edu.cit.lugatiman.grossery.features.grocery

import android.os.Bundle
import edu.cit.lugatiman.grossery.BaseNavigationActivity
import edu.cit.lugatiman.grossery.R

class ExpiryTrackerActivity : BaseNavigationActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_expiry_tracker)
        // Navigation is handled by BaseNavigationActivity
    }
}
