# Fitness Tracker

A lightweight Java web application that runs a local HTTP server and delivers a personalized fitness planning tool in the browser. No web framework — just plain Java, vanilla HTML/CSS/JS, and the Claude API for the conversational features.

## What It Does

From the home screen you choose how to start:

| Entry point | What it does |
|---|---|
| **Ask Me Directly** | Chat with Claude, ask fitness and nutrition questions, and attach meal photos for calorie & macro estimates |
| **Enter Details Manually** | Fill out a two-step form and get a structured, personalized plan |

### The generated plan

The manual path collects your personal details and fitness goal, then generates a plan covering:

- **Goal strategy** — tailored advice and food recommendations based on your goal and diet type
- **Calorie target** — daily calorie goal derived from your BMR, activity level, weight delta, and target date
- **Sleep assessment** — feedback on whether your sleep supports your fitness progress
- **Safety warnings** — flags overly aggressive timelines or dangerously low calorie targets

Form inputs are saved to `localStorage` so your data persists across page refreshes. The results page includes **Copy**, **Print**, and **Start Over** options.

### Ask about your plan

Below the generated plan is a Q&A box. Questions are sent to Claude along with the full text of your plan, so answers stay consistent with the goals and calorie targets you were given.

### Ask Claude directly

The direct chat skips the form entirely. Attach photos of meals and Claude estimates calories, protein, carbs, and fat.

When Claude needs your measurements to give real calorie or macro targets, it doesn't ask for them one at a time — it calls a `collect_personal_details` tool, and the app surfaces a **Fill in my details** button that routes you into the step-by-step form. A text summary of the chat (including Claude's photo estimates) is carried across, so the generated plan ends with a **From Your Meal Chat** section and the plan's Q&A can reason about those meals against your calorie target.

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
| AI       | Claude API (`claude-sonnet-5`) via `/v1/messages` |
| JSON     | Gson                                |
| Build    | Maven (`pom.xml`)                   |

## HTTP Routes

| Route | Handler | Purpose |
|---|---|---|
| `/fitness-tracker` | `StaticFileHandler` | Serves `web/` (HTML, CSS, JS) |
| `/fitness-tracker/api/ask` | `ClaudeApiHandler` | Plan follow-up questions (`question` + `planContext`) |
| `/fitness-tracker/api/direct-chat` | `DirectChatHandler` | Direct chat and meal-photo analysis (`messages`, `detailsRequested`). Runs a tool-use loop; replies with `action: "collect_details"` when Claude wants the details form |
| `/` | `RedirectHandler` | Redirects to `/fitness-tracker` |

## Project Structure

```
Fitness Tracker/
├── src/main/java/com/fitnesstracker/
│   ├── App.java
│   ├── handler/
│   │   ├── ClaudeApiHandler.java       # /api/ask — plan Q&A
│   │   ├── ClaudeResponseParser.java   # extracts text from Claude responses
│   │   ├── DirectChatHandler.java      # /api/direct-chat — chat + meal photos
│   │   ├── RedirectHandler.java
│   │   └── StaticFileHandler.java
│   └── server/
│       └── FitnessHttpServer.java      # route registration
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
- An Anthropic API key — required for both chat features (the plan itself is calculated locally and works without one)

### Run

Pass your API key as an environment variable:

```bash
export ANTHROPIC_API_KEY=your-key
mvn exec:java
```

Or as a system property:

```bash
mvn exec:java -DANTHROPIC_API_KEY=your-key
```

Then open your browser and navigate to:

```
http://localhost:8080/fitness-tracker
```

If the key is missing, the app still runs and generates plans — the chat endpoints return an error explaining how to set it.

### Build executable JAR

```bash
mvn package
java -jar target/fitness-tracker-1.0.0.jar
```
