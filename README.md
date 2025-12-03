# ForcePath

ForcePath is a simulation engine that projects natural-language descriptions of social states into embedding space and explores plausible future trajectories.

Given an input sentence, the system encodes it using OpenAI embeddings, generates candidate transitions via CMA-ES, and evaluates each candidate using force vectors, penalties, and semantic proximity. The result is a multi-step path that converges toward increasingly stable configurations.

This repository includes the full pipeline: embedding wrappers, force-vector construction, CMA-ES–based search, height evaluation, natural-language decoding, and reproducible run logs.

## Quick Start

```bash
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

### Required Environment Variables

Create a `.env` file in the project root:

```env
OPENAI_API_KEY=<your-key-here>
OPENAI_EMBED_MODEL=text-embedding-4   # optional
```

### Building the Force Cache

Force vectors and reference sentences are pre-embedded for efficient simulation:

```bash
python main.py build-cache
```

This command loads force definitions and reference corpora under `data/`, generates embeddings, and stores them in `cache/`.

### Running a Simulation

```bash
python main.py simulate \
  --sentence "The pace of technological advancement is outstripping social institutions." \
  --steps 4 \
  --output runs/latest.jsonl
```

The CLI prints the height, dominant forces, and decoded summaries for each step. When `--output` is provided, steps are saved as JSONL records under `runs/`.

The engine uses CMA-ES to generate local variants of the current state and selects the candidate with the minimal height.

## Configuration

Key simulation parameters are defined in `src/config/settings.py`:

| Parameter | Default | Description |
|-----------|---------|-------------|
| `SIMULATION_STEPS` | 10 | Maximum simulation steps |
| `SIMULATION_POPULATION` | 8 | CMA-ES population size |
| `SIMULATION_SIGMA` | 0.1 | CMA-ES step size (lower = more gradual changes) |
| `OPENAI_EMBED_MODEL` | text-embedding-4 | OpenAI embedding model |

You can override these via environment variables in your `.env` file.

## Python API Usage

```python
from src.engine.simulator import Simulator
from src.decoder.future_decoder import FutureDecoder

# Initialize simulator
simulator = Simulator()
decoder = FutureDecoder()

# Run simulation
sentence = "Society faces increasing polarization and uncertainty."
for step_result in simulator.run(sentence, steps=4):
    summary = decoder.decode(step_result.force_scores, step_result.best_vector)
    print(f"Step {step_result.step + 1}: {summary['summary']}")
    print(f"Height: {step_result.best_height:.4f}\n")
```

## Testing

```bash
pytest
```

Unit tests cover the core engine, embedding utilities, decoders, and penalty functions in the `test/` directory.

## Project Structure

```text
ForcePath/
├── LICENSE                 # MIT License
├── README.md              # This file
├── requirements.txt       # Python dependencies
├── .gitignore            # Git exclusions
├── .env                  # Environment variables (create this)
├── main.py               # CLI entry point
├── src/
│   ├── config/           # Settings and configuration
│   ├── embeddings/       # OpenAI embedding wrapper
│   ├── forces/           # Force vector construction
│   ├── penalties/        # Distance and social penalties
│   ├── engine/           # CMA-ES sampler and simulator
│   ├── decoder/          # Natural language decoder (GPT-4o)
│   └── utils/            # Logging and I/O utilities
├── data/
│   ├── forces/           # Force definitions (YAML)
│   └── social_reference.yaml  # Reference sentences
├── cache/                # Precomputed embeddings (.gitkeep)
├── runs/                 # Simulation outputs (.gitkeep)
│   └── example.jsonl     # Example output structure
└── test/                 # Unit tests
```

## How It Works

1. **Embedding**: Input sentence → GPT-4o embedding vector
2. **Force Evaluation**: Compute alignment with 8 social force vectors (security, sustainability, hierarchy, equality, solidarity, identity, technology, market)
3. **CMA-ES Search**: Generate candidate future states around current position
4. **Height Calculation**: Evaluate stability using force product, social penalty, and distance penalty
5. **Selection**: Choose candidate with lowest height (most stable)
6. **Decoding**: Use GPT-4o to generate concrete natural language description
7. **Iteration**: Repeat for specified number of steps

## Notes

- ForcePath is designed as a reproducible, inspectable experimental system rather than a fixed predictive model
- All parameters can be tuned in `settings.py` or via environment variables
- The system is suitable for experimentation, research, and potential integration into interactive tools
- Lower `SIMULATION_SIGMA` values produce more gradual, realistic transitions

## License

MIT License - see [LICENSE](LICENSE) for details.