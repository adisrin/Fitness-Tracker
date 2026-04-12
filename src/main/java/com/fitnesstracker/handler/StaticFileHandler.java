package com.fitnesstracker.handler;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;

import java.io.File;
import java.io.IOException;
import java.io.OutputStream;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;

public class StaticFileHandler implements HttpHandler {
    private final File baseDirectory;
    private final String urlPrefix;

    public StaticFileHandler(String baseDirectoryName, String urlPrefix) {
        this.baseDirectory = new File(System.getProperty("user.dir"), baseDirectoryName);
        this.urlPrefix = urlPrefix.endsWith("/") ? urlPrefix.substring(0, urlPrefix.length() - 1) : urlPrefix;
    }

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        String rawPath = exchange.getRequestURI().getPath();
        String path = URLDecoder.decode(rawPath, StandardCharsets.UTF_8.name());
        if (urlPrefix != null && path.startsWith(urlPrefix)) {
            path = path.substring(urlPrefix.length());
        }
        if (path.equals("") || path.equals("/")) {
            path = "/index.html";
        }

        File requestedFile = new File(baseDirectory, path);
        if (!requestedFile.getCanonicalPath().startsWith(baseDirectory.getCanonicalPath())
                || !requestedFile.exists()
                || !requestedFile.isFile()) {
            sendNotFound(exchange);
            return;
        }

        byte[] bytes = Files.readAllBytes(requestedFile.toPath());
        String contentType = getContentType(requestedFile.getName());
        exchange.getResponseHeaders().add("Content-Type", contentType + "; charset=UTF-8");
        exchange.sendResponseHeaders(200, bytes.length);
        try (OutputStream os = exchange.getResponseBody()) {
            os.write(bytes);
        }
    }

    private void sendNotFound(HttpExchange exchange) throws IOException {
        String message = "404 Not Found";
        exchange.getResponseHeaders().add("Content-Type", "text/plain; charset=UTF-8");
        exchange.sendResponseHeaders(404, message.getBytes(StandardCharsets.UTF_8).length);
        try (OutputStream os = exchange.getResponseBody()) {
            os.write(message.getBytes(StandardCharsets.UTF_8));
        }
    }

    private String getContentType(String fileName) {
        if (fileName.endsWith(".html")) {
            return "text/html";
        }
        if (fileName.endsWith(".css")) {
            return "text/css";
        }
        if (fileName.endsWith(".js")) {
            return "application/javascript";
        }
        if (fileName.endsWith(".json")) {
            return "application/json";
        }
        return "application/octet-stream";
    }
}
