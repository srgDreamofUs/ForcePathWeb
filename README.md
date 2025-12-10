# ForcePath

**ForcePath** is an experimental simulation engine that maps natural-language descriptions of social states into a continuous vector space and explores how they may evolve under different structural pressures. The system encodes text into embeddings, perturbs the state using a CMA-ES–based sampler, evaluates candidates against a set of force vectors and penalties, and selects the trajectory that converges toward lower “height” (interpreted as increased stability).

The project includes the full pipeline: embedding wrappers, force-vector definitions, penalty functions, CMA-ES search, decoding utilities, and a modern React-based Web UI for interactive exploration.

---

## Key Features

*   **Natural Language to Vector Mapping:** Seamlessly encodes text descriptions into high-dimensional vector spaces.
*   **Evolutionary Optimization:** Uses CMA-ES (Covariance Matrix Adaptation Evolution Strategy) to explore potential future states.
*   **Force Vector Analysis:** Evaluates states against defined structural pressures (forces) to determine stability.
*   **Interactive Web UI:** A modern, glassmorphic React interface for running simulations and visualizing trajectories.
*   **Bilingual Support:** Full English and Korean support in the Web UI, including AI-powered translation.
*   **Real-time Streaming:** Stream simulation steps in real-time to the frontend.

---

## How It Works (Conceptual Pipeline)

1.  **Encode:** The input text is converted into an embedding vector.
2.  **Perturb:** The system uses CMA-ES to generate localized variants of the current state vector.
3.  **Evaluate:** Each candidate is evaluated against a set of force vectors representing structural pressures.
4.  **Calculate Height:** A "height" (instability) score is computed using force products, distance penalties, and semantic constraints.
5.  **Select:** The candidate with the lowest height (highest stability) is selected as the next state.
6.  **Decode:** The resulting vector is decoded back into a natural-language description.
7.  **Iterate:** This process repeats for the configured number of steps to generate a trajectory.

---

## Architecture

The project consists of two main components:

### 1. Python Simulation Engine
*   **Embeddings:** Wrappers for OpenAI and other embedding models.
*   **Forces & Penalties:** Definitions of social forces and structural penalties.
*   **Engine:** The core CMA-ES sampler and simulator logic.
*   **Decoder:** Utilities for converting vectors back to text.

### 2. Web UI (Frontend)
*   **Framework:** React + TypeScript + Vite.
*   **Styling:** Tailwind CSS with a custom glassmorphic design system.
*   **Visualization:** Interactive stability graphs and step cards.
*   **Communication:** Connects to the Python backend via REST API (`/api/simulate`).

---

## Getting Started (Python Engine)

### Prerequisites
*   Python 3.10+
*   Node.js 18+ (for Web UI)

### Installation

1.  **Create a virtual environment:**
    ```bash
    python -m venv .venv
    source .venv/bin/activate     # Windows: .venv\Scripts\activate
    ```

2.  **Install dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

3.  **Environment Variables:**
    Create a `.env` file in the project root:
    ```ini
    OPENAI_API_KEY=<your-key>
    OPENAI_EMBED_MODEL=text-embedding-3-small   # optional override
    ```

4.  **Build the Cache:**
    Pre-embed force vectors and reference sentences to speed up simulation:
    ```bash
    python main.py build-cache
    ```
    This command loads force definitions and reference corpora under `data/`, generates embeddings, and stores them in `cache/`.

---

## Running ForcePath Web UI

The Web UI provides an interactive way to run simulations.

### 1. Start the Backend API
Run the FastAPI server to handle simulation requests:
```bash
python -m api.app.main
# Server running at http://127.0.0.1:8000
```

### 2. Start the Frontend
In a new terminal window:
```bash
cd web
npm install
npm run dev
```
Open your browser to `http://localhost:5173` (or the URL shown in the terminal).

### Features
*   **Input Scenario:** Type any social scenario to simulate.
*   **Stability Graph:** Visualize the stability of the trajectory over time.
*   **Step Cards:** Read the AI-generated summary for each predicted future state.
*   **Language Toggle:** Switch between English and Korean instantly.

![Web UI Screenshot Placeholder](docs/images/web-ui-screenshot.png)

---

## Command-Line Usage

You can also run simulations directly from the command line.

```bash
python main.py simulate \
  --sentence "The pace of technological advancement is outstripping social institutions." \
  --steps 4 \
  --output runs/latest.jsonl
```

*   Each step prints the selected candidate, its height, and the decoded summary.
*   When `--output` is provided, results are written to JSONL for downstream analysis.

---

## Python API Usage

You can integrate ForcePath into your own Python scripts:

```python
from src.engine.simulator import Simulator
from src.decoder.future_decoder import FutureDecoder

simulator = Simulator()
decoder = FutureDecoder()

sentence = "Society faces increasing polarization and uncertainty."

# Run simulation
for step in simulator.run(sentence, steps=4):
    summary = decoder.decode(step.force_scores, step.best_vector)
    print(f"Step {step.step + 1}: {summary['summary']}")
    print(f"Height: {step.best_height:.4f}\n")
```

---

## Configuration

Key parameters are defined in `src/config/settings.py`. All values may be overridden through environment variables.

| Parameter | Default | Description |
| :--- | :--- | :--- |
| `SIMULATION_STEPS` | 10 | Maximum number of steps |
| `SIMULATION_POPULATION` | 8 | CMA-ES population size |
| `SIMULATION_SIGMA` | 0.1 | Step size; lower values yield more gradual movement |
| `OPENAI_EMBED_MODEL` | `text-embedding-3-small` | Embedding model to use |

---

## Project Layout

```graphql
ForcePath/
├── LICENSE
├── README.md
├── requirements.txt
├── .gitignore
├── .env                     # User-supplied environment variables
├── main.py                  # CLI entry point
├── api/                     # FastAPI backend
│   ├── app/
│   │   ├── main.py          # API entry point
│   │   └── routes/          # API endpoints
├── src/
│   ├── config/              # Settings and parameter definitions
│   ├── embeddings/          # Embedding wrappers
│   ├── forces/              # Force vectors and utilities
│   ├── penalties/           # Distance and structural penalties
│   ├── engine/              # CMA-ES sampler and simulator
│   ├── decoder/             # Natural-language decoding
│   └── utils/               # Logging and helper functions
├── web/                     # React Web UI
│   ├── src/
│   │   ├── components/      # UI components (StabilityGraph, StepCard, etc.)
│   │   ├── hooks/           # Custom React hooks
│   │   └── utils/           # Frontend utilities
│   └── tailwind.config.cjs  # Styling configuration
├── data/
│   ├── forces/              # YAML force definitions
│   └── social_reference.yaml
├── cache/                   # Generated embeddings
├── runs/                    # Simulation outputs
└── test/                    # Unit tests
```

---

## License

MIT License. See [LICENSE](LICENSE) for details.