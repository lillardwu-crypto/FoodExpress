package com.foodexpress.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig
        implements WebSocketMessageBrokerConfigurer {

    /**
     * Registers the WebSocket endpoint.
     *
     * Frontend connects to:
     *
     * ws://localhost:8080/ws
     */
    @Override
    public void registerStompEndpoints(
            StompEndpointRegistry registry
    ) {

        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*")
                .withSockJS();
    }

    /**
     * Configures the message broker.
     *
     * Client publish:
     *
     * /app/**
     *
     * Server push:
     *
     * /topic/**
     */
    @Override
    public void configureMessageBroker(
            MessageBrokerRegistry registry
    ) {

        // Messages sent from client
        registry.setApplicationDestinationPrefixes(
                "/app"
        );

        // Messages pushed by server
        registry.enableSimpleBroker(
                "/topic"
        );
    }
}