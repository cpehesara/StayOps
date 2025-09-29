package com.example.stayops.config;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class CloudinaryConfig {

    @Bean
    public Cloudinary cloudinary() {
        return new Cloudinary(ObjectUtils.asMap(
                "cloud_name", "di4v3fcqi",
                "api_key", "919748897531526",
                "api_secret", "BoPIMyYd48FK4QooxmoEU7JEckU",
                "secure", true
        ));
    }
}
