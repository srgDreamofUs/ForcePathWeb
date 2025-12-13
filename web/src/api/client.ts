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
            // Throw to trigger fallback
            throw new Error(`Stream endpoint failed: ${response.status}`);
        }

        if (!response.body) {
            throw new Error('ReadableStream not supported in this browser.');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");
        const results: StepResult[] = [];
        let buffer = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            // Decode chunk and append to buffer
            buffer += decoder.decode(value, { stream: true });

            // Split buffer by newlines
            const lines = buffer.split('\n');

            // Keep the last part in the buffer (it might be incomplete)
            // If the buffer ended with \n, the last element is empty string, which is fine to keep as buffer
            buffer = lines.pop() || '';

            for (const line of lines) {
                const trimmedLine = line.trim();
                if (!trimmedLine) continue;

                try {
                    const step = JSON.parse(trimmedLine);

                    // Check for backend-reported error in the stream object
                    if (step.error) {
                        throw new Error(step.error);
                    }

                    results.push(step);
                } catch (e) {
                    console.warn('Failed to parse NDJSON line:', trimmedLine, e);
                    // Do not throw here, try to continue processing other lines
                }
            }
        }

        // Process any remaining buffer (though for NDJSON usually ends with newline)
        if (buffer.trim()) {
            try {
                const step = JSON.parse(buffer.trim());
                if (step.error) throw new Error(step.error);
                results.push(step);
            } catch (e) {
                console.warn('Failed to parse final buffer:', buffer, e);
            }
        }

        if (results.length === 0) {
            throw new Error('No valid results received from stream');
        }

        return results;

    } catch (error) {
        console.warn('Stream simulation failed, falling back to standard endpoint...', error);

        // Fallback to standard endpoint
        const response = await fetch(`${API_BASE_URL}/api/simulate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        // Ensure we read the text to avoid unconsumed body issues, 
        // and try to parse even on error to see if backend sent a detail
        const text = await response.text();

        if (!response.ok) {
            throw new Error(`Fallback simulation failed: ${response.status} - ${text.substring(0, 200)}`);
        }

        try {
            const data = JSON.parse(text);
            // Normalize response
            if (Array.isArray(data.steps)) {
                return data.steps;
            } else if (Array.isArray(data)) {
                return data;
            } else {
                return [data];
            }
        } catch (e) {
            throw new Error(`Failed to parse fallback response: ${e}`);
        }
    }
}
