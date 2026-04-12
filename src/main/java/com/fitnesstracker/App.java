package com.fitnesstracker;

import com.fitnesstracker.server.FitnessHttpServer;

public class App {
    public static void main(String[] args) throws Exception {
        FitnessHttpServer.start(8080);
    }
}
