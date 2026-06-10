package com.smartroll.backend.dto;

import jakarta.validation.constraints.NotBlank;

public class AttendanceQrVerifyRequest {

    @NotBlank
    private String tokenValue;

    public AttendanceQrVerifyRequest() {}

    public String getTokenValue() {
        return tokenValue;
    }

    public void setTokenValue(String tokenValue) {
        this.tokenValue = tokenValue;
    }
}

