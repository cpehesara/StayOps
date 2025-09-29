package com.example.stayops.security;

import com.example.stayops.service.impl.GuestUserDetailsService;
import com.example.stayops.util.JwtUtil;
import io.jsonwebtoken.ExpiredJwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class JwtRequestFilter extends OncePerRequestFilter {

    private final GuestUserDetailsService userDetailsService;
    private final JwtUtil jwtUtil;

    /**
     * PUBLIC_ENDPOINTS contains ant-style patterns where appropriate.
     * "/api/rooms/**" will match /api/rooms/create, /api/rooms/getAll etc.
     */
    private static final List<String> PUBLIC_ENDPOINTS = List.of(
            "/api/v1/guests/create",
            "/api/v1/guests/register",
            "/api/v1/guests/getAll",
            "/api/v1/auth/login",
            "/api/v1/auth/validate",
            "/api/receptionists/register",
            "/api/hotels/**",
            "/api/room-status-history/**",
            "/api/rooms/**",
            "/api/reservations/**",
            "/api/amenities/**",
            "/api/departments/**",
            "/api/v1/guests/**",
            "/api/reservation-details/**",
            "/api/receptionists/**",
            "/api/staff/**",
            "/api/debug/**"
    );

    private final AntPathMatcher pathMatcher = new AntPathMatcher();

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {

        final String requestTokenHeader = request.getHeader("Authorization");
        final String requestURI = request.getRequestURI();
        final String method = request.getMethod();

        log.info("=== JWT FILTER DEBUG ===");
        log.info("Method: {}", method);
        log.info("URI: {}", requestURI);
        log.info("Authorization Header: {}", requestTokenHeader != null ? "Present" : "Not Present");

        // Skip JWT processing for public endpoints and OPTIONS requests
        if (isPublicEndpoint(requestURI) || "OPTIONS".equalsIgnoreCase(method)) {
            log.info("SKIPPING JWT processing for public endpoint: {}", requestURI);
            chain.doFilter(request, response);
            return;
        }

        log.info("PROCESSING JWT for protected endpoint: {}", requestURI);

        String username = null;
        String jwtToken = null;

        // JWT Token is in the form "Bearer token". Remove Bearer word and get only the Token
        if (requestTokenHeader != null && requestTokenHeader.startsWith("Bearer ")) {
            jwtToken = requestTokenHeader.substring(7);
            try {
                username = jwtUtil.getUsernameFromToken(jwtToken);
                log.info("JWT token found for user: {}", username);
            } catch (IllegalArgumentException e) {
                log.error("Unable to get JWT Token: {}", e.getMessage());
            } catch (ExpiredJwtException e) {
                log.error("JWT Token has expired: {}", e.getMessage());
            } catch (Exception e) {
                log.error("JWT Token processing error: {}", e.getMessage());
            }
        } else {
            log.warn("No Bearer token found for protected endpoint: {}", requestURI);
        }

        // Once we get the token validate it.
        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            try {
                UserDetails userDetails = this.userDetailsService.loadUserByUsername(username);

                // if token is valid configure Spring Security to manually set authentication
                if (jwtUtil.validateToken(jwtToken, userDetails)) {
                    UsernamePasswordAuthenticationToken usernamePasswordAuthenticationToken =
                            new UsernamePasswordAuthenticationToken(
                                    userDetails, null, userDetails.getAuthorities());
                    usernamePasswordAuthenticationToken
                            .setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(usernamePasswordAuthenticationToken);
                    log.info("Authentication set successfully for user: {}", username);
                } else {
                    log.warn("JWT token validation failed for user: {}", username);
                }
            } catch (Exception e) {
                log.error("Authentication error for user {}: {}", username, e.getMessage());
            }
        }
        log.info("=== END JWT FILTER DEBUG ===");
        chain.doFilter(request, response);
    }

    private boolean isPublicEndpoint(String requestURI) {
        for (String endpoint : PUBLIC_ENDPOINTS) {
            // Ant-style pattern match (supports /**)
            if (pathMatcher.match(endpoint, requestURI) || requestURI.startsWith(endpoint)) {
                log.info("Endpoint {} matches public pattern: {}", requestURI, endpoint);
                return true;
            }
        }
        log.warn("Endpoint {} does NOT match any public patterns", requestURI);
        log.info("Available public patterns: {}", PUBLIC_ENDPOINTS);
        return false;
    }
}
