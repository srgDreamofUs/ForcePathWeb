# ForcePath Web UI

A modern, glassmorphic React interface for the ForcePath social trajectory simulator. This frontend visualizes how social states evolve under structural pressures, providing an interactive way to explore the simulation engine.

![ForcePath UI](https://via.placeholder.com/1200x600?text=ForcePath+Web+UI)

## 🌟 Features

- **Interactive Simulation**: Input any social scenario and watch it evolve.
- **Glassmorphic Design**: Modern, clean UI with pastel gradients and jelly animations.
- **Bilingual Support**: Instant toggle between English and Korean.
- **AI-Powered Translations**: Automatic translation of simulation results using OpenAI.
- **Stability Visualization**: Real-time graph showing the stability trajectory of the society.
- **Responsive**: Fully optimized for desktop and mobile devices.

## 🛠️ Technology Stack

- **Framework**: [React](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Animations**: CSS Keyframes + Tailwind

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Python Backend running (see root README)

### Installation

1.  **Navigate to the web directory:**
    ```bash
    cd web
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Configure Environment:**
    Copy the example environment file:
    ```bash
    cp example.env .env
    ```
    Edit `.env` and add your keys:
    ```ini
    VITE_OPENAI_API_KEY=sk-...  # Required for translations/summaries
    VITE_API_BASE_URL=http://localhost:8000
    ```

4.  **Run Development Server:**
    ```bash
    npm run dev
    ```
    Open `http://localhost:5173` in your browser.

## 📦 Project Structure

```
web/
├── src/
│   ├── api/            # API client & types
│   ├── components/     # UI Components (InputPanel, StepCard, etc.)
│   ├── hooks/          # Custom Hooks (useLanguage, useTrajectorySummary)
│   ├── styles/         # Global CSS
│   ├── utils/          # Helpers (normalization, translations)
│   ├── App.tsx         # Main Layout
│   └── main.tsx        # Entry Point
├── public/
└── ...config files
```

## 🔒 Security Note

This project is designed to be GitHub-safe.
- No API keys are committed.
- All sensitive data is loaded via `.env`.
- `example.env` is provided as a template.

## 📄 License

MIT License. See [LICENSE](./LICENSE) for details.
