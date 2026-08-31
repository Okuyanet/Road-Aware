# 🚗 Road Aware

### Predictive, route-aware traffic intelligence for safer journeys

**Road Aware** is a headless traffic-intelligence layer that transforms crowdsourced vehicle telemetry into predictive traffic events and time-critical driving decisions.

Instead of simply reporting *where traffic is*, Road Aware reasons about **where congestion is moving, how quickly it is growing, whether it is likely to affect a driver's route, and whether the driver should be warned now**.

> **Detect the road. Predict the impact. Alert only when it matters.**

---

## 🌐 Live Demo

### Web Application

**https://road-aware.ai.studio**

### Live Cloud Run API

**https://road-aware-api2-745521609480.us-central1.run.app**

### Interactive API Documentation

**https://road-aware-api2-745521609480.us-central1.run.app/docs**

### OpenAPI Specification

**https://road-aware-api2-745521609480.us-central1.run.app/openapi.json**

---

# 💡 The Problem

Traditional traffic information often answers:

> **"Where is traffic right now?"**

Road Aware aims to answer a more useful question:

> **"Will this traffic affect me, and if so, when should I act?"**

A traffic event several kilometres ahead may be irrelevant if a driver can safely divert before reaching it.

The same event can become critical when the driver is approaching the **last viable exit**.

Road Aware therefore combines traffic dynamics, route context, historical patterns and confidence signals before deciding whether to recommend an action.

---

# 🛣️ Three Road Aware Experiences

## 1. Pre-Journey Briefing

Before a journey starts, Road Aware can brief a driver about known conditions along the planned route.

Examples include:

* road works
* incidents
* developing congestion
* recurring bottlenecks
* expected delays
* available alternatives

The goal is to help drivers **start the journey informed**.

---

## 2. In-Journey Diversion

During a journey, Road Aware evaluates whether a developing traffic event is likely to affect the driver's route.

The decision can consider:

* current vehicle position
* traffic-event location
* queue growth
* distance to congestion
* distance to the last viable exit
* expected delay
* alternative routes
* direction confidence
* likelihood of encountering the event
* historical traffic patterns

The agent can recommend:

```text
REROUTE_NOW
MAINTAIN_ROUTE
DO_NOT_ALERT
```

Rather than simply notifying whenever congestion exists, Road Aware attempts to determine **whether an intervention is useful for this driver at this moment**.

---

## 3. Collective Telemetry

Participating vehicles can contribute movement observations to the traffic intelligence layer.

A driver does not need to manually report:

> "Traffic is bad here."

Their movement itself becomes a signal.

Multiple observations can be combined across space and time to identify:

* abnormal slowing
* queue formation
* queue boundaries
* congestion growth
* propagation direction

This creates a participatory road-awareness loop:

```text
Vehicles
   ↓
Telemetry
   ↓
Traffic Intelligence
   ↓
Predictive Traffic Event
   ↓
Driver Awareness
   ↓
Safer Decisions
   ↓
More Participating Vehicles
```

---

# 🧠 Traffic Intelligence Pipeline

Road Aware's core engine converts individual vehicle observations into a structured `TrafficEvent`.

The prototype uses six stages.

---

## 1. Microscopic Car-Following & Telemetry Simulation

Vehicle movement is simulated using a car-following model.

Vehicles:

* accelerate when the road ahead is clear
* decelerate when approaching another vehicle
* slow or stop when entering a queue
* maintain individual vehicle state
* generate synthetic GPS observations
* include measurement noise

This produces telemetry representing participating vehicles.

---

## 2. Spatio-Temporal Discretization

Continuous observations are transformed into a traffic speed field.

The road is divided into spatial segments of approximately 100 metres.

Telemetry is aggregated using rolling temporal windows.

For each segment, Road Aware calculates:

* median speed
* distinct vehicle count
* temporal speed behaviour

Aggregation reduces the influence of individual driver behaviour and exposes collective traffic conditions.

---

## 3. Corroborated Queue Detection

A segment is classified as congested when its median speed falls below a defined percentage of the normal baseline.

Road Aware also requires multiple vehicles to corroborate the observation.

This allows the system to estimate:

```text
queue_start_m
queue_end_m
queue_length_m
```

rather than treating a single slow vehicle as a traffic jam.

---

## 4. Shockwave Dynamics & Growth Forecasting

Road Aware tracks how the front and back boundaries of the queue move over time.

Boundary velocities are estimated using linear regression:

```text
v_back  = queue-tail velocity
v_front = queue-front velocity
```

