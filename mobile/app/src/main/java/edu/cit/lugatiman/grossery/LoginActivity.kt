package edu.cit.lugatiman.grossery

import android.content.Intent
import android.os.Bundle
import android.widget.Button
import android.widget.EditText
import android.widget.LinearLayout
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.ViewModelProvider
import edu.cit.lugatiman.grossery.network.ApiService
import edu.cit.lugatiman.grossery.network.RetrofitClient
import edu.cit.lugatiman.grossery.repository.AuthRepository
import edu.cit.lugatiman.grossery.utils.TokenManager
import edu.cit.lugatiman.grossery.viewmodel.AuthViewModel
import edu.cit.lugatiman.grossery.viewmodel.AuthViewModelFactory

class LoginActivity : AppCompatActivity() {

    private lateinit var viewModel: AuthViewModel

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_login)

        val apiService = RetrofitClient.getClient(this).create(ApiService::class.java)
        val repository = AuthRepository(apiService)
        val tokenManager = TokenManager(this)
        val factory = AuthViewModelFactory(repository, tokenManager)
        viewModel = ViewModelProvider(this, factory).get(AuthViewModel::class.java)

        val etEmail = findViewById<EditText>(R.id.etEmail)
        val etPassword = findViewById<EditText>(R.id.etPassword)
        val btnLogin = findViewById<Button>(R.id.btnLogin)
        val tvGoToRegister = findViewById<LinearLayout>(R.id.tvGoToRegister)

        btnLogin.setOnClickListener {
            val email = etEmail.text.toString()
            val password = etPassword.text.toString()
            if (email.isNotEmpty() && password.isNotEmpty()) {
                viewModel.login(email, password)
            } else {
                Toast.makeText(this, "Please enter all fields", Toast.LENGTH_SHORT).show()
            }
        }

        tvGoToRegister.setOnClickListener {
            startActivity(Intent(this, RegisterActivity::class.java))
        }

        viewModel.loginResult.observe(this) { result ->
            if (result.isSuccess) {
                Toast.makeText(this, "Login Successful! Welcome.", Toast.LENGTH_SHORT).show()
                startActivity(Intent(this, MainActivity::class.java))
                finish()
            } else {
                val error = result.exceptionOrNull()?.message ?: "Login Failed"
                Toast.makeText(this, error, Toast.LENGTH_SHORT).show()
            }
        }
    }
}
