# ZYRNAV

### PNT Resilience System for Autonomous Drone Swarms

[![React](https://img.shields.io/badge/React-Application-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-Build-646CFF?logo=vite&logoColor=white)](https://vite.dev/)
[![Status](https://img.shields.io/badge/Status-Live-00C853)](#live-demo)
[![Type](https://img.shields.io/badge/Type-Research%20Prototype-orange)](#research-scope)

**GNSS/PNT Integrity • Peer Validation • Sensor-Fusion Fallback • Autonomous Swarm Recovery**

---

## Live Demo

**PASTE_NEW_ZYRNAV_VERCEL_URL_HERE**

**GitHub Repository:**  
https://github.com/ChrisRozario-Aero/ZYRNAV-Resilience-Lab

https://zyrnav-resilience-lab.vercel.app

---

## Overview

**ZYRNAV** is an interactive defensive simulation environment for exploring resilient navigation and autonomous recovery in cooperative drone swarms.

The system demonstrates how an autonomous fleet can respond when GNSS/PNT information becomes unreliable because of interference, spoofing-like navigation anomalies, timing inconsistencies, communication degradation, or command-integrity faults.

Instead of treating GNSS as a single trusted navigation source, ZYRNAV cross-checks simulated navigation data against independent onboard sensors and peer observations.

The core resilience process is:

**Detection → Cross-Validation → Trust Assessment → Peer Validation → Isolation → Fallback Navigation → Swarm Reformation → Recovery**

ZYRNAV is designed as a research, educational, aerospace, autonomous-systems, and cybersecurity visualization prototype.

---

## Problem Statement

Modern autonomous aerial systems frequently depend on **Global Navigation Satellite Systems (GNSS)** for positioning, navigation, and timing.

GNSS information may become unreliable because of:

- RF interference
- Jamming
- Spoofing-like position anomalies
- Multipath effects
- Timing anomalies
- Urban signal degradation
- Sensor disagreement
- Communication degradation
- Inconsistent or untrusted commands

A resilient autonomous swarm should therefore avoid relying on a single source of navigation information.

ZYRNAV explores a layered approach to **navigation integrity monitoring, cooperative validation, fault isolation, and autonomous recovery**.

---

## Core Architecture

```text
                     GNSS / PNT DATA
                           |
                           v
                 Navigation Observation
                           |
          +----------------+----------------+
          |                |                |
          v                v                v
         IMU         Optical Flow      Peer Estimates
          |                |                |
          +----------------+----------------+
                           |
                           v
                  Cross-Sensor Validation
                           |
                           v
                      Trust Engine
                           |
                           v
                   Anomaly Detection
                           |
                           v
                    Peer Validation
                           |
                +----------+----------+
                |                     |
          Trusted State          Suspect State
                |                     |
                |                     v
                |              GNSS Quarantine
                |                     |
                |                     v
                |           INS / Optical Fallback
                |                     |
                +----------+----------+
                           |
                           v
                  Swarm Self-Healing
                           |
                           v
                    Mission Recovery
```

---

## Key Features

### Interactive Drone Swarm

The simulation visualizes multiple cooperative drones with individual:

- Position
- Altitude
- Trust score
- PNT integrity
- Link health
- Navigation source
- Mission state
- Recovery state

### GNSS/PNT Integrity Monitoring

The simulator evaluates navigation confidence using multiple independent indicators, including:

- GNSS quality
- IMU mismatch
- Optical-flow mismatch
- Peer-position disagreement
- Command mismatch
- Timing mismatch
- Signal quality
- Navigation uncertainty

### Dynamic Trust Scoring

Each drone receives a continuously changing trust score.

```text
TRUSTED
   ↓
SUSPECT
   ↓
COMPROMISED
   ↓
QUARANTINED
   ↓
RECOVERING
   ↓
REVALIDATED
```

### Explainable Decision Inspector

The **Decision / XAI Inspector** explains why a node is considered trusted or suspicious.

Evidence may include:

- GNSS disagreement with inertial motion
- Optical-flow disagreement
- Peer-position disagreement
- Degraded signal quality
- Timing inconsistency
- Command-policy mismatch

---

## Threat Scenarios

ZYRNAV includes several simulation scenarios for testing resilience behavior.

### 1. GNSS Position Spoofing

Simulated navigation data begins diverging from independent sensor and peer estimates.

The system demonstrates:

- Navigation disagreement
- Trust reduction
- Peer rejection
- GNSS quarantine
- Fallback navigation
- Recovery

### 2. GNSS / RF Jamming

Signal quality and communication confidence degrade.

The simulation demonstrates:

- Reduced SNR
- Increased navigation uncertainty
- Link degradation
- Reduced PNT integrity
- Increased reliance on non-GNSS navigation sources

### 3. Navigation Time Shift

Navigation timing becomes inconsistent with independent clocks and peer state.

### 4. Command Integrity Anomaly

A command vector becomes inconsistent with mission intent, expected swarm behavior, or sensor observations.

### 5. Hybrid GNSS Interference

Multiple navigation and RF integrity indicators degrade simultaneously.

---

## Resilience Layers

ZYRNAV includes three interactive defensive layers.

### Layer 1 — Peer Consensus Validation

Neighboring drones validate navigation claims against trusted peer observations.

If one node reports navigation information inconsistent with several trusted peers, confidence in that navigation solution decreases.

### Layer 2 — INS / Optical-Flow Fallback

When GNSS becomes unreliable, affected nodes can transition toward alternative navigation sources such as:

- Inertial navigation
- Optical-flow estimates
- Peer-assisted positioning

### Layer 3 — Swarm Self-Healing Relay

Healthy nodes adapt their formation and relay geometry to preserve mission coverage and cooperative communication.

---

## Interactive Mission Timeline

```text
READY
   ↓
3D PATROL
   ↓
INTERFERENCE INJECTED
   ↓
ANOMALY DETECTED
   ↓
PEER VALIDATION
   ↓
FALLBACK / ISOLATION
   ↓
ALTITUDE REFORMATION
   ↓
PEER-AID RECOVERY
   ↓
MISSION CONTINUES
```

Users can observe how fleet behavior changes throughout the complete resilience sequence.

---

## Live Fleet Telemetry

Each drone reports simulated telemetry including:

- Trust score
- PNT integrity
- Link health
- Altitude
- Signal quality
- HDOP/navigation quality
- Sensor mismatch indicators
- Navigation source
- AI state
- Recovery state

---

## Dashboard Metrics

| Metric | Purpose |
|---|---|
| **Fleet Trust** | Overall confidence in participating swarm nodes |
| **PNT Integrity** | Confidence in navigation and timing information |
| **Link Health** | Quality of cooperative swarm communication |
| **Mission Coverage** | Ability of the active swarm to maintain mission coverage |

---

## Research Telemetry Export

ZYRNAV can export simulation telemetry as CSV data.

Exported information can include:

- Simulation time
- Mission phase
- Drone ID
- Position
- Altitude
- Trust score
- Node status
- PNT integrity
- Link health
- Risk score
- Threat level
- Signal quality
- HDOP
- Battery state
- IMU mismatch
- Optical-flow mismatch
- Peer mismatch
- Velocity mismatch
- Timing mismatch
- Command mismatch
- Navigation source
- Mitigation state
- Swarm role

This allows simulation results to be analyzed outside the web dashboard.

---

## Technology Stack

### Frontend

- React
- JavaScript / JSX
- TypeScript entry layer
- HTML5 Canvas
- CSS-in-JS

### Development

- Vite
- npm

### Version Control

- Git
- GitHub

### Deployment

- Vercel

---

## Project Structure

```text
ZYRNAV-Resilience-Lab/
│
├── src/
│   ├── Zyrnav.jsx
│   ├── App.jsx
│   └── index.tsx
│
├── .gitignore
├── README.md
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.js
```

### Main Files

**`src/Zyrnav.jsx`**

Contains the primary simulation engine, mission states, telemetry generation, visualization system, resilience logic, trust assessment, interface controls, recovery behavior, and dashboard components.

**`src/App.jsx`**

Loads the ZYRNAV simulation component.

**`src/index.tsx`**

Initializes the React application.

---

## Run Locally

### Requirements

Install:

- Node.js
- npm
- Git

Clone the repository:

```bash
git clone https://github.com/ChrisRozario-Aero/ZYRNAV-Resilience-Lab.git
```

Enter the project directory:

```bash
cd ZYRNAV-Resilience-Lab
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Vite will display the local development URL.

---

## Production Build

Create a production build using:

```bash
npm run build
```

Production files are generated inside:

```text
dist/
```

---

## Deployment

ZYRNAV is deployed through **Vercel**.

**Production Application:**  
PASTE_NEW_ZYRNAV_VERCEL_URL_HERE

The GitHub `main` branch is connected directly to Vercel.

```text
Code Update
     ↓
GitHub Commit
     ↓
main Branch
     ↓
Vercel Build
     ↓
Production Deployment
```

---

## Suggested Demonstration

A useful demonstration sequence is:

1. Start the mission.
2. Observe normal swarm patrol.
3. Select a target drone.
4. Choose a threat model.
5. Increase threat severity.
6. Observe PNT integrity and trust degradation.
7. Watch cross-sensor anomaly detection.
8. Observe peer consensus validation.
9. Watch GNSS quarantine and fallback navigation.
10. Observe swarm reformation.
11. Watch peer-aided recovery.
12. Export telemetry for analysis.

A second run can be performed with one resilience layer disabled to demonstrate why redundancy matters.

---

## Research Scope

ZYRNAV is currently a **simulation and visualization prototype**.

The project explores concepts associated with:

- Resilient PNT
- GNSS integrity
- Autonomous-system cybersecurity
- Cooperative navigation
- Sensor fusion
- Multi-agent trust
- Drone-swarm resilience
- Explainable anomaly detection
- Fault-tolerant autonomous systems

The current implementation is intended for defensive research, education, visualization, and system-concept demonstration.

---

## Safety Scope

ZYRNAV does **not**:

- Transmit RF signals
- Generate operational spoofing signals
- Interfere with real GNSS systems
- Control real aircraft
- Provide operational attack instructions

All interference, anomaly, trust, navigation, and recovery behavior shown by the application is simulated.

---

## Current Status

**Version:** `v1.0.0`

**Status:** Active Research Prototype

**Platform:** Web

**Deployment:** Live

**Primary Focus:** Drone-swarm PNT resilience and autonomous recovery

---

## Future Development

### Autopilot Integration

- ArduPilot SITL
- PX4 SITL
- MAVLink telemetry

### Robotics Integration

- ROS 2
- Gazebo
- Multi-agent simulation environments

### Navigation

- GNSS/INS sensor fusion
- Visual odometry
- Optical-flow navigation
- Peer-relative positioning
- Alternative PNT methods

### Cybersecurity

- Advanced anomaly detection
- Multi-sensor integrity monitoring
- Distributed trust models
- Adaptive fault isolation

### Artificial Intelligence

- ML-based anomaly classification
- Temporal anomaly detection
- Graph-based swarm trust analysis
- Explainable AI
- Adaptive decision policies

### Hardware-in-the-Loop

Future versions may investigate integration with:

- Flight controllers
- Companion computers
- GNSS receivers
- IMUs
- Optical-flow sensors
- Real telemetry streams

---

## Engineering Goal

The long-term goal of ZYRNAV is to explore a central autonomous-systems question:

> **How can a cooperative drone swarm maintain safe mission capability when one or more navigation information sources become unreliable?**

The current application provides an interactive environment for visualizing, testing, and communicating this problem.

---

## Repository

**GitHub:**  
https://github.com/ChrisRozario-Aero/ZYRNAV-Resilience-Lab

**Live Application:**  
PASTE_NEW_ZYRNAV_VERCEL_URL_HERE

---

## Project Disclaimer

ZYRNAV is a simulation-oriented research prototype.

The current telemetry, threat events, navigation behavior, trust calculations, and recovery responses are generated for visualization and experimental demonstration purposes.

They should not be interpreted as certified avionics behavior, verified operational cybersecurity performance, or real-world flight-test results.
