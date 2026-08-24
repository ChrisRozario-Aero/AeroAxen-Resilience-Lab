import React, { useEffect, useMemo, useRef, useState } from "react";

// Responsive dashboard layout update

/**
 * Zyrnav Resilience Lab v2
 * Defensive simulation-only prototype for GNSS/PNT integrity and swarm recovery.
 *
 * Demonstrates:
 * 1. Simulated GNSS spoofing, RF jamming, timing anomalies and command-integrity faults.
 * 2. Cross-checking GNSS against IMU, optical flow, peer estimates and command intent.
 * 3. Trust, PNT integrity, link health and fleet coverage as separate health signals.
 * 4. Peer validation, GNSS quarantine, dead-reckoning/fused-PNT fallback and self-healing.
 * 5. Scenario presets inspired by modern aviation/drone resilience concerns.
 * 6. Interactive drone inspection, phase navigation, resilience-layer toggles and CSV export.
 *
 * IMPORTANT: This is a defensive visual simulation. It does not transmit RF, generate
 * spoofing signals, control a real aircraft, or contain operational attack instructions.
 */

const CANVAS_W = 980;
const CANVAS_H = 620;
const CX = CANVAS_W / 2;
const CY = CANVAS_H / 2 + 40;

const COLORS = {
  bg: "#020B16",
  panel: "#041225",
  panel2: "#071A30",
  grid: "#0B2B4D",
  cyan: "#00D8FF",
  teal: "#00F5C4",
  blue: "#4A90E2",
  orange: "#F5A623",
  red: "#E83B3B",
  purple: "#A855F7",
  dim: "#6F8DAA",
  text: "#CDEEFF",
  white: "#FFFFFF",
};

const ATTACKS = {
  GNSS_SPOOF: {
    label: "GNSS Position Spoofing",
    short: "GNSS SPOOF",
    color: COLORS.red,
    risk: "HIGH",
    note: "Reported position diverges from inertial, optical-flow and peer estimates.",
    symptom: "Position drift, HDOP growth, velocity disagreement and peer mismatch.",
    defense: "Cross-check sensors, reduce GNSS authority, quarantine the fix and use fused fallback PNT.",
  },
  RF_JAM: {
    label: "GNSS / RF Jamming",
    short: "RF DENIAL",
    color: COLORS.orange,
    risk: "HIGH",
    note: "Signal quality collapses and communication/navigation confidence degrades.",
    symptom: "Low SNR, link loss, unstable navigation quality and reduced peer reachability.",
    defense: "Detect RF degradation, preserve safe autonomy and maintain navigation with non-GNSS sources.",
  },
  TIME_SHIFT: {
    label: "Navigation Time Shift",
    short: "TIME SHIFT",
    color: COLORS.blue,
    risk: "ELEVATED",
    note: "Navigation timing becomes inconsistent with onboard and peer clocks.",
    symptom: "Clock offset, stale-state disagreement and navigation/telemetry inconsistency.",
    defense: "Cross-check independent clocks, reject implausible time jumps and hold trusted state history.",
  },
  CMD_INJECT: {
    label: "Command Integrity Anomaly",
    short: "CMD ANOM",
    color: COLORS.purple,
    risk: "HIGH",
    note: "A suspicious command vector conflicts with mission intent and peer behavior.",
    symptom: "Command mismatch rises while physical sensors remain comparatively consistent.",
    defense: "Authenticate command intent, apply policy limits and require local/peer validation before execution.",
  },
  HYBRID_RFI: {
    label: "Hybrid GNSS Interference",
    short: "HYBRID RFI",
    color: COLORS.red,
    risk: "CRITICAL",
    note: "Position integrity and RF quality degrade together, creating a more realistic resilience stress test.",
    symptom: "Low SNR plus GNSS/IMU/peer disagreement, timing error and rapid integrity loss.",
    defense: "Declare GNSS unreliable, isolate the corrupted solution and transition to multi-sensor/peer-aided PNT.",
  },
};

const SCENARIOS = {
  GNSS_CORRIDOR: {
    label: "GNSS Interference Corridor",
    badge: "2026 RESILIENCE PRIORITY",
    attackType: "HYBRID_RFI",
    targetNode: 3,
    threshold: 58,
    severity: 88,
    environment: "Conflict-zone / border-airspace style GNSS interference",
    mission: "Emergency relay mission must preserve navigation and mesh coverage while satellite PNT becomes unreliable.",
    focus: "Detect integrity loss early, quarantine GNSS, preserve safe local navigation, then rebuild fleet confidence.",
  },
  URBAN_CANYON: {
    label: "Dense Urban Canyon",
    badge: "CIVIL INFRASTRUCTURE",
    attackType: "GNSS_SPOOF",
    targetNode: 2,
    threshold: 55,
    severity: 62,
    environment: "High-rise multipath / degraded sky view with spoofing-like symptoms",
    mission: "Infrastructure inspection continues without blindly trusting a single navigation source.",
    focus: "Separate normal GNSS degradation from integrity-threatening cross-sensor disagreement.",
  },
  DISASTER_RELAY: {
    label: "Disaster Communications Relay",
    badge: "EMERGENCY RESPONSE",
    attackType: "RF_JAM",
    targetNode: 4,
    threshold: 52,
    severity: 76,
    environment: "Congested / degraded communications environment",
    mission: "Maintain a temporary airborne relay when RF quality deteriorates and one node loses dependable links.",
    focus: "Preserve mesh coverage and local autonomy rather than forcing continuous remote control.",
  },
  TIMING_RESILIENCE: {
    label: "PNT Timing Integrity",
    badge: "CRITICAL INFRASTRUCTURE",
    attackType: "TIME_SHIFT",
    targetNode: 1,
    threshold: 57,
    severity: 72,
    environment: "Navigation timing inconsistency / stale-state risk",
    mission: "Keep navigation and telemetry internally consistent when the GNSS-derived time reference becomes suspect.",
    focus: "Use independent clocks, state history and peers to detect implausible time shifts.",
  },
  COMMAND_GUARD: {
    label: "Command Integrity Guard",
    badge: "ZERO-TRUST CONTROL",
    attackType: "CMD_INJECT",
    targetNode: 5,
    threshold: 60,
    severity: 78,
    environment: "Untrusted command / control-input integrity test",
    mission: "Prevent one suspicious command from overriding local safety constraints or fleet intent.",
    focus: "Validate intent locally and with peers before restoring formation authority.",
  },
};

const SOURCE_NOTE =
  "Scenario classes are informed by public 2025-2026 aviation GNSS-resilience guidance. This dashboard is simulation-only and is not a live threat feed.";

const BASE = [
  {
    id: 1,
    label: "D1",
    x: 0,
    y: -150,
    z: 118,
    battery: 94,
    snr: 31.2,
    hdop: 0.8,
  },
  {
    id: 2,
    label: "D2",
    x: -190,
    y: 10,
    z: 113,
    battery: 88,
    snr: 29.8,
    hdop: 0.9,
  },
  {
    id: 3,
    label: "D3",
    x: 0,
    y: 75,
    z: 120,
    battery: 91,
    snr: 30.5,
    hdop: 0.7,
  },
  {
    id: 4,
    label: "D4",
    x: 190,
    y: 10,
    z: 116,
    battery: 86,
    snr: 32.0,
    hdop: 0.8,
  },
  {
    id: 5,
    label: "D5",
    x: 0,
    y: 210,
    z: 111,
    battery: 97,
    snr: 33.1,
    hdop: 0.7,
  },
];

const PHASES = [
  { key: "ready", label: "Ready", start: 0, end: 2 },
  { key: "patrol", label: "3D Patrol", start: 2, end: 6 },
  { key: "attack", label: "Attack Injected", start: 6, end: 11 },
  { key: "detect", label: "Anomaly Detected", start: 11, end: 15 },
  { key: "vote", label: "Peer Validation", start: 15, end: 19 },
  { key: "isolate", label: "Fallback Mode", start: 19, end: 23 },
  { key: "heal", label: "Altitude Reformation", start: 23, end: 32 },
  { key: "complete", label: "Mission Continues", start: 32, end: 999 },
];

