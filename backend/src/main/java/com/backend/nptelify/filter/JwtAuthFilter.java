package com.backend.nptelify.filter;

import com.backend.nptelify.service.JwtService;
import com.backend.nptelify.service.UserDetailsServiceImpl;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(JwtAuthFilter.class);
    private final JwtService jwtService;
    private final UserDetailsServiceImpl userDetailsService;

    public JwtAuthFilter(JwtService jwtService, UserDetailsServiceImpl userDetailsService) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
        String path = request.getRequestURI();
        String lowercase = path.toLowerCase();
        
        // Skip JWT filter for:
        // - Root path, static assets, images, css, js, fonts
        // - HTML files, Auth endpoints
        return path.equals("/") ||
               path.equals("/favicon.ico") || 
               lowercase.endsWith(".png") ||
               lowercase.endsWith(".jpg") ||
               lowercase.endsWith(".jpeg") ||
               lowercase.endsWith(".gif") ||
               lowercase.endsWith(".svg") ||
               lowercase.endsWith(".ico") ||
               lowercase.endsWith(".css") ||
               lowercase.endsWith(".js") ||
               lowercase.endsWith(".map") ||
               lowercase.endsWith(".webfont") ||
               lowercase.endsWith(".ttf") ||
               lowercase.endsWith(".woff") ||
               lowercase.endsWith(".woff2") ||
               path.startsWith("/static/") || 
               path.startsWith("/assets/") ||
               path.startsWith("/public/") ||
               path.endsWith(".html") ||
               path.startsWith("/api/auth/");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");
        String method = request.getMethod();
        String path = request.getRequestURI();
        
        logger.info("🔍 JwtAuthFilter: {} {}", method, path);
        
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            logger.warn("⚠️  No Bearer token found. Authorization header: {}", authHeader);
            filterChain.doFilter(request, response);
            return;
        }

        String jwt = authHeader.substring(7);
        String username;
        try {
            username = jwtService.extractUsername(jwt);
            logger.info("✓ Token valid for user: {}", username);
        } catch (Exception e) {
            logger.error("❌ Token validation failed: {}", e.getMessage());
            filterChain.doFilter(request, response);
            return;
        }

        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userDetails = userDetailsService.loadUserByUsername(username);
            if (jwtService.isTokenValid(jwt, userDetails)) {
                UsernamePasswordAuthenticationToken authToken =
                        new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
                logger.info("✓ Authentication set for user: {}", username);
            } else {
                logger.warn("⚠️  Token invalid for user: {}", username);
            }
        }
        filterChain.doFilter(request, response);
    }
}
