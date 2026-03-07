# IT342-Lugatiman-Grossery (Phase 1)

## Project Description
Grossery is a full-stack grocery planning and tracking application designed to help users manage their monthly consumption, reduce food waste, and track item expiry dates. It features a secure Spring Boot 3.5.11 backend and a responsive ReactJS frontend.

## Technologies Used
- **Backend Framework**: Spring Boot 3.5.11 (edu.cit.lugatiman.grossery)
- **Security**: Spring Security 6.x, JWT (JSON Web Tokens), BCrypt
- **Database**: MySQL / PostgreSQL (Supabase ready), Spring Data JPA, Hibernate
- **Frontend Library**: ReactJS (Vite)
- **Styling**: Vanilla CSS, Custom Design System
- **Build Tools**: Maven (Backend), NPM (Frontend)

## Steps to Run Backend
1.  Navigate to the `/backend` directory.
2.  Ensure you have **MySQL** running and a database named `grossery_db` created.
    - *Note: The app is configured to `update` the schema automatically.*
3.  Run the application:
    ```bash
    mvnw spring-boot:run
    ```
4.  The backend will start on `http://localhost:8080`.

## Steps to Run Web App
1.  Navigate to the `/web` directory.
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the development server:
    ```bash
    npm run dev
    ```
4.  Open `http://localhost:5173` in your browser.

## Phase 1 Implementation Details
### Authentication
- **User Registration**: Requires First Name, Last Name, Email, and Password.
- **User Login**: Uses Email and Password (securely hashed with BCrypt).
- **Session**: State-less session management using JWT.

### Key API Endpoints
- `POST /api/auth/register` - Create a new account with split name fields.
- `POST /api/auth/login` - Authenticate via email only.
- `GET /api/user/me` - Retrieve current user details including first and last name.
