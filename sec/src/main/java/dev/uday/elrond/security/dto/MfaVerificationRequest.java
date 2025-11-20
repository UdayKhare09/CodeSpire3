package dev.uday.elrond.security.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MfaVerificationRequest {
    @NotBlank(message = "TOTP code is required")
    private String totpCode;

    private String mfaToken; // Temporary token from login response
}

