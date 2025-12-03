from __future__ import annotations

import argparse
from pathlib import Path

from src.decoder.future_decoder import FutureDecoder
from src.engine.simulator import Simulator
from src.forces.force_builder import rebuild_force_cache
from src.utils.io_utils import append_jsonl
from src.utils.logger import get_logger

logger = get_logger("ForcePathCLI")


def cmd_build_cache(args: argparse.Namespace) -> None:
    cache_path = rebuild_force_cache()
    logger.info("Force cache saved to %s", cache_path)


def cmd_simulate(args: argparse.Namespace) -> None:
    simulator = Simulator()
    decoder = FutureDecoder()
    
    # Default steps to 4 if not provided
    steps = args.steps if args.steps is not None else 4
    
    logger.info(f"Starting simulation for {steps} steps...")
    
    payload = []
    
    # Iterate over the generator
    for step_result in simulator.run(args.sentence, steps=steps):
        # Immediate decoding
        summary_data = decoder.decode(step_result.force_scores, step_result.best_vector)
        summary_text = summary_data["summary"]
        
        # Print to stdout immediately
        print(f"\n--- Step {step_result.step + 1} Prediction ---")
        print(summary_text)
        print("-" * 30)
        
        if args.output:
            record = step_result.to_dict()
            record["summary"] = summary_text
            payload.append(record)

    if args.output:
        append_jsonl(Path(args.output), payload)
        logger.info("Simulation written to %s", args.output)


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="ForcePath CLI")
    sub = parser.add_subparsers(dest="command", required=True)

    cache_parser = sub.add_parser("build-cache", help="Rebuild force vector cache")
    cache_parser.set_defaults(func=cmd_build_cache)

    sim_parser = sub.add_parser("simulate", help="Simulate future path")
    sim_parser.add_argument("--sentence", required=True, help="Input sentence")
    sim_parser.add_argument("--steps", type=int, default=None, help="Simulation steps")
    sim_parser.add_argument(
        "--output", type=str, default=None, help="Optional JSONL output path"
    )
    sim_parser.set_defaults(func=cmd_simulate)
    return parser


def main() -> None:
    parser = build_parser()
    args = parser.parse_args()
    args.func(args)


if __name__ == "__main__":
    main()

