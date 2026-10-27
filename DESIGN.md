# Mathfest Quiz Design Specification

## 1. Overview
A high-production, cinematic quiz interface for a live college event. The experience mimics the dramatic tension of "Who Wants to Be a Millionaire" (Crorepati) but is themed for a Mathematics festival.

## 2. Core Gameplay Logic
- **Progression**: 5 Questions per team $\rightarrow$ Increasing difficulty.
- **Scoring**:
    - Correct: Add question value to team total.
    - Incorrect: 0 points for the question, but the run continues.
- **Lifelines**: 1 use per team (Choose between 50:50 or Audience Vote).
- **Cash-out**: Optional walk-away between questions.
- **Control**: Hybrid control. The host manages the overall flow (start team, move to next question, reveal results), but **teams interact directly with the screen to select and lock their answers**.
- **Timer**: The timer starts automatically as soon as the question is displayed on the screen.
- **Reveal**: The correct answer is only revealed after the team has locked in their choice.

## 3. Visual Identity & Motion
### Theme: "Mathematical Void"
- **Background**: Deep black/near-black.
- **Ambient FX**: 
    - Subtle drifting white particles (canvas/Three.js).
    - Occasional star glints and a soft vignette.
    - A central, abstract 3D mathematical form (Brain-like/Geometric) that rotates slowly.
- **Palette**:
    - **Primary**: Electric Blue / Deep Violet (Stage outlines, accents).
    - **Text**: Pure White (High readability).
    - **Accents**: Warm Gold (Active milestones, point values).

### 3D Integration (img2threejs Inspired)
Instead of flat images, the assets will be treated as 3D planes in a Three.js scene:
- **Logo**: A 3D disk with a slight bevel, floating in the center of the welcome screen.
- **Question Cards**: 3D panels that "slide" or "flip" into view with a perspective shift when a new question is loaded.
- **Depth**: Using `Three.js` to create a parallax effect where the UI elements feel layered over the space background.

## 4. User Flow
1. **Welcome Screen**: 
    - 3D Mathfest Logo floating in space.
    - Team Name input $\rightarrow$ "Start Quiz" $\rightarrow$ Cinematic transition.
2. **Live Quiz Screen**:
    - **Header**: Team Name | Current Score | Timer (Countdown).
    - **Center**: The Question Panel (Top) + 4 Answer Grid (Bottom).
    - **Side**: Points Ladder (Highlighted current rung).
    - **Footer**: Host Controls (Lock Answer, Reveal, Next, Lifeline, Bank/Stop).
3. **Result Screen**:
    - Final Score display.
    - "Next Team" / "Return to Setup" options.

## 5. Technical Stack
- **Frontend**: HTML5, CSS3 (Flex/Grid), Vanilla JavaScript.
- **3D Engine**: Three.js (for the cinematic space environment and asset depth).
- **Data**: External `questions.json` for easy editing.
- **Deployment**: Local server (No backend required).
