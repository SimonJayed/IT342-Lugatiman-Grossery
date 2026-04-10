package edu.cit.lugatiman.grossery

import android.content.Intent
import android.os.Bundle
import android.widget.Button
import android.widget.EditText
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.ViewModelProvider
import edu.cit.lugatiman.grossery.network.RetrofitClient
import edu.cit.lugatiman.grossery.repository.AuthRepository
import edu.cit.lugatiman.grossery.utils.TokenManager
import edu.cit.lugatiman.grossery.viewmodel.AuthViewModel
import edu.cit.lugatiman.grossery.viewmodel.AuthViewModelFactory

class RegisterActivity : AppCompatActivity() {

    private lateinit var viewModel: AuthViewModel

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_register)

        val apiService = RetrofitClient.getApiService(this)
        val repository = AuthRepository(apiService)
        val tokenManager = TokenManager(this)
        val factory = AuthViewModelFactory(repository, tokenManager)
        viewModel = ViewModelProvider(this, factory).get(AuthViewModel::class.java)

        val etFirstName = findViewById<EditText>(R.id.etFirstName)
        val etLastName = findViewById<EditText>(R.id.etLastName)
        val etEmail = findViewById<EditText>(R.id.etEmail)
        val etPassword = findViewById<EditText>(R.id.etPassword)
        val btnRegister = findViewById<Button>(R.id.btnRegister)
        val tvGoToLogin = findViewById<TextView>(R.id.tvGoToLogin)

        btnRegister.setOnClickListener {
            val fn = etFirstName.text.toString()
            val ln = etLastName.text.toString()
            val email = etEmail.text.toString()
            val password = etPassword.text.toString()

            if (fn.isNotEmpty() && ln.isNotEmpty() && email.isNotEmpty() && password.isNotEmpty()) {
                if (password.length < 6) {
                    Toast.makeText(this, "Password must be at least 6 characters", Toast.LENGTH_SHORT).show()
                } else {
                    viewModel.register(email, password, fn, ln)
                }
            } else {
                Toast.makeText(this, "Please enter all fields", Toast.LENGTH_SHORT).show()
            }
        }

        tvGoToLogin.setOnClickListener {
            finish() // Since they likely came from LoginActivity
        }

        viewModel.registerResult.observe(this) { result ->
            if (result.isSuccess) {
                Toast.makeText(this, "Registration Successful!", Toast.LENGTH_SHORT).show()
                startActivity(Intent(this, MainActivity::class.java))
                finishAffinity() // Clear stack
            } else {
                val error = result.exceptionOrNull()?.message ?: "Registration Failed"
                Toast.makeText(this, error, Toast.LENGTH_SHORT).show()
            }
        }
    }
}
