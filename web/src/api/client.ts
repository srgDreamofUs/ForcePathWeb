export interface StepResult {
    step: number;
    summary: string;
    current_height: number;
    force_scores?: Record<string, number>;
}

export interface SimulationPayload {
    sentence: string;
    steps: number;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
    || (import.meta.env.PROD
        ? 'https://forcepathweb.onrender.com'
        : 'http://localhost:8000');

export async function runSimulation(payload: SimulationPayload): Promise<StepResult[]> {
    // Try stream endpoint first (preferred)
    try {
        const response = await fetch(`${API_BASE_URL}/api/simulate/simulate_stream`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            throw new Error('Stream endpoint failed');
        }

        const data = await response.json();
        // Normalize response structure
        if (Array.isArray(data.steps)) {
            return data.steps;
        } else if (Array.isArray(data)) {
            return data;
        } else {
            return [data];
        }
    } catch (error) {
        console.warn('Stream simulation failed, falling back to standard endpoint...', error);

        // Fallback to standard endpoint
        const response = await fetch(`${API_BASE_URL}/api/simulate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            throw new Error('Simulation failed');
        }

        const data = await response.json();
        if (Array.isArray(data.steps)) {
            return data.steps;
        } else if (Array.isArray(data)) {
            return data;
        } else {
            return [data];
        }
    }
}
