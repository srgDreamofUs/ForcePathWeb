import { useState, useCallback } from 'react';
import { runSimulation, StepResult, SimulationPayload } from '../api/client';
import { useLanguage } from './useLanguage';

export function useSimulation() {
    const { t } = useLanguage();
    const [results, setResults] = useState<StepResult[]>([]);
    const [isRunning, setIsRunning] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const executeSimulation = useCallback(async (payload: SimulationPayload) => {
        setIsRunning(true);
        setError(null);
        setResults([]);

        try {
            const data = await runSimulation(payload);
            setResults(data);
        } catch (err) {
            console.error(err);
            setError(t.errorModel);
        } finally {
            setIsRunning(false);
        }
    }, [t]);

    return {
        results,
        isRunning,
        error,
        run: executeSimulation,
        clearResults: () => setResults([])
    };
}