const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
const lerp = (a, b, t) => a + (b - a) * t;
const ease = (t) => t * t * (3 - 2 * t);
const fmt = (n, d = 0) => Number(n || 0).toFixed(d);
const timeStamp = () =>
  new Date().toLocaleTimeString("en-IN", { hour12: false });

function phaseAt(t) {
  return PHASES.find((p) => t >= p.start && t < p.end) || PHASES[0];
}

function phaseProgress(t, phase) {
  return clamp(
    (t - phase.start) / Math.max(0.001, phase.end - phase.start),
    0,
    1
  );
}

function trustColor(v) {
  if (v >= 75) return COLORS.teal;
  if (v >= 50) return COLORS.orange;
  return COLORS.red;
}

function statusOf(v, threshold) {
  if (v < threshold) return "COMPROMISED";
  if (v < threshold + 25) return "SUSPECT";
  return "TRUSTED";
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

function project3D(p, cameraYaw = 0.78) {
  // Simple isometric-style projection. z is altitude.
  const cos = Math.cos(cameraYaw);
  const sin = Math.sin(cameraYaw);
  const rx = p.x * cos - p.y * sin;
  const ry = p.x * sin + p.y * cos;
  return {
    sx: CX + rx * 1.05,
    sy: CY + ry * 0.42 - p.z * 1.35,
  };
}

function computeTrust(n, threshold) {
  const snrPenalty = n.snr < 8 ? 30 : n.snr < 18 ? 15 : 0;
  const hdopPenalty = n.hdop > 2.4 ? 17 : n.hdop > 1.6 ? 8 : 0;
  const mismatchPenalty =
    n.imuMismatch * 19 +
    n.flowMismatch * 20 +
    n.peerMismatch * 28 +
    n.commandMismatch * 22 +
    n.timeMismatch * 18 +
    n.velocityMismatch * 16;
  const linkPenalty = n.linkLoss * 14;
  const score = clamp(
    100 - snrPenalty - hdopPenalty - mismatchPenalty - linkPenalty,
    0,
    100
  );
  return {
    trust: Math.round(score),
    status: statusOf(score, threshold),
    anomaly: Math.round(100 - score),
  };
}

function threatLevel(score) {
  if (score >= 75) return "CRITICAL";
  if (score >= 50) return "HIGH";
  if (score >= 25) return "ELEVATED";
  return "LOW";
}

function threatColor(level) {
  if (level === "CRITICAL") return COLORS.red;
  if (level === "HIGH") return COLORS.orange;
  if (level === "ELEVATED") return COLORS.blue;
  return COLORS.teal;
}

function flagReasons(n) {
  const reasons = [];
  if (n.snr < 18) reasons.push("RF/GNSS signal quality is degraded");
  if (n.hdop > 1.6) reasons.push("GNSS navigation quality is outside the nominal band");
  if (n.imuMismatch > 0.28) reasons.push("GNSS position disagrees with inertial motion");
  if (n.flowMismatch > 0.28) reasons.push("GNSS motion disagrees with optical-flow estimate");
  if (n.peerMismatch > 0.35) reasons.push("Neighbour drones do not validate this navigation claim");
  if (n.velocityMismatch > 0.3) reasons.push("Reported velocity is inconsistent with physical motion");
  if (n.timeMismatch > 0.25) reasons.push("Navigation time is inconsistent with independent clocks");
  if (n.commandMismatch > 0.3) reasons.push("Command intent conflicts with local/formation policy");
  return reasons.length ? reasons : ["Cross-sensor and peer evidence is internally consistent"];
}

function recommendedAction(n) {
  if (n.trust < 25)
    return "Keep the node out of formation authority; use trusted local fallback PNT and peer-aided recovery.";
  if (n.pntIntegrity < 50)
    return "Reduce GNSS authority and rely on inertial/optical/peer cross-checking until integrity is re-established.";
  if (n.linkHealth < 45)
    return "Preserve local autonomy and mesh relay geometry; avoid dependence on a fragile remote link.";
  if (n.trust < 70)
    return "Continue enhanced validation and require multiple independent signals before restoring full authority.";
  return "Nominal operation: continue integrity monitoring and retain redundant navigation sources.";
}

function generateTelemetry(config, simTime, tick) {
  const phase = phaseAt(simTime);
  const p = phaseProgress(simTime, phase);
  const ep = ease(p);
  const targetId = config.targetNode;
  const severity = clamp((config.severity ?? 75) / 100, 0.35, 1);
  const attackActive = ["attack", "detect", "vote", "isolate"].includes(
    phase.key
  );
  const recoveryStage = ["heal", "complete"].includes(phase.key);

  return BASE.map((b, index) => {
    const isTarget = b.id === targetId;
    const patrolX = config.autoPatrol ? Math.sin(simTime * 0.38 + b.id) * 9 : 0;
    const patrolY = config.autoPatrol ? Math.cos(simTime * 0.34 + b.id) * 8 : 0;
    const patrolZ = config.autoPatrol
      ? Math.sin(simTime * 0.36 + b.id * 0.6) * 2.5
      : 0;

    let x = b.x + patrolX;
    let y = b.y + patrolY;
    let z = b.z + patrolZ;
    let snr = b.snr + Math.sin(simTime + b.id) * 1.1;
    let hdop = b.hdop + Math.sin(simTime * 0.4 + b.id) * 0.08;
    let imuMismatch = 0.04 + Math.random() * 0.015;
    let flowMismatch = 0.04 + Math.random() * 0.015;
    let peerMismatch = 0.03 + Math.random() * 0.02;
    let commandMismatch = 0.02;
    let timeMismatch = 0.01 + Math.random() * 0.012;
    let velocityMismatch = 0.03 + Math.random() * 0.018;
    let linkLoss = 0.02 + Math.random() * 0.015;
    let aiMode = "NORMAL";
    let role = "formation node";
    let pntSource = "GNSS + IMU + FLOW";
    let mitigation = "MONITORING";

    if (attackActive && isTarget) {
      const ramp = phase.key === "attack" ? ep : 1;
      const intensity = clamp(ramp * severity, 0, 1);
      aiMode = "UNDER INTEGRITY STRESS";
      role = "suspect node";

      const wobbleX = Math.sin(tick * 0.11 + b.id) * 7 * intensity;
      const wobbleY = Math.cos(tick * 0.1 + b.id) * 6 * intensity;
      const wobbleZ = Math.sin(tick * 0.13 + b.id) * 3 * intensity;

      if (config.attackType === "GNSS_SPOOF") {
        x += 18 * intensity + wobbleX;
        y -= 12 * intensity + wobbleY;
        z += wobbleZ;
        hdop = 1.6 + 1.5 * intensity;
        imuMismatch = 0.28 + 0.42 * intensity;
        flowMismatch = 0.32 + 0.42 * intensity;
        peerMismatch = 0.38 + 0.48 * intensity;
        velocityMismatch = 0.28 + 0.5 * intensity;
      }

      if (config.attackType === "RF_JAM") {
        x += wobbleX;
        y += wobbleY;
        z += wobbleZ;
        snr = lerp(b.snr, 3.8, intensity);
        hdop = 1.2 + 1.3 * intensity;
        imuMismatch = 0.16 + 0.2 * intensity;
        flowMismatch = 0.17 + 0.2 * intensity;
        peerMismatch = 0.25 + 0.34 * intensity;
        linkLoss = 0.28 + 0.68 * intensity;
      }

      if (config.attackType === "TIME_SHIFT") {
        x += wobbleX * 0.45;
        y += wobbleY * 0.45;
        timeMismatch = 0.18 + 0.74 * intensity;
        peerMismatch = 0.2 + 0.42 * intensity;
        velocityMismatch = 0.16 + 0.34 * intensity;
        hdop = 1.1 + 0.9 * intensity;
      }

      if (config.attackType === "CMD_INJECT") {
        x += Math.sin(tick * 0.08 + b.id) * 10 * intensity;
        y += Math.cos(tick * 0.08 + b.id) * 8 * intensity;
        z += Math.sin(tick * 0.09 + b.id) * 3 * intensity;
        commandMismatch = 0.18 + 0.76 * intensity;
        peerMismatch = 0.26 + 0.48 * intensity;
        imuMismatch = 0.12 + 0.16 * intensity;
        flowMismatch = 0.12 + 0.17 * intensity;
      }

      if (config.attackType === "HYBRID_RFI") {
        x += 16 * intensity + wobbleX;
        y -= 10 * intensity + wobbleY;
        z += wobbleZ;
        snr = lerp(b.snr, 4.2, intensity);
        hdop = 1.7 + 1.5 * intensity;
        imuMismatch = 0.3 + 0.39 * intensity;
        flowMismatch = 0.34 + 0.4 * intensity;
        peerMismatch = 0.42 + 0.47 * intensity;
        timeMismatch = 0.12 + 0.42 * intensity;
        velocityMismatch = 0.28 + 0.46 * intensity;
        linkLoss = 0.22 + 0.67 * intensity;
      }
    }

    if (phase.key === "detect" && isTarget) {
      aiMode = "MULTI-SENSOR FLAG";
      mitigation = "CROSS-CHECKING";
    }
    if (phase.key === "vote" && isTarget) {
      aiMode = config.peerValidation ? "PEER CONSENSUS CHECK" : "PEER CHECK DISABLED";
      mitigation = config.peerValidation ? "CONSENSUS" : "LOCAL-ONLY VALIDATION";
    }
    if (phase.key === "isolate" && isTarget) {
      aiMode = config.fallbackEnabled ? "GNSS QUARANTINED" : "DEGRADED - NO FALLBACK";
      pntSource = config.fallbackEnabled ? "INS + OPTICAL FLOW" : "SUSPECT GNSS";
      mitigation = config.fallbackEnabled ? "DEAD-RECKONING FALLBACK" : "HOLD / OPERATOR ACTION";
    }

    if (recoveryStage && !isTarget && config.selfHealing) {
      const hp = phase.key === "heal" ? ep : 1;
      aiMode = "RELAY REFORMATION";
      role = "relay stabiliser";
      pntSource = "GNSS + PEER RELAY";
      mitigation = "SELF-HEALING MESH";
      const altitudeShift = 20 + index * 4;
      x = lerp(x, b.x, hp);
      y = lerp(y, b.y, hp);
      z = lerp(z, b.z + altitudeShift, hp);
      peerMismatch = 0.02 + Math.random() * 0.012;
      linkLoss = 0.01 + Math.random() * 0.015;
    }

    if (recoveryStage && isTarget && config.fallbackEnabled) {
      const hp = phase.key === "heal" ? ep : 1;
      aiMode = phase.key === "heal" ? "FUSED PNT RECOVERY" : "REJOINED / MONITORED";
      role = "recovering node";
      pntSource = phase.key === "heal" ? "INS + FLOW + PEER PNT" : "FUSED PNT (REVALIDATED)";
      mitigation = config.selfHealing ? "PEER-AID RECOVERY" : "LOCAL FALLBACK RECOVERY";
      x = lerp(b.x + 5, b.x, hp);
      y = lerp(b.y - 4, b.y, hp);
      z = lerp(b.z, b.z + 6, hp);
      snr = config.attackType === "RF_JAM" || config.attackType === "HYBRID_RFI"
        ? lerp(7, b.snr - 2, hp)
        : b.snr - 1;
      hdop = lerp(2.5, b.hdop + 0.15, hp);
      imuMismatch = lerp(0.48, 0.08, hp);
      flowMismatch = lerp(0.5, 0.08, hp);
      peerMismatch = lerp(0.62, config.selfHealing ? 0.08 : 0.18, hp);
      commandMismatch = lerp(0.48, 0.03, hp);
      timeMismatch = lerp(0.42, 0.03, hp);
      velocityMismatch = lerp(0.46, 0.06, hp);
      linkLoss = lerp(0.5, 0.04, hp);
    }

    if (recoveryStage && isTarget && !config.fallbackEnabled) {
      aiMode = "DEGRADED - FALLBACK UNAVAILABLE";
      role = "isolated node";
      pntSource = "NO TRUSTED PNT";
      mitigation = "OPERATOR / SAFE-STATE REQUIRED";
      peerMismatch = Math.max(peerMismatch, 0.52);
      linkLoss = Math.max(linkLoss, 0.28);
    }

    linkLoss = Math.max(linkLoss, clamp((14 - snr) / 14, 0, 1));

    let node = {
      ...b,
      x,
      y,
      z,
      snr,
      hdop,
      imuMismatch,
      flowMismatch,
      peerMismatch,
      commandMismatch,
      timeMismatch,
      velocityMismatch,
      linkLoss,
      aiMode,
      role,
      pntSource,
      mitigation,
      battery: b.battery - simTime * 0.015,
      phase: phase.label,
    };

    node = { ...node, ...computeTrust(node, config.threshold) };
    node.pntIntegrity = Math.round(
      clamp(
        100 -
          node.hdop * 9 -
          node.timeMismatch * 30 -
          node.velocityMismatch * 24 -
          node.peerMismatch * 24 -
          node.imuMismatch * 16,
        0,
        100
      )
    );
    node.linkHealth = Math.round(clamp(100 - node.linkLoss * 100, 0, 100));

    if (isTarget && phase.key === "detect") node.trust = Math.min(node.trust, 44);
    if (isTarget && phase.key === "vote")
      node.trust = Math.min(node.trust, config.peerValidation ? 22 : 36);
    if (isTarget && phase.key === "isolate") node.trust = Math.min(node.trust, 14);
    if (isTarget && phase.key === "heal") {
      node.trust = config.fallbackEnabled
        ? Math.round(lerp(26, config.selfHealing ? 76 : 58, ep))
        : Math.min(node.trust, 20);
      node.pntIntegrity = config.fallbackEnabled
        ? Math.round(lerp(34, config.selfHealing ? 84 : 65, ep))
        : Math.min(node.pntIntegrity, 24);
    }
    if (isTarget && phase.key === "complete") {
      node.trust = config.fallbackEnabled ? (config.selfHealing ? 88 : 62) : 18;
      node.pntIntegrity = config.fallbackEnabled ? (config.selfHealing ? 91 : 70) : 22;
    }
    if (!isTarget && recoveryStage && config.selfHealing) {
      node.trust = Math.max(node.trust, phase.key === "complete" ? 96 : 89);
      node.pntIntegrity = Math.max(node.pntIntegrity, phase.key === "complete" ? 95 : 88);
    }

    node.status = statusOf(node.trust, config.threshold);
    node.anomaly = 100 - node.trust;
    node.riskScore = Math.round(
      clamp(100 - (node.trust * 0.45 + node.pntIntegrity * 0.4 + node.linkHealth * 0.15), 0, 100)
    );
    node.threatLevel = threatLevel(node.riskScore);
    return node;
  });
}

function drawGroundGrid(ctx) {
  const size = 360;
  const step = 60;
  ctx.save();
  ctx.lineWidth = 1;
  for (let x = -size; x <= size; x += step) {
    const a = project3D({ x, y: -size, z: 0 });
    const b = project3D({ x, y: size, z: 0 });
    ctx.strokeStyle = x === 0 ? "rgba(0,216,255,0.28)" : "rgba(11,43,77,0.60)";
    ctx.beginPath();
    ctx.moveTo(a.sx, a.sy);
    ctx.lineTo(b.sx, b.sy);
    ctx.stroke();
  }
  for (let y = -size; y <= size; y += step) {
    const a = project3D({ x: -size, y, z: 0 });
    const b = project3D({ x: size, y, z: 0 });
    ctx.strokeStyle = y === 0 ? "rgba(0,216,255,0.28)" : "rgba(11,43,77,0.60)";
    ctx.beginPath();
    ctx.moveTo(a.sx, a.sy);
    ctx.lineTo(b.sx, b.sy);
    ctx.stroke();
  }
  ctx.restore();
}

function drawAltitudeLine(ctx, node, screen) {
  const ground = project3D({ x: node.x, y: node.y, z: 0 });
  ctx.save();
  ctx.strokeStyle = "rgba(255,255,255,0.12)";
  ctx.setLineDash([4, 6]);
  ctx.beginPath();
  ctx.moveTo(ground.sx, ground.sy);
  ctx.lineTo(screen.sx, screen.sy);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = "rgba(0,216,255,0.12)";
  ctx.beginPath();
  ctx.ellipse(ground.sx, ground.sy, 22, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawDrone3D(ctx, node, tick, selectedNodeId) {
  const s = project3D(node);
  const color = trustColor(node.trust);
  drawAltitudeLine(ctx, node, s);

  if (node.id === selectedNodeId) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(s.sx, s.sy, 58, 0, Math.PI * 2);
    ctx.strokeStyle = COLORS.white;
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 7]);
    ctx.lineDashOffset = -tick * 0.5;
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
  }

  ctx.save();
  ctx.shadowBlur = node.trust < 50 ? 28 : 15;
  ctx.shadowColor = color;

  const scale = clamp(0.72 + node.z / 220, 0.75, 1.45);
  const arm = 22 * scale;
  const body = 14 * scale;

  // aura
  ctx.beginPath();
  ctx.arc(s.sx, s.sy, 46 * scale, 0, Math.PI * 2);
  ctx.strokeStyle = `${color}22`;
  ctx.lineWidth = 1;
  ctx.stroke();

  // arms
  ctx.strokeStyle = `${color}B0`;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(s.sx - arm, s.sy - arm * 0.45);
  ctx.lineTo(s.sx + arm, s.sy + arm * 0.45);
  ctx.moveTo(s.sx + arm, s.sy - arm * 0.45);
  ctx.lineTo(s.sx - arm, s.sy + arm * 0.45);
  ctx.stroke();

  // propellers
  const propPoints = [
    [-arm, -arm * 0.45],
    [arm, -arm * 0.45],
    [arm, arm * 0.45],
    [-arm, arm * 0.45],
  ];
  propPoints.forEach(([dx, dy], i) => {
    ctx.save();
    ctx.translate(s.sx + dx, s.sy + dy);
    ctx.rotate(tick * 0.26 + i);
    ctx.strokeStyle = color;
    ctx.globalAlpha = 0.72;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-9 * scale, 0);
    ctx.lineTo(9 * scale, 0);
    ctx.moveTo(0, -6 * scale);
    ctx.lineTo(0, 6 * scale);
    ctx.stroke();
    ctx.restore();
  });

  // body
  ctx.beginPath();
  ctx.arc(s.sx, s.sy, body, 0, Math.PI * 2);
  ctx.fillStyle = "#06162A";
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.lineWidth = node.trust < 50 ? 3 : 2;
  ctx.stroke();

  ctx.fillStyle = color;
  ctx.font = `bold ${Math.round(10 * scale)}px Courier New`;
  ctx.textAlign = "center";
  ctx.fillText(node.label, s.sx, s.sy + 4);

  // trust label
  ctx.shadowBlur = 0;
  ctx.fillStyle = "rgba(2,11,22,0.80)";
  roundRect(ctx, s.sx - 44, s.sy + 28 * scale, 88, 34, 8);
  ctx.fill();
  ctx.strokeStyle = `${color}55`;
  ctx.stroke();
  ctx.fillStyle = color;
  ctx.font = "bold 10px Courier New";
  ctx.fillText(
    `${node.trust}% | ${Math.round(node.z)}m`,
    s.sx,
    s.sy + 42 * scale
  );
  ctx.fillStyle = COLORS.dim;
  ctx.font = "8px Courier New";
  ctx.fillText(node.aiMode, s.sx, s.sy + 55 * scale);

  if (node.trust < 50) {
    ctx.strokeStyle = COLORS.red;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(s.sx - 16, s.sy - 16);
    ctx.lineTo(s.sx + 16, s.sy + 16);
    ctx.moveTo(s.sx + 16, s.sy - 16);
    ctx.lineTo(s.sx - 16, s.sy + 16);
    ctx.stroke();
  }

  ctx.restore();
  return s;
}

