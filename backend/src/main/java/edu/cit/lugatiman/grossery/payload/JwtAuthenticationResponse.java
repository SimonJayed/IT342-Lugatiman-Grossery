package edu.cit.lugatiman.grossery.payload;

import lombok.Data;

@Data
public class JwtAuthenticationResponse {
    private String accessToken;
    private String tokenType = "Bearer";
    private String email;
    private String firstName;
    private String lastName;

    public JwtAuthenticationResponse(String accessToken, String email, String firstName, String lastName) {
        this.accessToken = accessToken;
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
    }
}
