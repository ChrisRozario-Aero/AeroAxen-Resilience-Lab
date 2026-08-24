# AeroAxen Resilience Lab

### Interactive Drone-Swarm PNT Resilience & Cybersecurity Simulation

[![React](https://img.shields.io/badge/React-Application-61DAFB?logo=react\&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-Build-646CFF?logo=vite\&logoColor=white)](https://vite.dev/)
[![Status](https://img.shields.io/badge/Status-Live-00C853)](https://aero-axen-resilience-lab-eta.vercel.app/)
[![Type](https://img.shields.io/badge/Type-Research%20Prototype-orange)](#research-scope)

**Live Demo:**
https://aero-axen-resilience-lab-eta.vercel.app/

**GitHub Repository:**
https://github.com/ChrisRozario-Aero/AeroAxen-Resilience-Lab

---

## Overview

**AeroAxen Resilience Lab** is an interactive defensive simulation environment designed to demonstrate how a cooperative drone swarm can respond to **GNSS/PNT integrity degradation, spoofing-like navigation anomalies, RF/GNSS interference, timing anomalies, and command-integrity faults**.

Instead of treating GNSS as a single trusted source, the simulation demonstrates a layered resilience concept in which navigation information is cross-checked against independent onboard and swarm-level evidence.

The project visualizes the complete defensive response:

**Detection → Cross-Validation → Trust Assessment → Peer Validation → Isolation → Fallback Navigation → Swarm Reformation → Recovery**

AeroAxen is intended as a **research, educational, aerospace, autonomous-systems, and cybersecurity visualization prototype**.

---

## Live Application

### Try AeroAxen

**https://aero-axen-resilience-lab-eta.vercel.app/**

The application allows users to interactively modify threat conditions, target different drones, change resilience settings, observe trust degradation, and study autonomous recovery behavior.

---

## Problem Statement

Modern autonomous systems can depend heavily on **Global Navigation Satellite Systems (GNSS)** for positioning, navigation, and timing.

GNSS information may become unreliable because of:

* Signal interference
* Jamming
* Spoofing-like position anomalies
* Multipath effects
* Timing anomalies
* Urban signal degradation
* Sensor disagreement
* Communication degradation
* Malicious or inconsistent commands

A resilient autonomous swarm should therefore avoid relying on a single navigation source.

AeroAxen explores the concept of **multi-source navigation integrity validation and cooperative swarm resilience**.

---

## Core Concept

The simulator follows a defense-in-depth architecture:

```text
                    GNSS / PNT DATA
                          |
                          v
                Navigation Observation
                          |
          +---------------+---------------+
          |               |               |
          v               v               v
         IMU        Optical Flow      Peer Estimates
          |               |               |
          +---------------+---------------+
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
                +---------+---------+
                |                   |
          Trusted State        Suspect State
                |                   |
                |                   v
                |            GNSS Quarantine
                |                   |
                |                   v
                |          INS / Optical Fallback
                |                   |
                +---------+---------+
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

The dashboard visualizes a cooperative multi-drone formation with individual:

* Position
* Altitude
* Trust status
* PNT integrity
* Link health
* Mission state
* Navigation source
* Recovery status

---

### GNSS/PNT Integrity Monitoring

The system evaluates navigation confidence using multiple simulated indicators rather than blindly accepting GNSS information.

Displayed indicators include:

* GNSS quality
* IMU mismatch
* Optical-flow mismatch
* Peer-position disagreement
* Command mismatch
* Signal quality
* Navigation uncertainty

---

### Dynamic Trust Scoring

Each drone receives a continuously changing trust score.

Nodes can transition between conditions such as:

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

This provides a visual representation of distributed integrity assessment.

---

## Threat Scenarios

AeroAxen includes several defensive simulation scenarios.

### 1. GNSS Position Anomaly

The selected drone begins reporting navigation information inconsistent with independent sensor and peer observations.

The simulator demonstrates:

* Position disagreement
* Navigation-quality degradation
* Sensor mismatch
* Peer rejection
* Trust reduction
* GNSS quarantine
* Fallback navigation

---

### 2. RF / GNSS Jamming

Simulated signal quality decreases significantly.

Effects include:

* Reduced signal-to-noise ratio
* Increased navigation uncertainty
* Reduced PNT confidence
* Communication degradation
* Increased reliance on independent navigation sources

---

### 3. Timing Anomaly

The simulator models inconsistent navigation timing information.

This scenario demonstrates the importance of validating not only position but also **PNT timing integrity**.

---

### 4. Command-Integrity Anomaly

A command vector becomes inconsistent with expected swarm mission behavior.

The system compares command intent with:

* Swarm mission state
* Peer behavior
* Sensor observations
* Expected navigation behavior

---

### 5. Hybrid GNSS Interference

Multiple integrity indicators degrade simultaneously.

This scenario demonstrates the value of **layered resilience** rather than relying on one anomaly detector.

---

## Resilience Layers

AeroAxen contains three major defensive layers that can be enabled or disabled interactively.

### Layer 1 — Peer Consensus Validation

Neighboring drones cross-check navigation claims.

If one drone reports information inconsistent with several trusted peers, its navigation confidence decreases.

---

### Layer 2 — INS / Optical-Flow Fallback

When GNSS becomes unreliable, the affected node can transition toward alternative navigation sources such as:

* Inertial estimates
* Optical-flow estimates
* Peer-assisted localization

The simulation represents this as a **defensive navigation fallback**.

---

### Layer 3 — Swarm Self-Healing Relay

Healthy nodes adapt their formation to maintain communication and mission coverage.

This demonstrates the concept of a swarm continuing operation even when one node becomes unreliable.

---

## Explainable Decision Inspector

The dashboard includes a **Decision / XAI Inspector**.

Instead of only displaying that a drone is suspicious, the system explains the evidence contributing to the decision.

Example reasoning may include:

* Peer position does not agree with reported GNSS position
* IMU evidence conflicts with navigation movement
* Optical-flow estimate disagrees with GNSS
* Signal quality has degraded
* Command behavior conflicts with swarm intent
* Multiple independent observations support quarantine

This makes the resilience process easier to interpret.

---

## Interactive Mission Timeline

The simulator demonstrates several mission stages:

```text
READY
   ↓
3D PATROL
   ↓
ATTACK / INTERFERENCE INJECTED
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

Users can observe how fleet behavior changes throughout the sequence.

---

## Live Fleet Telemetry

Each drone reports simulated telemetry including:

* Trust score
* PNT integrity
* Link health
* Altitude
* Signal quality
* HDOP/navigation quality
* Sensor mismatch indicators
* Navigation source
* AI state
* Recovery state

---

## Research Telemetry Export

AeroAxen can export simulation data as a **CSV file**.

Exported information can include:

* Simulation time
* Mission phase
* Drone ID
* Position
* Altitude
* Trust score
* Node status
* Signal quality
* HDOP
* Battery state
* IMU mismatch
* Optical-flow mismatch
* Peer mismatch
* Command mismatch
* Navigation mode
* Swarm role

This allows simulation results to be analyzed outside the dashboard.

---

## Dashboard Metrics

The interface summarizes four high-level fleet indicators.

| Metric               | Purpose                                                  |
| -------------------- | -------------------------------------------------------- |
| **Fleet Trust**      | Overall confidence in participating swarm nodes          |
| **PNT Integrity**    | Confidence in navigation and timing information          |
| **Link Health**      | Quality of cooperative swarm communication               |
| **Mission Coverage** | Ability of the active swarm to maintain mission coverage |

---

## Technology Stack

### Frontend

* React
* JavaScript / JSX
* TypeScript entry layer
* HTML5 Canvas
* CSS-in-JS styling

### Development

* Vite
* npm

### Version Control

* Git
* GitHub

### Deployment

* Vercel

---

## Project Structure

```text
AeroAxen-Resilience-Lab/
│
├── src/
│   ├── AeroAxen.jsx
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

**`src/AeroAxen.jsx`**

Contains the primary simulation engine, visualization system, mission states, telemetry generation, resilience logic, interface controls, and dashboard components.

**`src/App.jsx`**

Loads the AeroAxen simulation component.

**`src/index.tsx`**

Initializes the React application.

---

## Running the Project Locally

### Requirements

Install:

* Node.js
* npm
* Git

Clone the repository:

```bash
git clone https://github.com/ChrisRozario-Aero/AeroAxen-Resilience-Lab.git
```

Enter the project directory:

```bash
cd AeroAxen-Resilience-Lab
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Vite will provide a local development URL.

---

## Production Build

Create a production build using:

```bash
npm run build
```

The production files are generated inside:

```text
dist/
```

---

## Deployment

The application is deployed through **Vercel**.

Production application:

**https://aero-axen-resilience-lab-eta.vercel.app/**

The GitHub `main` branch is connected to Vercel.

The deployment workflow is therefore:

```text
Code Update
     ↓
GitHub Commit
     ↓
Push to main
     ↓
Vercel Build
     ↓
Production Deployment
```

---

## Suggested Demonstration

A useful demonstration sequence is:

1. Start the mission.
2. Observe normal 3D patrol.
3. Select a target drone.
4. Choose a threat scenario.
5. Increase threat severity.
6. Observe trust and PNT integrity degradation.
7. Watch peer consensus identify inconsistent navigation evidence.
8. Observe quarantine/fallback behavior.
9. Watch healthy nodes reform the swarm.
10. Observe peer-aided recovery.
11. Export telemetry for analysis.

A second run can be performed with one resilience layer disabled to demonstrate why redundancy matters.

---

## Research Scope

AeroAxen is currently a **simulation and visualization prototype**.

The project demonstrates concepts associated with:

* Resilient PNT
* GNSS integrity
* Autonomous-system cybersecurity
* Cooperative navigation
* Sensor fusion
* Multi-agent trust
* Drone-swarm resilience
* Explainable anomaly detection
* Fault-tolerant autonomous systems

It is designed for **defensive research, education, visualization, and system-concept demonstration**.

---

## Safety Scope

AeroAxen does **not**:

* Transmit RF signals
* Generate operational spoofing signals
* Interfere with real GNSS systems
* Control real aircraft
* Provide operational attack instructions

All interference, anomaly, trust, and recovery behavior shown by the application is simulated.

---

## Current Status

**Version:** `v1.0`

**Status:** Active prototype

**Deployment:** Live

**Platform:** Web

**Primary Focus:** Drone-swarm PNT resilience and autonomous recovery

---

## Future Development

Planned research and engineering extensions include:

### Real Autopilot Integration

* ArduPilot SITL
* PX4 SITL
* MAVLink telemetry

### Robotics Integration

* ROS 2
* Gazebo
* Multi-agent simulation environments

### Navigation

* GNSS/INS sensor fusion
* Visual odometry
* Optical-flow navigation
* Peer-relative positioning
* Alternative PNT methods

### Cybersecurity

* Advanced anomaly detection
* Multi-sensor integrity monitoring
* Distributed trust models
* Adaptive fault isolation

### Artificial Intelligence

* ML-based anomaly classification
* Temporal anomaly detection
* Graph-based swarm trust analysis
* Explainable AI
* Adaptive decision policies

### Hardware-in-the-Loop

Future versions may investigate integration with:

* Flight controllers
* Companion computers
* GNSS receivers
* IMUs
* Optical-flow sensors
* Real telemetry streams

---

## Engineering Goal

The long-term goal of AeroAxen is to explore a central autonomous-systems question:

> **How can a cooperative drone swarm maintain safe mission capability when one or more navigation information sources become unreliable?**

The current web application provides an interactive environment for visualizing and communicating this problem.

---

## Repository

GitHub:

https://github.com/ChrisRozario-Aero/AeroAxen-Resilience-Lab

Live application:

https://aero-axen-resilience-lab-eta.vercel.app/

---

## Project Disclaimer

AeroAxen Resilience Lab is a simulation-oriented research prototype.

The current telemetry, threat events, navigation behavior, and recovery responses are generated for visualization and experimental demonstration purposes and should not be interpreted as certified avionics behavior or real-world flight-test results.
