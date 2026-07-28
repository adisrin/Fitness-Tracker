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

public class DirectChatHandler implements HttpHandler {
    private static final String API_URL = "https://api.anthropic.com/v1/messages";
    private static final String MODEL = "claude-sonnet-5";
    private static final String DETAILS_TOOL = "collect_personal_details";

    /** Safety net so a misbehaving loop can't call the API forever. */
    private static final int MAX_ROUNDS = 3;

    private static final String SYSTEM_PROMPT =
        "You are a knowledgeable fitness and nutrition assistant embedded in a fitness tracker app. " +
        "The user has chosen to skip the manual intake form and talk to you directly instead. " +
        "When the user uploads a photo of a meal, analyze it and give an approximate breakdown of calories, " +
        "protein, carbs, and fat, clearly stating these are estimates. " +
        "When you need their height, weight, age, gender, activity level, or goal in order to give calorie " +
        "or macro targets, call the " + DETAILS_TOOL + " tool rather than asking for those numbers in chat. " +
        "The app then opens its step-by-step details form, and their answers are combined with the meals " +
        "discussed here into a single full plan. Call that tool at most once per conversation. " +
        "You can still answer general questions, and give rough photo estimates, without the form. " +
        "Keep responses conversational, clear, and concise.";

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
        JsonObject requestJson;
        JsonArray messages;
        try {
            requestJson = gson.fromJson(body, JsonObject.class);
            messages = requestJson.getAsJsonArray("messages");
        } catch (Exception e) {
            sendJson(exchange, 400, errorJson("Malformed request body"));
            return;
        }

        if (messages == null || messages.size() == 0) {
            sendJson(exchange, 400, errorJson("messages cannot be empty"));
            return;
        }

        // Once the form has been offered, stop offering the tool so the user isn't nagged.
        boolean detailsAlreadyRequested = requestJson.has("detailsRequested")
            && !requestJson.get("detailsRequested").isJsonNull()
            && requestJson.get("detailsRequested").getAsBoolean();

        try {
            HttpClient client = HttpClient.newHttpClient();
            boolean collectDetails = false;
            String answer = "";
            String toolReason = "";

            for (int round = 0; round < MAX_ROUNDS; round++) {
                // The tool is only offered while it hasn't fired yet — after that we want plain text back.
                boolean offerTool = !detailsAlreadyRequested && !collectDetails;
                JsonObject claudeRequest = buildRequest(messages, offerTool);

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

                String text = ClaudeResponseParser.extractTextOrEmpty(responseJson);
                if (!text.isBlank()) {
                    answer = text;
                }

                JsonObject toolUse = ClaudeResponseParser.findToolUse(responseJson, DETAILS_TOOL);
                if (toolUse == null) {
                    break;
                }

                collectDetails = true;
                toolReason = readReason(toolUse);

                // Standard tool round-trip: echo the assistant turn back, then answer the tool call.
                // The "result" here is simply that the UI has opened the form for the user.
                messages.add(assistantTurn(responseJson.getAsJsonArray("content")));
                messages.add(toolResultTurn(toolUse.get("id").getAsString(),
                    "The personal details form is now open for the user. In one or two sentences, tell them to "
                        + "fill it in, and mention that the meals from this chat will be taken into account in the "
                        + "plan they get. Do not ask for their measurements again here."));
            }

            if (answer.isBlank()) {
                answer = !toolReason.isBlank()
                    ? toolReason
                    : "I need a few details about you to go further. Fill in the form and I'll factor this chat into your plan.";
            }

            JsonObject result = new JsonObject();
            result.addProperty("answer", answer);
            if (collectDetails) {
                result.addProperty("action", "collect_details");
            }
            sendJson(exchange, 200, gson.toJson(result));

        } catch (Exception e) {
            sendJson(exchange, 500, errorJson("Request failed: " + e.getMessage()));
        }
    }

    private JsonObject buildRequest(JsonArray messages, boolean offerTool) {
        JsonObject claudeRequest = new JsonObject();
        claudeRequest.addProperty("model", MODEL);
        claudeRequest.addProperty("max_tokens", 1500);
        claudeRequest.addProperty("system", SYSTEM_PROMPT);
        claudeRequest.add("messages", messages);
        if (offerTool) {
            JsonArray tools = new JsonArray();
            tools.add(detailsTool());
            claudeRequest.add("tools", tools);
        }
        return claudeRequest;
    }

    private JsonObject detailsTool() {
        JsonObject reason = new JsonObject();
        reason.addProperty("type", "string");
        reason.addProperty("description",
            "One short sentence telling the user why their measurements are needed. Shown next to the button "
                + "that opens the form.");

        JsonObject properties = new JsonObject();
        properties.add("reason", reason);

        JsonArray required = new JsonArray();
        required.add("reason");

        JsonObject schema = new JsonObject();
        schema.addProperty("type", "object");
        schema.add("properties", properties);
        schema.add("required", required);

        JsonObject tool = new JsonObject();
        tool.addProperty("name", DETAILS_TOOL);
        tool.addProperty("description",
            "Open the app's step-by-step personal details form, which collects height, weight, age, gender, "
                + "activity level, goal, target date, and hours of sleep. Call this when you need the user's "
                + "measurements to give calorie or macro targets. Their answers are combined with the meal photos "
                + "and notes from this chat to produce a full plan, so this is better than asking for the numbers "
                + "one at a time in conversation.");
        tool.add("input_schema", schema);
        return tool;
    }

    private JsonObject assistantTurn(JsonArray content) {
        JsonObject message = new JsonObject();
        message.addProperty("role", "assistant");
        message.add("content", content);
        return message;
    }

    private JsonObject toolResultTurn(String toolUseId, String resultText) {
        JsonObject toolResult = new JsonObject();
        toolResult.addProperty("type", "tool_result");
        toolResult.addProperty("tool_use_id", toolUseId);
        toolResult.addProperty("content", resultText);

        JsonArray content = new JsonArray();
        content.add(toolResult);

        JsonObject message = new JsonObject();
        message.addProperty("role", "user");
        message.add("content", content);
        return message;
    }

    private String readReason(JsonObject toolUse) {
        if (!toolUse.has("input") || !toolUse.get("input").isJsonObject()) {
            return "";
        }
        JsonObject input = toolUse.getAsJsonObject("input");
        if (!input.has("reason") || input.get("reason").isJsonNull()) {
            return "";
        }
        return input.get("reason").getAsString();
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
