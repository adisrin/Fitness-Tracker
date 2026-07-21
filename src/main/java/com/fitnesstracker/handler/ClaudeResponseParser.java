package com.fitnesstracker.handler;

import com.google.gson.JsonArray;
import com.google.gson.JsonObject;

final class ClaudeResponseParser {
    private ClaudeResponseParser() {}

    static String extractText(JsonObject responseJson) {
        JsonArray content = responseJson.getAsJsonArray("content");
        if (content != null) {
            for (int i = 0; i < content.size(); i++) {
                JsonObject block = content.get(i).getAsJsonObject();
                if (block.has("text")) {
                    return block.get("text").getAsString();
                }
            }
        }
        throw new IllegalStateException("Claude response did not contain a text block: " + responseJson);
    }
}
