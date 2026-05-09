package edu.cit.lugatiman.grossery.features.consumption

import android.os.Bundle
import edu.cit.lugatiman.grossery.BaseNavigationActivity
import edu.cit.lugatiman.grossery.R

class ConsumptionLogActivity : BaseNavigationActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_consumption_log)
        // Navigation is handled by BaseNavigationActivity
    }
}
