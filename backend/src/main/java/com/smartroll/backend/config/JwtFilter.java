package com.smartroll.backend.config;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.smartroll.backend.util.JwtUtil;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JwtFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(JwtFilter.class);

    @Autowired
    private JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        logger.debug("JwtFilter processing request: {} {}", request.getMethod(), request.getRequestURI());

        String header = request.getHeader("Authorization");
        logger.debug("Authorization header: {}", header != null ? header.substring(0, Math.min(50, header.length())) + "..." : "null");

        try {
            if (header != null && header.startsWith("Bearer ")) {
                String token = header.substring(7);
                logger.debug("Extracted token length: {}", token.length());

                if (!jwtUtil.validateToken(token)) {
                    logger.debug("Token validation FAILED");
                } else {
                    logger.debug("Token validation PASSED");
                    logger.debug("Getting claims...");
                    String email = jwtUtil.getEmailFromToken(token);
                    Integer userId = jwtUtil.getUserIdFromToken(token);
                    String role = jwtUtil.getRoleFromToken(token);
                    logger.debug("Claims - email: {}, role: {}, userId: {}", email, role, userId);

                    if (email != null && role != null) {
                        // Create authorities based on role
                        List<GrantedAuthority> authorities = new ArrayList<>();
                        authorities.add(new SimpleGrantedAuthority("ROLE_" + role.toUpperCase()));

                        // Create authentication token with authorities
                        Authentication auth = new UsernamePasswordAuthenticationToken(
                                email,
                                null,
                                authorities
                        );
                        SecurityContextHolder.getContext().setAuthentication(auth);
                        logger.debug("Authentication set for user: {} role: ROLE_{}", email, role.toUpperCase());
                    } else {
                        logger.debug("Claims missing email or role");
                    }
                }
            } else {
                logger.debug("No Bearer token found");
            }
        } catch (Exception e) {
            logger.error("Exception in JWT processing: {}", e.getMessage(), e);
        }

        filterChain.doFilter(request, response);
    }
}
