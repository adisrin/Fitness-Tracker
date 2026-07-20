package com.fitnesstracker.handler;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;

import java.io.IOException;
import java.io.OutputStream;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;

public class ClaudeApiHandler implements HttpHandler {
    private static final String API_URL = "https://api.anthropic.com/v1/messages";
    private static final String MODEL = "claude-sonnet-4-6";
    private final Gson gson = new Gson();

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        exchange.getResponseHeaders().add("Access-Control-Allow-Origin", "*");
        exchange.getResponseHeaders().add("Access-Control-Allow-Methods", "POST, OPTIONS");
        exchange.getResponseHeaders().add("Access-Control-Allow-Headers", "Content-Type");

        if ("OPTIONS".equals(exchange.getRequestMethod())) {
            exchange.sendResponseHeaders(204, -1);
            return;
        }

        if (!"POST".equals(exchange.getRequestMethod())) {
            sendJson(exchange, 405, errorJson("Method not allowed"));
            return;
        }

        String apiKey = System.getenv("ANTHROPIC_API_KEY");
        if (apiKey == null || apiKey.isBlank()) {
            apiKey = System.getProperty("ANTHROPIC_API_KEY");
        }
        if (apiKey == null || apiKey.isBlank()) {
            sendJson(exchange, 500, errorJson("ANTHROPIC_API_KEY is not set. Pass it with: mvn exec:java -DANTHROPIC_API_KEY=your-key"));
            return;
        }

        String body = new String(exchange.getRequestBody().readAllBytes(), StandardCharsets.UTF_8);
        JsonObject requestJson = gson.fromJson(body, JsonObject.class);
        String question = requestJson.get("question").getAsString().trim();
        String planContext = requestJson.get("planContext").getAsString().trim();

        if (question.isEmpty()) {
            sendJson(exchange, 400, errorJson("Question cannot be empty"));
            return;
        }

        JsonObject claudeRequest = new JsonObject();
        claudeRequest.addProperty("model", MODEL);
        claudeRequest.addProperty("max_tokens", 1024);
        claudeRequest.addProperty("system",
            "You are a knowledgeable fitness and nutrition assistant. " +
            "The user has received the following personalised fitness plan:\n\n" +
            planContext + "\n\n" +
            "Answer their follow-up questions clearly and concisely. " +
            "Keep your advice consistent with this plan and their stated goals. " +
            "Do not repeat the full plan back — just address the question directly.");

        JsonArray messages = new JsonArray();
        JsonObject userMessage = new JsonObject();
        userMessage.addProperty("role", "user");
        userMessage.addProperty("content", question);
        messages.add(userMessage);
        claudeRequest.add("messages", messages);

        try {
            HttpClient client = HttpClient.newHttpClient();
            HttpRequest apiRequest = HttpRequest.newBuilder()
                .uri(URI.create(API_URL))
                .header("Content-Type", "application/json")
                .header("x-api-key", apiKey)
                .header("anthropic-version", "2023-06-01")
                .POST(HttpRequest.BodyPublishers.ofString(gson.toJson(claudeRequest)))
                .build();

            HttpResponse<String> apiResponse = client.send(apiRequest, HttpResponse.BodyHandlers.ofString());
            JsonObject responseJson = gson.fromJson(apiResponse.body(), JsonObject.class);

            if (responseJson.has("error")) {
                String errorMsg = responseJson.getAsJsonObject("error").get("message").getAsString();
                sendJson(exchange, 502, errorJson("Claude API error: " + errorMsg));
                return;
            }

            String answer = responseJson
                .getAsJsonArray("content")
                .get(0)
                .getAsJsonObject()
                .get("text")
                .getAsString();

            JsonObject result = new JsonObject();
            result.addProperty("answer", answer);
            sendJson(exchange, 200, gson.toJson(result));

        } catch (Exception e) {
            sendJson(exchange, 500, errorJson("Request failed: " + e.getMessage()));
        }
    }

    private String errorJson(String message) {
        JsonObject obj = new JsonObject();
        obj.addProperty("error", message);
        return gson.toJson(obj);
    }

    private void sendJson(HttpExchange exchange, int status, String json) throws IOException {
        byte[] bytes = json.getBytes(StandardCharsets.UTF_8);
        exchange.getResponseHeaders().add("Content-Type", "application/json; charset=UTF-8");
        exchange.sendResponseHeaders(status, bytes.length);
        try (OutputStream os = exchange.getResponseBody()) {
            os.write(bytes);
        }
    }
}
