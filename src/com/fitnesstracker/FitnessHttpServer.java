package com.fitnesstracker;

import com.sun.net.httpserver.HttpServer;

import java.net.InetSocketAddress;

public class FitnessHttpServer {
    public static void start(int port) throws Exception {
        HttpServer server = HttpServer.create(new InetSocketAddress(port), 0);
        server.createContext("/fitness-tracker", new StaticFileHandler("web", "/fitness-tracker"));
        server.createContext("/", new RedirectHandler("/fitness-tracker"));
        server.setExecutor(null);
        server.start();
        System.out.println("Fitness Tracker started: http://localhost:" + port + "/fitness-tracker");
    }
}
