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

/**
 * Run simulation using streaming endpoint with proper NDJSON parsing.
 * Falls back to standard endpoint if streaming fails.
 */
export async function runSimulation(payload: SimulationPayload): Promise<StepResult[]> {
    // Try stream endpoint first (preferred)
    try {
        const response = await fetch(`${API_BASE_URL}/api/simulate/simulate_stream`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            throw new Error(`Stream endpoint failed: ${response.status}`);
        }

        // Stream endpoint returns NDJSON (newline-delimited JSON)
        // Parse line by line instead of as single JSON object
        const text = await response.text();
        const lines = text.trim().split('\\n').filter(line => line.trim());

        const results: StepResult[] = [];
        for (const line of lines) {
            try {
                const step = JSON.parse(line);
                // Check for error in stream
                if (step.error) {
                    throw new Error(step.error);
                }
                results.push(step);
            } catch (parseError) {
                console.warn('Failed to parse line:', line, parseError);
            }
        }

        if (results.length === 0) {
            throw new Error('No valid results from stream');
        }

        return results;

    } catch (error) {
        console.warn('Stream simulation failed, falling back to standard endpoint...', error);

        // Fallback to standard endpoint (returns single JSON object)
        const response = await fetch(`${API_BASE_URL}/api/simulate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Simulation failed: ${response.status} - ${errorText}`);
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
    }
}
