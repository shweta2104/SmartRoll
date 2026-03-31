package com.smartroll.backend.controller;

public class LoginResponse {

    private Integer userId;
    private String email;
    private String username;
    private String name;
    private String role;
    private String token;

    public LoginResponse(Integer userId, String email, String username, String name, String role, String token) {
        this.userId = userId;
        this.email = email;
        this.username = username;
        this.name = name;
        this.role = role;
        this.token = token;
    }

    public Integer getUserId() {
        return userId;
    }

    public void setUserId(Integer userId) {
        this.userId = userId;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }
}
