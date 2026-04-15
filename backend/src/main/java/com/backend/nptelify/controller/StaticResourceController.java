package com.backend.nptelify.controller;

import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;

@RestController
public class StaticResourceController {

    @GetMapping("/favicon.ico")
    public ResponseEntity<byte[]> getFavicon() {
        try {
            // Try to load favicon from resources/static folder
            Resource resource = new ClassPathResource("static/favicon.ico");
            if (resource.exists()) {
                byte[] favicon = Files.readAllBytes(Paths.get(resource.getFile().toURI()));
                return ResponseEntity.ok()
                        .header(HttpHeaders.CONTENT_TYPE, "image/x-icon")
                        .header(HttpHeaders.CACHE_CONTROL, "public, max-age=31536000")
                        .body(favicon);
            }
        } catch (IOException e) {
            // Serve a fallback 1x1 transparent ICO if file not found
        }
        
        // Fallback: return a simple ICO data URI as bytes (1x1 transparent icon)
        byte[] fallbackIco = new byte[]{
            (byte)0x00, (byte)0x00, (byte)0x01, (byte)0x00, (byte)0x01, (byte)0x00, 
            (byte)0x20, (byte)0x20, (byte)0x00, (byte)0x00, (byte)0x01, (byte)0x00, 
            (byte)0x18, (byte)0x00, (byte)0x68, (byte)0x00, (byte)0x00, (byte)0x00, 
            (byte)0x20, (byte)0x00, (byte)0x00, (byte)0x00, (byte)0x40, (byte)0x00, 
            (byte)0x00, (byte)0x00, (byte)0x00, (byte)0x00, (byte)0x00, (byte)0x00, 
            (byte)0x00, (byte)0x00, (byte)0x00, (byte)0x00, (byte)0x00, (byte)0x00, 
            (byte)0x00, (byte)0x00, (byte)0x00, (byte)0x00, (byte)0x00, (byte)0x00, 
            (byte)0x00, (byte)0x00, (byte)0x00, (byte)0x00, (byte)0x00, (byte)0x00, 
            (byte)0x00, (byte)0x00, (byte)0x00, (byte)0x00, (byte)0x00, (byte)0x00, 
            (byte)0x00, (byte)0x00, (byte)0x00, (byte)0x00, (byte)0x00, (byte)0x00, 
            (byte)0x00, (byte)0x00, (byte)0x00, (byte)0x00, (byte)0x00, (byte)0x00, 
            (byte)0x00, (byte)0x00, (byte)0x00, (byte)0x00, (byte)0x00, (byte)0x00, 
            (byte)0x00, (byte)0x00, (byte)0x00, (byte)0x00, (byte)0x00, (byte)0x00, 
            (byte)0x00, (byte)0x00, (byte)0x00, (byte)0x00, (byte)0x00, (byte)0x00, 
            (byte)0x00, (byte)0x00
        };
        
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, "image/x-icon")
                .header(HttpHeaders.CACHE_CONTROL, "public, max-age=31536000")
                .body(fallbackIco);
    }
}
