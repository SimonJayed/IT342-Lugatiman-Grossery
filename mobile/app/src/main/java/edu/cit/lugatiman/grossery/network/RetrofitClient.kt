package edu.cit.lugatiman.grossery.network

import android.content.Context
import edu.cit.lugatiman.grossery.utils.TokenManager
import okhttp3.OkHttpClient
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

object RetrofitClient {
    // If your backend API itself is deployed to Railway, swap this BASE_URL to your railway domain.
    // E.g. https://my-backend.up.railway.app/api/
    private const val BASE_URL = "http://10.0.2.2:8080/api/" 

    private var retrofit: Retrofit? = null

    fun getClient(context: Context): Retrofit {
        if (retrofit == null) {
            val tokenManager = TokenManager(context)
            val authInterceptor = AuthInterceptor(tokenManager)
            
            val client = OkHttpClient.Builder()
                .addInterceptor(authInterceptor)
                .build()

            retrofit = Retrofit.Builder()
                .baseUrl(BASE_URL)
                .client(client)
                .addConverterFactory(GsonConverterFactory.create())
                .build()
        }
        return retrofit!!
    }
}
