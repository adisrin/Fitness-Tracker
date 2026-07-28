package com.fitnesstracker.handler;

import com.google.gson.JsonArray;
import com.google.gson.JsonObject;

final class ClaudeResponseParser {
    private ClaudeResponseParser() {}

    static String extractText(JsonObject responseJson) {
        String text = extractTextOrEmpty(responseJson);
        if (text.isEmpty()) {
            throw new IllegalStateException("Claude response did not contain a text block: " + responseJson);
        }
        return text;
    }

    /**
     * Joins every text block in the response. Returns "" when there are none — which happens on a
     * turn that is only a tool call.
     */
    static String extractTextOrEmpty(JsonObject responseJson) {
        JsonArray content = responseJson.getAsJsonArray("content");
        if (content == null) {
            return "";
        }
        StringBuilder joined = new StringBuilder();
        for (int i = 0; i < content.size(); i++) {
            JsonObject block = content.get(i).getAsJsonObject();
            if ("text".equals(blockField(block, "type")) && block.has("text")) {
                if (joined.length() > 0) {
                    joined.append("\n\n");
                }
                joined.append(block.get("text").getAsString());
            }
        }
        return joined.toString();
    }

    /** Returns the tool_use block for the given tool name, or null if the response has none. */
    static JsonObject findToolUse(JsonObject responseJson, String toolName) {
        JsonArray content = responseJson.getAsJsonArray("content");
        if (content == null) {
            return null;
        }
        for (int i = 0; i < content.size(); i++) {
            JsonObject block = content.get(i).getAsJsonObject();
            if ("tool_use".equals(blockField(block, "type")) && toolName.equals(blockField(block, "name"))) {
                return block;
            }
        }
        return null;
    }

    private static String blockField(JsonObject block, String field) {
        if (!block.has(field) || block.get(field).isJsonNull()) {
            return null;
        }
        return block.get(field).getAsString();
    }
}
