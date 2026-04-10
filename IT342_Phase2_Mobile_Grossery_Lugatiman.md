# IT342 Phase 2 – Mobile Development Completed

**Project:** Grossery System  
**Developer:** Lugatiman  

## 1. How Registration Works
The mobile registration screen (`activity_register.xml`) provides an intuitive form gathering the user's First Name, Last Name, Email, and Password. Upon pressing the "Register" button, the `RegisterActivity.kt` mathematically intercepts the inputs and validates them (ensuring all fields are populated and the password exceeds the minimum 6-character requirement).

If validation passes, the data is pushed through the secure MVVM architecture. The request flows from the `AuthViewModel` to the `AuthRepository`. Here, the repository seamlessly triggers a suspended Coroutine function to fire the payload to our existing Spring Boot backend. 

Upon a 200 OK Response from the server, the application stores the returning JSON Web Token (JWT) locally and automatically redirects the user into the `MainActivity`. If the backend returns a failure (e.g., "Email already in use"), a Toast message instantly displays the server's error message.

## 2. How Login Works
The login process occurs natively on `activity_login.xml`. Here, users are presented with a streamlined interface asking for only their Email and Password. Upon clicking "Login," `LoginActivity.kt` captures the fields and verifies they are not null before emitting the request.

This call triggers the `login()` function inside `AuthViewModel`, packaging the request up to the remote Java server. The backend intercepts the payload, cross-references the hashed BCrypt password against the MySQL database, and returns a verified JWT. The mobile app automatically caches this authorization token dynamically using Encrypted `SharedPreferences` (or Context wrapper logic) inside the `TokenManager`.
Once finalized, the LiveData listener in the View successfully navigates the user straight to the authenticated side of the application.

## 3. API Integration Used
To bind the mobile client closely with our Phase 1 backend, we instituted a robust **Retrofit2** Network pipeline. 
- **Endpoint 1:** `POST /api/auth/register` - Marshalls the `RegisterRequest` Data Class containing JSON fields for name/email/pass.
- **Endpoint 2:** `POST /api/auth/login` - Uses the `LoginRequest` Data Class to fetch the `AuthData` containing the JWT.

All Retrofit network calls are executed inside safe Kotlin Coroutine blocks mapped directly onto the `ApiService.kt` interface. This ensures all REST communications are executed strictly on background worker threads, preventing UI lockups and dropping parsed GSON models smoothly into the primary thread to trigger UI navigation.
