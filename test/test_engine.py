import numpy as np

from src.engine.height_calculator import HeightCalculator
from src.engine.simulator import Simulator
from src.penalties.distance_penalty import DistancePenalty


class StubForceInteraction:
    def __init__(self, product: float) -> None:
        self.product = product

    def multiplicative_score(self, vector: np.ndarray) -> float:
        return self.product


class StubPenalties:
    def __init__(self, value: float) -> None:
        self.value = value

    def total(self, candidate: np.ndarray, current: np.ndarray) -> float:
        return self.value


def test_distance_penalty_scales_with_alpha():
    penalty = DistancePenalty(alpha=0.5)
    a = np.zeros(3)
    b = np.array([2.0, 0.0, 0.0])
    result = penalty(a, b)
    assert result > 1.0
    assert np.isclose(result, 1.0 + 0.5 * 2.0)


def test_height_calculator_combines_force_and_penalties():
    candidate = np.array([0.2, 0.4])
    current = np.array([0.1, 0.1])
    force_interaction = StubForceInteraction(product=2.0)
    penalties = StubPenalties(value=3.0)
    calculator = HeightCalculator(
        force_interaction=force_interaction, penalties=penalties
    )
    height = calculator.height(candidate, current)
    assert np.isclose(height, 3.0 / (2.0 + calculator.epsilon))


class DummyForceInteraction:
    def dot_products(self, vector: np.ndarray) -> dict:
        return {"force": float(vector.sum())}

    def multiplicative_score(self, vector: np.ndarray) -> float:
        return 1.0 + float(np.sum(vector**2))


class DummyHeightCalculator:
    def __init__(self) -> None:
        self.force_interaction = DummyForceInteraction()
        self.epsilon = 1e-6

    def height(self, candidate: np.ndarray, current: np.ndarray) -> float:
        return float(np.sum(candidate**2))


class DummyRunner:
    def sample(self, current: np.ndarray):
        return [current + 1, current - 1]


class SimulatorHarness(Simulator):
    def __init__(self) -> None:
        super().__init__(height_calculator=DummyHeightCalculator(), runner=DummyRunner())

    def _embed_sentence(self, sentence: str) -> np.ndarray:
        return np.zeros(2)


def test_simulator_returns_step_results():
    simulator = SimulatorHarness()
    results = simulator.run("seed", steps=2)
    assert len(results) == 2
    assert all(result.best_height >= 0 for result in results)

