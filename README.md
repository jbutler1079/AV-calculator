# AV Calculator

A browser-based calculator for common audio/visual industry calculations.

## Features

| Calculator | What it computes |
|---|---|
| **Speaker Impedance** | Total impedance for speakers wired in series or parallel (add as many speakers as needed) |
| **SPL** | Estimated Sound Pressure Level at a given distance, based on speaker sensitivity and amplifier power |
| **Projector Throw** | Throw distance from screen width (or vice-versa) using the projector's throw ratio |
| **Amplifier Power** | Output power from RMS voltage + load impedance, or required voltage from power + load |
| **Cable Loss** | Round-trip speaker cable resistance, power loss (% and dB), and damping factor |

## Project structure

```
AV-calculator/
├── index.html          # Main page / entry point
├── css/
│   └── style.css       # Stylesheet
├── js/
│   └── calculator.js   # Calculator logic
└── README.md
```

## Usage

Open `index.html` directly in any modern web browser – no build step or server required.

## Contributing

1. Fork the repository and create a feature branch.
2. Add or update code under the existing `js/` and `css/` directories, or edit `index.html`.
3. Open a pull request from your fork describing your changes.

Questions and bug reports are welcome as GitHub issues. Code changes should always be submitted as a pull request so they can be reviewed before merging.
