# Project Description
Grossery is a full-stack grocery planning and tracking application designed to help users manage their monthly consumption, reduce food waste, and track item expiry dates. It features a secure Spring Boot backend and a responsive ReactJS frontend.

## Technologies Used
- **Backend Framework:** Spring Boot 3.x
- **Security:** Spring Security, JWT (JSON Web Tokens), BCrypt
- **Database:** MySQL, Spring Data JPA, Hibernate
- **Frontend Library:** ReactJS (Vite)
- **Styling:** CSS Modules, Custom Design System
- **Build Tools:** Maven (Backend), NPM (Frontend)

## Steps to Run Backend
1. Open the `/backend` folder in your IDE (IntelliJ IDEA recommended).
2. Ensure you have MySQL running and a database named `grossery_db` created.  
   *Note: The app is configured to update the schema automatically.*
3. Run the application via the main class `GrosseryApplication.java` or use the terminal:
   ```bash
   cd backend
   ./mvnw spring-boot:run
   ```
   The backend will start on `http://localhost:8080`.

## Steps to Run Web App
1. Navigate to the `/web` directory.
2. Install dependencies:
   ```bash
   cd web
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

## Steps to Run Mobile App
1. Open the `/mobile` directory in Android Studio.
2. Wait for Gradle to sync.
3. Ensure the Spring Boot backend is running (Required for Auth).  
   *Note: The app is configured to connect to `10.0.2.2:8080`, which works for the Android Emulator to reach localhost.*
4. Run the app on an Android Emulator or physical device.

## Features implemented:
- User Registration & Login.
- Protected Dashboard with profile details.
- Secure Logout.

## List of API Endpoints
### Authentication
- `POST /api/auth/register` - Register a new user account.
- `POST /api/auth/login` - Authenticate and receive a JWT.
- `POST /api/auth/logout` - Logout (Client-side token removal).

### User Profile
- `GET /api/user/me` - Retrieve the currently authenticated user's profile.

### Grocery Management (Upcoming)
- `GET /api/items` - List grocery items.
- `POST /api/items` - Add a new item.