Queue growth is then estimated from the relative boundary movement:

```text
growth_rate = v_front - v_back
```

Traffic events can be classified as:

```text
EXPANDING
DISSIPATING
STABLE
```

and their propagation can be characterized as:

```text
UPSTREAM / SHOCKWAVE
DOWNSTREAM / TRANSLATING
```

A 15-minute forecast estimates future queue length:

```text
forecast_length =
    current_length +
    growth_rate × 15
```

This changes the system from **traffic reporting** into **traffic prediction**.

---

## 5. Geo-Spatial Projection & Route Impact

The simulated traffic corridor is mapped into real-world WGS84 coordinates.

Road Aware evaluates whether a driver's route intersects the predicted traffic event.

The system can consider:

* queue geometry
* route polyline
* lateral proximity
* driver position
* distance to the event
* available exits

This provides the bridge between:

> **"There is congestion."**

and:

> **"This driver is likely to encounter it."**

---

## 6. Multi-Source Context Aggregation

The mathematically derived traffic event is combined with additional contextual signals.

### Google Routes

Provides route and alternative-route context.

### TomTom

Provides external traffic context such as congestion severity, jam length and reported cause.

### Pinecone

Provides the project's historical vector-memory layer for previous road-aware traffic patterns and recommendation precedents.

The current hackathon prototype uses deterministic context providers for TomTom and Google Routes, while the Pinecone integration is represented through a structured historical-memory retrieval layer.

These provider boundaries allow the traffic-intelligence engine to remain independent of any single external data vendor.

---

# 🤖 Gemini Agent Decision Layer

The final traffic decision is generated using **Gemini 3.5 Flash** through the **Google GenAI SDK (`google-genai`)**.

The agent receives multiple pieces of evidence rather than a single traffic signal.

```text
Traffic Event
      +
Route Context
      +
External Traffic Context
      +
Historical Memory
      +
Direction Confidence
      +
Encounter Likelihood
      +
Available Diversion
      ↓
Google GenAI SDK
      ↓
Gemini 3.5 Flash
      ↓
Agent Decision
```

The agent can return:

```text
REROUTE_NOW
MAINTAIN_ROUTE
DO_NOT_ALERT
```

The objective is to make the **right intervention at the right time**, rather than maximize the number of alerts.

---

# 🚨 Confidence & Alert Suppression

An alert is itself an intervention.

Road Aware therefore considers confidence in the driver's direction and the likelihood that the driver will encounter the detected event.

For example:

```text
Direction confidence ↓
        ↓
Encounter likelihood becomes uncertain
        ↓
Potentially unreliable intervention
        ↓
DO_NOT_ALERT
```

Conversely, when multiple independent signals agree:

```text
Telemetry
    +
Traffic dynamics
    +
External context
    +
Historical pattern
    +
Route impact
    +
Available diversion
        ↓
High-confidence decision
        ↓
REROUTE_NOW
```

This allows Road Aware to distinguish between **detecting a traffic event** and **deciding that a particular driver should act**.

---

# 🔌 Headless Traffic Intelligence API

Road Aware is designed as a **headless intelligence layer**.

The web application is a reference client. The traffic reasoning API can be consumed independently by other applications.

Potential consumers include:

* navigation applications
* fleet-management systems
* mobility platforms
* logistics applications
* connected-vehicle systems
* future autonomous-driving infrastructure

The core intelligence is exposed through HTTPS rather than being tied to a particular user interface.

---

# API Endpoints

## `GET /`

Returns service information.

---

## `GET /health`

Health check for the deployed service.

```http
GET /health
```

---

## `POST /traffic/analyze`

Runs the traffic-intelligence pipeline for a selected demonstration scenario.

```http
POST /traffic/analyze
Content-Type: application/json
```

Example request:

```json
{
  "scenario": "A5_LAST_EXIT",
  "user_id": "demo-user-01"
}
```

The API returns structured traffic intelligence including:

```text
Traffic Event
Route Context
External Context
Historical Memory
Agent Decision
```

Example final decision:

```json
{
  "recommendation": "REROUTE_NOW",
  "confidence": 0.96,
  "advisory_message": "Take Exit 19 immediately."
}
```

---

# ☁️ Google Cloud Deployment

The production demonstration API is deployed on **Google Cloud Run**.

```text
                    INTERNET
                       │
                       ▼
              Google Cloud Run
                       │
                       ▼
                    FastAPI
                       │
                       ▼
              run_demo_scenario()
                       │
          ┌────────────┼────────────┐
          ▼            ▼            ▼
    Traffic Engine   Context      Gemini
                       │
             ┌─────────┼─────────┐
             ▼         ▼         ▼
          Routes     TomTom    Pinecone
                       │
                       ▼
                 Agent Decision
                       │
                       ▼
                 JSON Response
```

