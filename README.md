# AeroAxen Resilience Lab

A defensive, simulation-only React dashboard for demonstrating drone-swarm resilience to GNSS/PNT integrity problems such as spoofing-like position anomalies, RF/GNSS jamming, time-shift anomalies, command-integrity anomalies, and hybrid interference.

## Project structure

```text
AeroAxen-Resilience-Lab/
├── public/
├── src/
│   ├── AeroAxen.jsx
│   ├── App.js
│   └── index.tsx
├── .gitignore
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.js
└── README.md
```

`src/AeroAxen.jsx` contains the full upgraded interactive simulation component. `src/App.js` and `src/index.tsx` preserve the CodeSandbox-style entry structure shown in the original project.

## Run locally

Install Node.js, then run:

```bash
npm install
npm run dev
```

Open the local URL shown by Vite.

## Production build

```bash
npm run build
```

The production output is generated in `dist/`.

## GitHub upload

1. Create a new empty GitHub repository named `AeroAxen-Resilience-Lab`.
2. Extract this ZIP.
3. Upload the **contents** of this folder so `package.json` is at the repository root.
4. Do not upload `node_modules/` if you later install dependencies locally.
5. Commit the files.

## Vercel deployment

After the GitHub repository is ready:

1. Import the repository into Vercel.
2. Framework preset: **Vite**.
3. Build command: `npm run build`.
4. Output directory: `dist`.
5. Deploy.

## Safety scope

This project is a defensive visual simulation. It does not transmit RF signals, generate operational spoofing signals, control a real aircraft, or provide attack instructions.
