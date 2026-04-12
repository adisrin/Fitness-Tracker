# Fitness Tracker

A lightweight Java web application that runs a local HTTP server and delivers a personalized fitness planning tool in the browser. No frameworks, no external dependencies — just plain Java and vanilla HTML/CSS/JS.

## What It Does

Enter your height, weight, age, fitness goal, diet type, and target date. The app calculates your estimated maintenance calories using the Mifflin-St Jeor formula and generates a personalized plan that tells you:

- Your estimated daily maintenance calories
- A daily calorie target (surplus to gain, deficit to lose)
- Diet-specific food recommendations tailored to non-vegetarian, vegetarian, or vegan preferences
- Safety warnings if your timeline or weekly pace is too aggressive

## Supported Goals

- Gaining Weight
- Gaining Muscle
- Losing Weight
- Losing Fat
- Proper Diet
- General Advice

## Tech Stack

| Layer    | Technology                          |
|----------|-------------------------------------|
| Server   | Java — `com.sun.net.httpserver`     |
| Frontend | Vanilla HTML, CSS, JavaScript       |
| Build    | `javac` (no external build tool)    |

## Project Structure

Fitness Tracker/
├── src/
│   ├── App.java                              # Entry point — starts server on port 8080
│   └── com/fitnesstracker/
│       ├── FitnessHttpServer.java            # Configures and starts the HTTP server
│       ├── FitnessHtmlBuilder.java           # Generates the full HTML/CSS/JS page
│       ├── FitnessPageHandler.java           # HTTP handler that serves the generated page
│       ├── StaticFileHandler.java            # Serves static files from /web
│       └── RedirectHandler.java             # Redirects / to /fitness-tracker
└── web/
├── index.html
├── app.js
└── styles.css



## Getting Started

### Prerequisites

- Java 11 or later

### Compile

```bash
javac -d bin src/App.java src/com/fitnesstracker/*.java
Run

java -cp bin App
Open your browser and navigate to:


http://localhost:8080/fitness-tracker
How the Calorie Estimate Works
Maintenance calories are estimated using a simplified Mifflin-St Jeor BMR multiplied by a sedentary activity factor (1.4):


BMR = (10 × weight_kg) + (6.25 × height_cm) − (5 × age) + 5
Maintenance ≈ BMR × 1.4
The daily calorie adjustment is then calculated from the weight delta and target date, using the 3,500 calories-per-pound rule.