### Live Service

https://road-aware-api2-745521609480.us-central1.run.app

### Swagger / OpenAPI

https://road-aware-api2-745521609480.us-central1.run.app/docs

The deployed service demonstrates that the traffic-intelligence layer can be consumed through a public HTTPS API independently of the reference frontend.

---

# 🧰 Technology Stack

## Google Technologies

* **Gemini 3.5 Flash** — agentic reasoning and traffic decision
* **Google GenAI SDK (`google-genai`)** — Gemini integration
* **Google Cloud Run** — deployed HTTPS backend
* **Google Routes** — route-context provider
* **Google AI Studio** — reference web application

## Supporting Technologies

* **Python**
* **FastAPI** — REST API layer
* **Pinecone** — historical vector-memory layer
* **TomTom Traffic API** — external traffic-context provider
* **NumPy**
* **Pandas**
* **scikit-learn**
* **React**
* **Vite**
* **Tailwind CSS**

---

# 🏗️ Architecture

```text
┌─────────────────────────────────────────────────────────┐
│                      ROAD AWARE                         │
│              Headless Traffic Intelligence              │
└────────────────────────────┬────────────────────────────┘
                             │
                             ▼
                   Participating Vehicles
                             │
                             ▼
                       GPS Telemetry
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│              SIX-STAGE TRAFFIC ENGINE                   │
│                                                         │
│  1. Car-Following & Telemetry Simulation                │
│  2. Spatio-Temporal Speed Field                         │
│  3. Corroborated Queue Detection                        │
│  4. Shockwave Dynamics & Forecasting                    │
│  5. Geo-Spatial Route Impact                            │
│  6. Multi-Source Context Aggregation                    │
└────────────────────────────┬────────────────────────────┘
                             │
                       TrafficEvent
                             │
                             ▼
                  Multi-Source Context
                             │
             ┌───────────────┼────────────────┐
             ▼               ▼                ▼
       Google Routes      TomTom          Pinecone
       Route Context   Traffic Context   Vector Memory
             │               │                │
             └───────────────┼────────────────┘
                             │
                             ▼
                    Google GenAI SDK
                             │
                             ▼
                       Gemini 3.5 Flash
                             │
                             ▼
                    Agent Decision Layer
                             │
                ┌────────────┼────────────┐
                ▼            ▼            ▼
          REROUTE_NOW   MAINTAIN_ROUTE  DO_NOT_ALERT
                             │
                             ▼
                       Google Cloud Run
                             │
                             ▼
                         HTTPS API
                             │
                             ▼
                     Reference Client
```

---

# 🔬 Demonstration Scenarios

The API includes three controlled scenarios demonstrating different agent behaviours.

| Scenario                   | Decision           | Confidence | Demonstrates                   |
| -------------------------- | ------------------ | ---------: | ------------------------------ |
| `A5_LAST_EXIT`             | **REROUTE_NOW**    |       0.96 | Time-critical intervention     |
| `AMPLE_DIVERSION`          | **MAINTAIN_ROUTE** |       0.89 | Avoiding unnecessary rerouting |
| `LOW_DIRECTION_CONFIDENCE` | **DO_NOT_ALERT**   |       0.52 | Suppressing unreliable alerts  |

### A5_LAST_EXIT

The scenario represents a rapidly developing traffic event approaching the driver's last useful exit.

The pipeline identifies:

* critical congestion
* 2.4 km jam length
* rapidly propagating queue
* approximately 18-minute delay
* historical similarity context
* approximately 25-minute historical clearing time
* alternative route saving approximately 12 minutes
* only 450 metres to the relevant exit

The resulting agent decision is:

```text
REROUTE_NOW
Confidence: 0.96

Take Exit 19 immediately.
```

The important output is not simply that congestion exists.

The agent determines **that this driver should act now**.

---

### AMPLE_DIVERSION

The scenario contains moderate traffic but several viable bypass corridors.

The agent determines that rerouting is unnecessary:

```text
MAINTAIN_ROUTE
Confidence: 0.89
```

This demonstrates that Road Aware does not automatically recommend avoidance whenever congestion is detected.

---

### LOW_DIRECTION_CONFIDENCE

This controlled scenario represents unreliable vehicle-direction telemetry.

Rather than generating a potentially distracting navigation intervention:

