package com.fitnesstracker.handler;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;

import java.io.IOException;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;

public class RedirectHandler implements HttpHandler {
    private final String targetUrl;

    public RedirectHandler(String targetUrl) {
        this.targetUrl = targetUrl;
    }

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        byte[] response = ("Redirecting to " + targetUrl).getBytes(StandardCharsets.UTF_8);
        exchange.getResponseHeaders().add("Location", targetUrl);
        exchange.getResponseHeaders().add("Content-Type", "text/plain; charset=UTF-8");
        exchange.sendResponseHeaders(302, response.length);
        try (OutputStream os = exchange.getResponseBody()) {
            os.write(response);
        }
    }
}
