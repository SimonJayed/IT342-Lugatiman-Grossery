package edu.cit.lugatiman.grossery.features.auth;


import edu.cit.lugatiman.grossery.payload.ApiResponse;
import edu.cit.lugatiman.grossery.payload.JwtAuthenticationResponse;
import edu.cit.lugatiman.grossery.security.JwtTokenProvider;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserService userService;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody UserDto userDto) {
        try {
            User user = userService.registerUser(userDto);
            return new ResponseEntity<>(
                    new ApiResponse(true, "User registered successfully", user),
                    HttpStatus.CREATED);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(new ApiResponse(false, e.getMessage()),
                    HttpStatus.BAD_REQUEST);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginDto loginDto) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginDto.getEmail(),
                            loginDto.getPassword()));

            SecurityContextHolder.getContext().setAuthentication(authentication);
            String jwt = tokenProvider.generateToken(authentication);

            User userDetails = userService.findByEmail(loginDto.getEmail())
                    .orElseThrow(() -> new RuntimeException("User not found after authentication"));

            return ResponseEntity.ok(new ApiResponse(true, "Login successful", new JwtAuthenticationResponse(
                    jwt,
                    userDetails.getEmail(),
                    userDetails.getFirstName(),
                    userDetails.getLastName())));
        } catch (org.springframework.security.core.AuthenticationException e) {
            return new ResponseEntity<>(
                    new ApiResponse(false, "Authentication failed: Invalid email or password"),
                    HttpStatus.UNAUTHORIZED);
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request) {
        return new ResponseEntity<>(new ApiResponse(true, "Logged out successfully"),
                HttpStatus.OK);
    }
}
