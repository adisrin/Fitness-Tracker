# Fitness Tracker

A lightweight Java web application that runs a local HTTP server and delivers a personalized fitness planning tool in the browser. No frameworks, no external dependencies — just plain Java and vanilla HTML/CSS/JS.

## What It Does

A two-page wizard collects your personal details and fitness goal, then generates a structured, personalized plan covering:

- **Goal strategy** — tailored advice and food recommendations based on your goal and diet type
- **Calorie target** — daily calorie goal derived from your BMR, activity level, weight delta, and target date
- **Sleep assessment** — feedback on whether your sleep supports your fitness progress
- **Safety warnings** — flags overly aggressive timelines or dangerously low calorie targets

Form inputs are saved to `localStorage` so your data persists across page refreshes. The results page includes **Copy** and **Print** options.

## Supported Goals

| Goal | Description |
|---|---|
| Build Muscle / Gain Weight | Caloric surplus, resistance training, high protein |
| Lose Weight / Burn Fat | Caloric deficit, cardio + strength, portion control |
| Maintain Weight | Eat at maintenance, sustain body composition |
| Body Recomposition | Near-maintenance calories, high protein, lose fat while gaining muscle |
| Increase Strength | Progressive overload, modest surplus, compound lifts |
| Improve Endurance / Cardio | Progressive cardio, carb-focused fuelling, HIIT |
| Improve Flexibility / Mobility | Daily stretching/mobility work, anti-inflammatory diet |
| Any General Advice | Baseline maintenance calories and general healthy habits |

## Calorie Estimate

Maintenance calories are calculated using the **Mifflin-St Jeor BMR formula**, with gender taken into account:

| Gender | Formula |
|---|---|
| Male | `(10 × kg) + (6.25 × cm) − (5 × age) + 5` |
| Female | `(10 × kg) + (6.25 × cm) − (5 × age) − 161` |
| Other | Average of male and female formulas |

BMR is then multiplied by an **activity level multiplier** selected by the user:

| Activity Level | Multiplier |
|---|---|
| Sedentary | 1.2 |
| Lightly Active (1–3 days/week) | 1.375 |
| Moderately Active (3–5 days/week) | 1.55 |
| Very Active (6–7 days/week) | 1.725 |
| Extra Active (physical job + daily training) | 1.9 |

The daily calorie adjustment is calculated from the weight delta and target date using the 3,500 calories-per-pound rule.

## Tech Stack

| Layer    | Technology                          |
|----------|-------------------------------------|
| Server   | Java 17 — `com.sun.net.httpserver`  |
| Frontend | Vanilla HTML, CSS, JavaScript       |
| Build    | Maven (`pom.xml`)                   |

## Project Structure

```
Fitness Tracker/
├── src/
│   ├── App.java
│   └── com/fitnesstracker/
│       ├── FitnessHttpServer.java
│       ├── FitnessHtmlBuilder.java
│       ├── FitnessPageHandler.java
│       ├── StaticFileHandler.java
│       └── RedirectHandler.java
├── web/
│   ├── index.html
│   ├── app.js
│   └── styles.css
└── pom.xml
```

## Getting Started

### Prerequisites

- Java 17 or later
- Maven

### Run

```bash
mvn exec:java
```

Then open your browser and navigate to:

```
http://localhost:8080/fitness-tracker
```

### Build executable JAR

```bash
mvn package
java -jar target/fitness-tracker-1.0.0.jar
```