```text
DO_NOT_ALERT
Confidence: 0.52
```

The system suppresses the alert because it cannot establish sufficient confidence that the driver will encounter the event.

---

# 🧪 Demo & Prototype Methodology

The traffic-engine demonstration uses **synthetic vehicle telemetry** to reproduce controlled traffic conditions.

This makes the traffic dynamics:

* reproducible
* deterministic
* inspectable
* suitable for demonstrating queue formation and propagation

The architecture is designed so that the synthetic observation layer can ultimately be replaced by real participating-vehicle telemetry.

The current hackathon implementation combines **live Gemini reasoning and Google Cloud Run deployment** with a reproducible traffic-intelligence simulation and deterministic external context providers.

---

# 🧠 Why the Approach Matters

A conventional traffic alert can answer:

> **"There is a traffic jam."**

Road Aware attempts to answer:

> **"There is a developing traffic event, it is moving toward your corridor, you have one viable diversion remaining, and the evidence is strong enough that you should act now."**

This distinction is the core of the project.

The system combines **traffic dynamics + route relevance + contextual evidence + confidence + agentic reasoning** to turn raw observations into an operational decision.

---

# 🛡️ Road Safety & Participation

Road Aware is designed around a simple principle:

> **Road safety can become a collective intelligence problem.**

Instead of relying exclusively on fixed cameras or infrastructure, participating vehicles can contribute movement observations.

The goal is not to monitor individual drivers.

The goal is to understand **collective road conditions** and provide useful warnings when there is sufficient evidence that a driver may be affected.

---

# ⚠️ Prototype Limitations

Road Aware is a hackathon prototype.

Current limitations include:

* traffic telemetry is demonstrated using synthetic vehicle observations
* demonstration scenarios are controlled
* TomTom and Google Routes context are represented through deterministic providers in the current prototype
* Pinecone contains real vector records, while the current application retrieval layer provides structured historical context rather than performing the final similarity query directly
* external traffic and routing providers have their own coverage and accuracy limitations
* agent decisions are recommendations, not guarantees
* production deployment would require additional privacy, security, reliability and driver-safety validation

The architecture is designed to support progressively more live data sources without changing the core `TrafficEvent` and agent-decision contracts.

---

# 🚀 Running Locally

## Frontend

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

---

## Backend

Install Python dependencies:

```bash
pip install -r requirements.txt
```

Start the FastAPI service:

```bash
uvicorn main:app --reload
```

---

# 🔐 Environment Variables

API credentials should **never be committed to GitHub**.

Use the provided `.env.example` as the template for local development.

Example:

```text
GEMINI_API_KEY=your_key_here
PINECONE_API_KEY=your_key_here
TOMTOM_API_KEY=your_key_here
GOOGLE_MAPS_API_KEY=your_key_here
```

Production credentials are configured separately from the source repository.

---

# 📊 Project Status

**Hackathon prototype — deployed and operational**

### Traffic Intelligence

* [x] Microscopic vehicle simulation
* [x] Vehicle telemetry generation
* [x] Spatio-temporal traffic analysis
* [x] Corroborated queue detection
* [x] Shockwave analysis
* [x] Queue growth forecasting
* [x] Geo-spatial route impact
* [x] Multi-scenario testing

### Agent & Context

* [x] Gemini 3.5 Flash
* [x] Google GenAI SDK
* [x] Pinecone vector-memory integration
* [x] TomTom context layer
* [x] Google Routes context layer
* [x] Confidence-aware decisions
* [x] Reroute / maintain / suppress decision states

### Infrastructure

* [x] FastAPI backend
* [x] Google Cloud Run deployment
* [x] HTTPS API
* [x] OpenAPI documentation
* [x] Reference web client

---

# 🎥 Hackathon Demonstration

The demonstration follows the complete decision pipeline:

```text
Vehicle Telemetry
       ↓
Traffic Detection
       ↓
Shockwave Analysis
       ↓
Queue Forecast
       ↓
Route Impact
       ↓
External Context
       ↓
Historical Memory
       ↓
Gemini Reasoning
       ↓
Agent Decision
```

The same API produces different decisions depending on the quality and relevance of the available evidence.

---

# 🌍 Live Project

### Web Application

https://road-aware.ai.studio

### Cloud Run API

https://road-aware-api2-745521609480.us-central1.run.app

### API Documentation

https://road-aware-api2-745521609480.us-central1.run.app/docs

---

## 🚗 Road Aware

**Detect the road. Predict the impact. Alert only when it matters.**

Built for the **All Things Agentic Hackathon — 2026**.