function drawScene(ctx, nodes, phase, config, tick, particlesRef, selectedNodeId) {
  ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
  ctx.fillStyle = COLORS.bg;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  const glow = ctx.createRadialGradient(CX, CY - 150, 0, CX, CY, 620);
  glow.addColorStop(0, "rgba(0,216,255,0.16)");
  glow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  drawGroundGrid(ctx);

  const active = nodes.filter((n) => n.trust >= config.threshold);
  const target = nodes.find((n) => n.id === config.targetNode);

  // Mesh edges in 3D projection
  for (let i = 0; i < active.length; i++) {
    for (let j = i + 1; j < active.length; j++) {
      const a = active[i];
      const b = active[j];
      const pa = project3D(a);
      const pb = project3D(b);
      ctx.strokeStyle = `rgba(0,245,196,${
        0.14 + Math.sin(tick / 15 + a.id + b.id) * 0.06
      })`;
      ctx.lineWidth = 1.2;
      ctx.setLineDash([8, 8]);
      ctx.lineDashOffset = -tick * 0.8;
      ctx.beginPath();
      ctx.moveTo(pa.sx, pa.sy);
      ctx.lineTo(pb.sx, pb.sy);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }

  // Peer-aid recovery links
  if (["heal", "complete"].includes(phase.key) && target && config.selfHealing) {
    const pt = project3D(target);
    active
      .filter((n) => n.id !== config.targetNode)
      .forEach((n) => {
        const pn = project3D(n);
        ctx.strokeStyle = `rgba(0,216,255,${
          0.35 + Math.sin(tick / 8 + n.id) * 0.12
        })`;
        ctx.lineWidth = 2.5;
        ctx.setLineDash([3, 7]);
        ctx.lineDashOffset = -tick;
        ctx.beginPath();
        ctx.moveTo(pn.sx, pn.sy);
        ctx.lineTo(pt.sx, pt.sy);
        ctx.stroke();
        ctx.setLineDash([]);
      });
  }

  // Attack source
  if (["attack", "detect", "vote", "isolate"].includes(phase.key) && target) {
    const attack = ATTACKS[config.attackType];
    const src = { x: 260, y: -220, z: 160 };
    const ps = project3D(src);
    const pt = project3D(target);

    const zonePulse = 110 + Math.sin(tick / 10) * 12;
    ctx.beginPath();
    ctx.ellipse(ps.sx, ps.sy, zonePulse, zonePulse * 0.55, 0, 0, Math.PI * 2);
    ctx.fillStyle = `${attack.color}0D`;
    ctx.fill();
    ctx.strokeStyle = `${attack.color}33`;
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.strokeStyle = `${attack.color}AA`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(ps.sx, ps.sy);
    ctx.lineTo(pt.sx, pt.sy);
    ctx.stroke();

    for (let r = 20; r < 155; r += 34) {
      ctx.beginPath();
      ctx.arc(ps.sx, ps.sy, r + (tick % 34), 0, Math.PI * 2);
      ctx.strokeStyle = `${attack.color}33`;
      ctx.stroke();
    }

    ctx.fillStyle = "rgba(35,4,10,0.92)";
    roundRect(ctx, ps.sx - 62, ps.sy - 27, 124, 54, 8);
    ctx.fill();
    ctx.strokeStyle = attack.color;
    ctx.stroke();
    ctx.fillStyle = attack.color;
    ctx.font = "bold 12px Courier New";
    ctx.textAlign = "center";
    ctx.fillText(attack.short, ps.sx, ps.sy - 3);
    ctx.font = "9px Courier New";
    ctx.fillText(`target D${config.targetNode}`, ps.sx, ps.sy + 14);
  }

  // Sort by projected Y to fake depth.
  const sorted = [...nodes].sort((a, b) => project3D(a).sy - project3D(b).sy);
  sorted.forEach((n) => drawDrone3D(ctx, n, tick, selectedNodeId));

  // Particles
  particlesRef.current.forEach((p) => {
    p.t += p.speed;
    const interp = {
      x: lerp(p.from.x, p.to.x, p.t),
      y: lerp(p.from.y, p.to.y, p.t),
      z: lerp(p.from.z, p.to.z, p.t),
    };
    const s = project3D(interp);
    ctx.beginPath();
    ctx.arc(s.sx, s.sy, 3, 0, Math.PI * 2);
    ctx.fillStyle = p.color;
    ctx.globalAlpha = 1 - p.t;
    ctx.fill();
    ctx.globalAlpha = 1;
  });
  particlesRef.current = particlesRef.current.filter((p) => p.t < 1);

  // Overlay
  ctx.fillStyle = "rgba(2,11,22,0.82)";
  roundRect(ctx, 22, 22, 420, 92, 12);
  ctx.fill();
  ctx.strokeStyle = "rgba(0,216,255,0.28)";
  ctx.stroke();
  ctx.fillStyle = COLORS.cyan;
  ctx.font = "bold 24px Courier New";
  ctx.textAlign = "left";
  ctx.fillText("ZYRNAV RESILIENCE LAB", 42, 56);
  ctx.fillStyle = COLORS.dim;
  ctx.font = "11px Courier New";
  ctx.fillText(
    "Defensive PNT integrity: trust, GNSS quality, link health and fallback state",
    42,
    78
  );
  ctx.fillStyle = COLORS.text;
  ctx.font = "bold 13px Courier New";
  ctx.fillText(`PHASE: ${phase.label.toUpperCase()}`, 42, 98);
}

function Sparkline({ data, color }) {
  const points = data.length ? data : [0];
  const max = Math.max(...points, 100);
  const min = Math.min(...points, 0);
  const d = points
    .map((v, i) => {
      const x = (i / Math.max(1, points.length - 1)) * 145;
      const y = 42 - ((v - min) / Math.max(1, max - min)) * 38;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg width="145" height="46" style={{ display: "block" }}>
      <path d={d} fill="none" stroke={color} strokeWidth="2" />
    </svg>
  );
}

export default function Zyrnav3DSimulation() {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const tickRef = useRef(0);
  const startRef = useRef(null);
  const pausedAtRef = useRef(0);
  const lastPhaseRef = useRef("ready");
  const telemetryRef = useRef([]);

  const [running, setRunning] = useState(false);
  const [simTime, setSimTime] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [scenarioKey, setScenarioKey] = useState("GNSS_CORRIDOR");
  const initialScenario = SCENARIOS.GNSS_CORRIDOR;
  const [config, setConfig] = useState({
    attackType: initialScenario.attackType,
    targetNode: initialScenario.targetNode,
    threshold: initialScenario.threshold,
    severity: initialScenario.severity,
    autoPatrol: true,
    peerValidation: true,
    fallbackEnabled: true,
    selfHealing: true,
  });
  const [selectedNodeId, setSelectedNodeId] = useState(initialScenario.targetNode);
  const [nodes, setNodes] = useState(generateTelemetry({
    attackType: initialScenario.attackType,
    targetNode: initialScenario.targetNode,
    threshold: initialScenario.threshold,
    severity: initialScenario.severity,
    autoPatrol: true,
    peerValidation: true,
    fallbackEnabled: true,
    selfHealing: true,
  }, 0, 0));
  const [logs, setLogs] = useState([
    { t: timeStamp(), type: "ok", msg: "Resilience Lab ready - choose a scenario and start the mission." },
    { t: timeStamp(), type: "info", msg: "Click any drone in the 3D view to inspect its trust evidence." },
  ]);
  const [history, setHistory] = useState({
    trust: [98],
    integrity: [96],
    link: [98],
    coverage: [100],
  });

  const phase = phaseAt(simTime);
  const scenario = SCENARIOS[scenarioKey];
  const avgTrust = useMemo(
    () => Math.round(nodes.reduce((a, n) => a + n.trust, 0) / nodes.length),
    [nodes]
  );
  const avgPnt = useMemo(
    () => Math.round(nodes.reduce((a, n) => a + n.pntIntegrity, 0) / nodes.length),
    [nodes]
  );
  const avgLink = useMemo(
    () => Math.round(nodes.reduce((a, n) => a + n.linkHealth, 0) / nodes.length),
    [nodes]
  );
  const avgAlt = useMemo(
    () => nodes.reduce((a, n) => a + n.z, 0) / nodes.length,
    [nodes]
  );
  const active = useMemo(
    () => nodes.filter((n) => n.trust >= config.threshold),
    [nodes, config.threshold]
  );
  const coverage = Math.round((active.length / nodes.length) * 100);
  const target = nodes.find((n) => n.id === config.targetNode) || nodes[2];
  const inspected = nodes.find((n) => n.id === selectedNodeId) || target;
  const fleetRisk = Math.round(nodes.reduce((a, n) => a + n.riskScore, 0) / nodes.length);
  const fleetThreat = threatLevel(Math.max(fleetRisk, target.riskScore));
  const enabledLayers = [config.peerValidation, config.fallbackEnabled, config.selfHealing].filter(Boolean).length;

  function addLog(msg, type = "info") {
    setLogs((p) => [{ t: timeStamp(), msg, type }, ...p].slice(0, 100));
  }

  function applyScenario(key) {
    const next = SCENARIOS[key];
    setScenarioKey(key);
    setConfig((c) => ({
      ...c,
      attackType: next.attackType,
      targetNode: next.targetNode,
      threshold: next.threshold,
      severity: next.severity,
    }));
    setSelectedNodeId(next.targetNode);
    setRunning(false);
    setSimTime(0);
    pausedAtRef.current = 0;
    startRef.current = null;
    particlesRef.current = [];
    telemetryRef.current = [];
    addLog(`Scenario loaded: ${next.label}.`, "info");
  }

  function startMission() {
    telemetryRef.current = [];
    startRef.current = performance.now();
    pausedAtRef.current = 0;
    lastPhaseRef.current = "ready";
    setSimTime(0);
    setRunning(true);
    particlesRef.current = [];
    setSelectedNodeId(config.targetNode);
    setLogs([
      { t: timeStamp(), type: "ok", msg: `${scenario.label} simulation started.` },
      { t: timeStamp(), type: "warn", msg: `${ATTACKS[config.attackType].label} will stress D${config.targetNode} at ${config.severity}% severity.` },
      { t: timeStamp(), type: "info", msg: `Resilience layers enabled: ${enabledLayers}/3.` },
      { t: timeStamp(), type: "info", msg: "Telemetry recording started for CSV export." },
    ]);
  }

  function pauseMission() {
    setRunning(false);
    pausedAtRef.current = simTime;
    addLog("Simulation paused.", "warn");
  }

  function resumeMission() {
    startRef.current = performance.now() - (pausedAtRef.current * 1000) / speed;
    setRunning(true);
    addLog("Simulation resumed.", "ok");
  }

  function resetMission() {
    setRunning(false);
    setSimTime(0);
    pausedAtRef.current = 0;
    startRef.current = null;
    telemetryRef.current = [];
    particlesRef.current = [];
    const fresh = generateTelemetry(config, 0, 0);
    setNodes(fresh);
    setSelectedNodeId(config.targetNode);
    setHistory({ trust: [98], integrity: [96], link: [98], coverage: [100] });
    setLogs([
      { t: timeStamp(), type: "ok", msg: "Simulation reset." },
      { t: timeStamp(), type: "info", msg: "Adjust the scenario, threat severity or resilience layers and run again." },
    ]);
  }

  function jumpTo(sec) {
    setSimTime(sec);
    pausedAtRef.current = sec;
    if (running) startRef.current = performance.now() - (sec * 1000) / speed;
    addLog(`Jumped to T+${sec}s (${phaseAt(sec).label}).`, "info");
  }

  function handleCanvasClick(e) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * CANVAS_W;
    const py = ((e.clientY - rect.top) / rect.height) * CANVAS_H;
    let best = null;
    let bestD = Infinity;
    nodes.forEach((n) => {
      const p = project3D(n);
      const d = Math.hypot(px - p.sx, py - p.sy);
      if (d < bestD) {
        bestD = d;
        best = n;
      }
    });
    if (best && bestD < 70) {
      setSelectedNodeId(best.id);
      addLog(`Inspector selected ${best.label}: trust ${best.trust}%, PNT integrity ${best.pntIntegrity}%.`, "info");
    }
  }

  function exportCsv() {
    const rows = [
      "source,wall_time,sim_time,scenario,phase,node,x,y,altitude_m,trust,status,pnt_integrity,link_health,risk_score,threat_level,snr_db,hdop,battery,imu_mismatch,flow_mismatch,peer_mismatch,velocity_mismatch,time_mismatch,command_mismatch,ai_mode,pnt_source,mitigation,role",
    ];
    const samples = telemetryRef.current.length
      ? telemetryRef.current
      : [{ wall: new Date().toISOString(), simTime, phase: phase.label, nodes }];
    samples.forEach((sample) => {
      sample.nodes.forEach((n) => {
        rows.push([
          "Zyrnav_Resilience_Lab_simulated_telemetry",
          sample.wall,
          fmt(sample.simTime, 2),
          scenario.label,
          sample.phase,
          n.label,
          fmt(n.x, 2),
          fmt(n.y, 2),
          fmt(n.z, 2),
          n.trust,
          n.status,
          n.pntIntegrity,
          n.linkHealth,
          n.riskScore,
          n.threatLevel,
          fmt(n.snr, 2),
          fmt(n.hdop, 2),
          fmt(n.battery, 1),
          fmt(n.imuMismatch, 3),
          fmt(n.flowMismatch, 3),
          fmt(n.peerMismatch, 3),
          fmt(n.velocityMismatch, 3),
          fmt(n.timeMismatch, 3),
          fmt(n.commandMismatch, 3),
          n.aiMode,
          n.pntSource,
          n.mitigation,
          n.role,
        ].map((v) => `"${String(v).replaceAll('"', '""')}"`).join(","));
      });
    });
    const csvText = rows.join(String.fromCharCode(10));
    const blob = new Blob([csvText], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `zyrnav_resilience_${scenarioKey.toLowerCase()}_${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addLog(`CSV exported - ${rows.length - 1} telemetry rows.`, "ok");
  }

  useEffect(() => {
    let raf;
    const loop = () => {
      tickRef.current += 1;
      const tick = tickRef.current;
      if (running) {
        if (!startRef.current) startRef.current = performance.now();
        const elapsed = ((performance.now() - startRef.current) / 1000) * speed;
        setSimTime(Math.min(elapsed, 36));
        if (elapsed >= 36) setRunning(false);
      }
      const nextPhase = phaseAt(simTime);
      const nextNodes = generateTelemetry(config, simTime, tick);
      setNodes(nextNodes);
      const ctx = canvasRef.current?.getContext("2d");
      if (ctx)
        drawScene(ctx, nextNodes, nextPhase, config, tick, particlesRef, selectedNodeId);
      const activeNodes = nextNodes.filter((n) => n.trust >= config.threshold);
      if (tick % 9 === 0 && activeNodes.length > 1) {
        const from = activeNodes[Math.floor(Math.random() * activeNodes.length)];
        const to = activeNodes[Math.floor(Math.random() * activeNodes.length)];
        if (from.id !== to.id)
          particlesRef.current.push({ from, to, t: 0, speed: 0.025, color: COLORS.teal });
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [running, simTime, speed, config, selectedNodeId]);

  useEffect(() => {
    const id = setInterval(() => {
      telemetryRef.current.push({
        wall: new Date().toISOString(),
        simTime,
        phase: phase.label,
        nodes: nodes.map((n) => ({ ...n })),
      });
      telemetryRef.current = telemetryRef.current.slice(-4000);
      setHistory((h) => ({
        trust: [...h.trust, avgTrust].slice(-80),
        integrity: [...h.integrity, avgPnt].slice(-80),
        link: [...h.link, avgLink].slice(-80),
        coverage: [...h.coverage, coverage].slice(-80),
      }));
    }, 500);
    return () => clearInterval(id);
  }, [nodes, simTime, phase.label, avgTrust, avgPnt, avgLink, coverage]);

  useEffect(() => {
    if (lastPhaseRef.current === phase.key) return;
    lastPhaseRef.current = phase.key;
    const d = `D${config.targetNode}`;
    const msgs = {
      patrol: ["Nominal patrol - independent sensors and peers agree.", "ok"],
      attack: [`${ATTACKS[config.attackType].label} introduced into the simulation. ${d} begins losing integrity.`, "warn"],
      detect: [`Cross-sensor detector flags ${d}: integrity evidence exceeds the configured trust threshold.`, "warn"],
      vote: [config.peerValidation ? `Peers cross-check ${d} and reject inconsistent navigation evidence.` : "Peer validation is disabled - detection confidence now depends on local sensors only.", config.peerValidation ? "error" : "warn"],
      isolate: [config.fallbackEnabled ? `${d} quarantines suspect GNSS and moves to inertial/optical fallback.` : `${d} has no fallback layer enabled; safe-state/operator action is required.`, "error"],
      heal: [config.selfHealing ? "Fleet self-healing begins: healthy nodes reform relay geometry and provide peer-aided state support." : "Self-healing is disabled; the fleet keeps its original geometry and recovery is slower.", config.selfHealing ? "ok" : "warn"],
      complete: [config.fallbackEnabled ? `${d} reaches a revalidated fused-PNT state. Mission continues with enhanced monitoring.` : `${d} remains isolated because no trusted fallback PNT was enabled.`, config.fallbackEnabled ? "ok" : "error"],
    };
    if (msgs[phase.key]) addLog(msgs[phase.key][0], msgs[phase.key][1]);
  }, [phase.key, config.attackType, config.targetNode, config.peerValidation, config.fallbackEnabled, config.selfHealing]);

  const card = {
    background: "linear-gradient(180deg, rgba(4,18,37,0.98), rgba(3,14,29,0.98))",
    border: "1px solid rgba(0,216,255,0.16)",
    borderRadius: 18,
    padding: 14,
    boxShadow: "0 14px 34px rgba(0,0,0,0.22)",
  };

  return (
    <div className="aero-root" style={{ minHeight: "100vh", width: "100%", background: COLORS.bg, color: COLORS.text, fontFamily: "Inter, ui-sans-serif, system-ui", overflowX: "hidden" }}>
      <style>{`
        *{box-sizing:border-box}
        html,body,#root{width:100%;min-width:0;overflow-x:hidden}
        .aero-shell{min-height:100vh;width:100%;display:grid;grid-template-columns:minmax(0,3fr) minmax(420px,2fr);gap:14px;padding:14px;max-width:1920px;margin:0 auto;align-items:start}
        .aero-left{display:grid;grid-template-rows:auto auto auto;gap:12px;min-width:0;align-self:start}
        .aero-side{display:grid;grid-template-rows:auto auto auto;gap:12px;min-width:0;min-height:0;align-content:start;align-self:start}
        .aero-header{display:flex;align-items:center;gap:12px;flex-wrap:wrap;min-width:0}
        .aero-minis{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}
        .aero-minis>*{min-width:0}
        .aero-two{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:8px}
        .aero-phase{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px;padding-bottom:2px}
        .aero-canvas{width:100%;height:auto;aspect-ratio:980/620;display:block;cursor:pointer}
        .aero-scroll{min-height:0;overflow:auto}
        .aero-side>div{min-width:0}
        button,select,input{font:inherit;max-width:100%}
        button:focus-visible,select:focus-visible,input:focus-visible{outline:2px solid #00D8FF;outline-offset:2px}
        @media(max-width:1280px){.aero-shell{grid-template-columns:minmax(0,1.35fr) minmax(390px,1fr);padding:12px;gap:12px}.aero-phase{grid-template-columns:repeat(3,minmax(0,1fr))}}
        @media(max-width:1040px){.aero-shell{grid-template-columns:1fr}.aero-side{grid-template-columns:1fr 1fr;grid-template-rows:auto auto}.aero-side>div:last-child{grid-column:1/-1}.aero-phase{grid-template-columns:repeat(4,minmax(0,1fr))}}
        @media(max-width:760px){.aero-shell{padding:8px}.aero-side{display:grid;grid-template-columns:1fr}.aero-side>div:last-child{grid-column:auto}.aero-minis{grid-template-columns:1fr 1fr}.aero-two{grid-template-columns:1fr}.aero-phase{grid-template-columns:repeat(2,minmax(0,1fr))}.aero-header{align-items:flex-start}}
        @media(max-width:520px){.aero-minis{grid-template-columns:1fr}.aero-phase{grid-template-columns:1fr}}
      `}</style>

      <div className="aero-shell">
        <div className="aero-left">
          <div style={{ ...card }} className="aero-header">
            <div style={{ minWidth: 250, marginRight: "auto" }}>
              <div style={{ fontSize: 27, fontWeight: 950, letterSpacing: 1.6, color: COLORS.cyan }}>ZYRNAV RESILIENCE LAB</div>
              <div style={{ fontSize: 12, color: COLORS.dim, marginTop: 3 }}>Defensive PNT integrity + swarm recovery simulation</div>
            </div>
            <Pill label={running ? "MISSION RUNNING" : phase.key === "complete" ? "RUN COMPLETE" : "READY"} color={running ? COLORS.teal : COLORS.blue} />
            <Pill label={`${fleetThreat} THREAT`} color={threatColor(fleetThreat)} />
            <Metric label="TIME" value={`T+${fmt(simTime, 1)}s`} color={COLORS.cyan} />
            <Metric label="FLEET TRUST" value={`${avgTrust}%`} color={trustColor(avgTrust)} />
            <Metric label="PNT INTEGRITY" value={`${avgPnt}%`} color={trustColor(avgPnt)} />
            <Metric label="COVERAGE" value={`${coverage}%`} color={coverage >= 80 ? COLORS.teal : COLORS.orange} />
          </div>

          <div style={{ ...card, padding: 0, overflow: "hidden", position: "relative" }}>
            <canvas ref={canvasRef} width={CANVAS_W} height={CANVAS_H} className="aero-canvas" onClick={handleCanvasClick} title="Click a drone to inspect it" />
            <div style={{ position: "absolute", right: 12, bottom: 12, maxWidth: 315, background: "rgba(2,11,22,0.86)", border: "1px solid rgba(0,216,255,0.2)", borderRadius: 12, padding: "9px 11px", fontSize: 11, color: COLORS.dim, pointerEvents: "none" }}>
              <b style={{ color: COLORS.cyan }}>{scenario.label}</b><br />
              Click a drone for evidence-level inspection. Red/orange means reduced trust, not automatic physical failure.
            </div>
          </div>

          <div className="aero-minis">
            <Mini title="Fleet Trust" data={history.trust} color={trustColor(avgTrust)} value={`${avgTrust}%`} />
            <Mini title="PNT Integrity" data={history.integrity} color={trustColor(avgPnt)} value={`${avgPnt}%`} />
            <Mini title="Link Health" data={history.link} color={avgLink < 50 ? COLORS.orange : COLORS.cyan} value={`${avgLink}%`} />
            <Mini title="Mission Coverage" data={history.coverage} color={COLORS.blue} value={`${coverage}%`} />
          </div>
        </div>

        <div className="aero-side">
          <div style={card}>
            <div style={sectionTitle}>Scenario + Mission Controls</div>
            <label style={label}>World-scenario preset</label>
            <select value={scenarioKey} onChange={(e) => applyScenario(e.target.value)} style={input} disabled={running}>
              {Object.entries(SCENARIOS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
            <div style={{ marginTop: 9, padding: 10, background: "rgba(0,216,255,0.05)", border: "1px solid rgba(0,216,255,0.12)", borderRadius: 12 }}>
              <div style={{ fontSize: 10, fontWeight: 900, color: COLORS.cyan, letterSpacing: 1 }}>{scenario.badge}</div>
              <div style={{ fontSize: 12, fontWeight: 800, color: COLORS.text, marginTop: 4 }}>{scenario.environment}</div>
              <div style={{ fontSize: 11, color: COLORS.dim, lineHeight: 1.5, marginTop: 5 }}>{scenario.mission}</div>
            </div>

            <div className="aero-two" style={{ marginTop: 8 }}>
              <div>
                <label style={label}>Threat model</label>
                <select value={config.attackType} onChange={(e) => setConfig((c) => ({ ...c, attackType: e.target.value }))} style={input} disabled={running}>
                  {Object.entries(ATTACKS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
              </div>
              <div>
                <label style={label}>Target drone</label>
                <select value={config.targetNode} onChange={(e) => { const id = Number(e.target.value); setConfig((c) => ({ ...c, targetNode: id })); setSelectedNodeId(id); }} style={input} disabled={running}>
                  {BASE.map((d) => <option key={d.id} value={d.id}>{d.label}</option>)}
                </select>
              </div>
            </div>

            <label style={label}>Threat severity: {config.severity}%</label>
            <input type="range" min="35" max="100" value={config.severity} onChange={(e) => setConfig((c) => ({ ...c, severity: Number(e.target.value) }))} style={{ width: "100%" }} />
            <label style={label}>Trust isolation threshold: {config.threshold}%</label>
            <input type="range" min="35" max="75" value={config.threshold} onChange={(e) => setConfig((c) => ({ ...c, threshold: Number(e.target.value) }))} style={{ width: "100%" }} />

            <div style={{ marginTop: 10, paddingTop: 8, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ ...sectionTitle, marginBottom: 6 }}>Resilience Layers ({enabledLayers}/3)</div>
              <Toggle label="Peer consensus validation" checked={config.peerValidation} onChange={(v) => setConfig((c) => ({ ...c, peerValidation: v }))} detail="Cross-check the suspect node against neighbours." />
              <Toggle label="INS / optical-flow fallback" checked={config.fallbackEnabled} onChange={(v) => setConfig((c) => ({ ...c, fallbackEnabled: v }))} detail="Continue safe local navigation after GNSS quarantine." />
              <Toggle label="Swarm self-healing relay" checked={config.selfHealing} onChange={(v) => setConfig((c) => ({ ...c, selfHealing: v }))} detail="Healthy nodes reform altitude/relay geometry." />
            </div>

            <div className="aero-two" style={{ marginTop: 9 }}>
              {!running ? <button onClick={simTime > 0 && simTime < 36 ? resumeMission : startMission} style={button(COLORS.teal)}>{simTime > 0 && simTime < 36 ? "Resume Mission" : "Start Mission"}</button> : <button onClick={pauseMission} style={button(COLORS.orange)}>Pause Mission</button>}
              <button onClick={resetMission} style={button(COLORS.blue)}>Reset</button>
            </div>
            <div className="aero-two">
              <div>
                <label style={label}>Playback speed: {speed}x</label>
                <input type="range" min="0.5" max="2" step="0.5" value={speed} onChange={(e) => setSpeed(Number(e.target.value))} style={{ width: "100%" }} />
              </div>
              <Toggle label="Auto patrol motion" checked={config.autoPatrol} onChange={(v) => setConfig((c) => ({ ...c, autoPatrol: v }))} detail="Keep normal nodes moving before/after the event." compact />
            </div>

            <div style={{ ...sectionTitle, marginTop: 12, marginBottom: 6 }}>Interactive Mission Timeline</div>
            <div className="aero-phase">
              {PHASES.filter((p) => p.key !== "complete").map((p) => (
                <button key={p.key} onClick={() => jumpTo(p.start)} style={{ ...smallBtn, borderColor: phase.key === p.key ? COLORS.cyan : "rgba(0,216,255,0.2)", color: phase.key === p.key ? COLORS.white : COLORS.cyan, background: phase.key === p.key ? "rgba(0,216,255,0.14)" : "#020B16" }}>{p.label}</button>
              ))}
            </div>
            <button onClick={exportCsv} style={{ ...button(COLORS.cyan), width: "100%", marginTop: 10 }}>Export Research Telemetry CSV</button>
          </div>

          <div style={card}>
            <div style={sectionTitle}>Decision / XAI Inspector</div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
              <div>
                <div style={{ fontSize: 11, color: COLORS.dim }}>INSPECTING</div>
                <div style={{ fontSize: 20, fontWeight: 950, color: trustColor(inspected.trust) }}>{inspected.label} - {inspected.status}</div>
              </div>
              <Pill label={inspected.threatLevel} color={threatColor(inspected.threatLevel)} />
            </div>
            <div className="aero-two" style={{ marginTop: 10 }}>
              <Info label="Trust" value={`${inspected.trust}%`} color={trustColor(inspected.trust)} />
              <Info label="PNT integrity" value={`${inspected.pntIntegrity}%`} color={trustColor(inspected.pntIntegrity)} />
              <Info label="Link health" value={`${inspected.linkHealth}%`} color={inspected.linkHealth < 50 ? COLORS.orange : COLORS.cyan} />
              <Info label="Risk score" value={`${inspected.riskScore}/100`} color={threatColor(inspected.threatLevel)} />
            </div>
            <div style={{ marginTop: 10, padding: 10, borderRadius: 12, background: "#020B16", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div style={{ fontSize: 10, color: COLORS.dim, letterSpacing: 1 }}>WHY THE SYSTEM THINKS THIS</div>
              <ul style={{ margin: "7px 0 0 17px", padding: 0, color: COLORS.text, fontSize: 11, lineHeight: 1.55 }}>
                {flagReasons(inspected).slice(0, 5).map((r) => <li key={r}>{r}</li>)}
              </ul>
            </div>
            <div style={{ marginTop: 9, fontSize: 11, lineHeight: 1.5 }}>
              <b style={{ color: COLORS.cyan }}>PNT source:</b> {inspected.pntSource}<br />
              <b style={{ color: COLORS.teal }}>Mitigation state:</b> {inspected.mitigation}<br />
              <b style={{ color: COLORS.orange }}>Recommended defensive action:</b> {recommendedAction(inspected)}
            </div>
            <div style={{ marginTop: 9, paddingTop: 8, borderTop: "1px solid rgba(255,255,255,0.06)", fontSize: 10.5, color: COLORS.dim, lineHeight: 1.45 }}>{SOURCE_NOTE}</div>
          </div>

          <div style={{ ...card, minHeight: 0, overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
              <div style={sectionTitle}>Live Fleet Telemetry</div>
              <span style={{ fontSize: 10, color: COLORS.dim }}>Click a card or drone to inspect</span>
            </div>
            <div className="aero-scroll" style={{ maxHeight: 330, display: "grid", gap: 8, paddingRight: 2 }}>
              {nodes.map((n) => <Node key={n.id} n={n} threshold={config.threshold} selected={n.id === selectedNodeId} onClick={() => setSelectedNodeId(n.id)} />)}
            </div>
            <div style={{ ...sectionTitle, marginTop: 12 }}>Mission Event Log</div>
            <div className="aero-scroll" style={{ height: 190, borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 8 }}>
              {logs.map((l, i) => <Log key={i} item={l} />)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Toggle({ label, checked, onChange, detail, compact }) {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: 9, padding: compact ? "6px 0" : "7px 0", cursor: "pointer" }}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span style={{ flex: 1 }}>
        <span style={{ display: "block", fontSize: 11.5, fontWeight: 800, color: checked ? COLORS.text : COLORS.dim }}>{label}</span>
        {detail && !compact ? <span style={{ display: "block", fontSize: 10, color: COLORS.dim, marginTop: 2 }}>{detail}</span> : null}
      </span>
      <span style={{ fontSize: 9, fontWeight: 900, color: checked ? COLORS.teal : COLORS.orange }}>{checked ? "ON" : "OFF"}</span>
    </label>
  );
}

function Pill({ label, color }) {
  return (
    <div
      style={{
        padding: "9px 12px",
        borderRadius: 999,
        border: `1px solid ${color}`,
        color,
        fontSize: 12,
        fontWeight: 900,
      }}
    >
      {label}
    </div>
  );
}

function Metric({ label, value, color }) {
  return (
    <div style={{ minWidth: 78 }}>
      <div style={{ fontSize: 20, fontWeight: 950, color }}>{value}</div>
      <div style={{ fontSize: 10, color: COLORS.dim, letterSpacing: 1 }}>
        {label}
      </div>
    </div>
  );
}

function Mini({ title, data, color, value }) {
  return (
    <div
      style={{
        background: COLORS.panel,
        border: "1px solid rgba(0,216,255,0.18)",
        borderRadius: 18,
        padding: 12,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <div>
        <div style={{ fontSize: 11, color: COLORS.dim }}>{title}</div>
        <div style={{ fontSize: 22, fontWeight: 950, color }}>{value}</div>
      </div>
      <Sparkline data={data} color={color} />
    </div>
  );
}

function Info({ label, value, color, small }) {
  return (
    <div
      style={{
        background: "#020B16",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 12,
        padding: 10,
      }}
    >
      <div style={{ color: COLORS.dim, fontSize: 11 }}>{label}</div>
      <div
        style={{
          color,
          fontSize: small ? 11 : 18,
          fontWeight: 900,
          wordBreak: "break-word",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function Node({ n, threshold, selected, onClick }) {
  const color = trustColor(n.trust);
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: "100%",
        textAlign: "left",
        background: selected ? "rgba(0,216,255,0.08)" : "#020B16",
        border: `1px solid ${selected ? COLORS.cyan : n.trust < threshold ? COLORS.red : "rgba(255,255,255,0.08)"}`,
        borderRadius: 12,
        padding: 10,
        cursor: "pointer",
        color: COLORS.text,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
        <b style={{ color }}>{n.label}</b>
        <span style={{ color: threatColor(n.threatLevel), fontSize: 10, fontWeight: 900 }}>{n.status} / {n.threatLevel}</span>
      </div>
      <div style={{ height: 5, background: "rgba(255,255,255,0.08)", borderRadius: 999, margin: "8px 0" }}>
        <div style={{ width: `${n.trust}%`, height: "100%", background: color, borderRadius: 999 }} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 6, fontSize: 10.5, color: COLORS.dim }}>
        <span>TRUST <b style={{ color: COLORS.text }}>{n.trust}%</b></span>
        <span>PNT <b style={{ color: COLORS.text }}>{n.pntIntegrity}%</b></span>
        <span>LINK <b style={{ color: COLORS.text }}>{n.linkHealth}%</b></span>
        <span>ALT <b style={{ color: COLORS.text }}>{fmt(n.z)}m</b></span>
      </div>
      <div style={{ marginTop: 6, fontSize: 9.5, color: COLORS.dim, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{n.pntSource} | {n.mitigation}</div>
    </button>
  );
}

function Log({ item }) {
  const color =
    item.type === "ok"
      ? COLORS.teal
      : item.type === "warn"
      ? COLORS.orange
      : item.type === "error"
      ? COLORS.red
      : COLORS.blue;
  return (
    <div
      style={{
        fontSize: 11,
        lineHeight: 1.55,
        borderBottom: "1px solid rgba(255,255,255,0.04)",
        padding: "4px 0",
      }}
    >
      <span style={{ color: COLORS.dim }}>[{item.t}] </span>
      <span style={{ color }}>{item.msg}</span>
    </div>
  );
}

const sectionTitle = {
  fontSize: 12,
  color: COLORS.cyan,
  fontWeight: 950,
  letterSpacing: 1.4,
  marginBottom: 10,
  textTransform: "uppercase",
};
const label = {
  display: "block",
  fontSize: 12,
  color: COLORS.dim,
  marginTop: 9,
  marginBottom: 4,
};
const input = {
  width: "100%",
  padding: "9px 10px",
  borderRadius: 10,
  border: "1px solid rgba(0,216,255,0.25)",
  background: "#020B16",
  color: COLORS.text,
  outline: "none",
};
const smallBtn = {
  padding: "7px 0",
  borderRadius: 10,
  border: "1px solid rgba(0,216,255,0.25)",
  background: "#020B16",
  color: COLORS.cyan,
  fontWeight: 800,
  cursor: "pointer",
};
function button(color) {
  return {
    padding: "10px 12px",
    borderRadius: 12,
    border: `1px solid ${color}`,
    background: `${color}18`,
    color,
    fontWeight: 900,
    cursor: "pointer",
  };
}
