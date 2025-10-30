import { useState, useCallback } from "react";

import { UnauthorizedError } from "../../api/errors/UnauthorizedError";

interface UseRequestWrapper<T> {
    fetch: (...args: any[]) => Promise<T | null>;
    loading: boolean;
    error: any;
}

export function useRequestWrapper<T, Args extends any[]>(
    apiRequest: (...args: Args) => Promise<T>,
): UseRequestWrapper<T> {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<any>(null);

    const fetch = useCallback(
        async (...args: Args): Promise<T | null> => {
            try {
                setLoading(true);
                setError(null);
                return await apiRequest(...args);
            } catch (err) {
                if (err instanceof UnauthorizedError) {
                    throw err;
                }
                const errorMessage =
                    err instanceof Error
                        ? err.message
                        : typeof err === "string"
                          ? err
                          : "An unexpected error occurred";
                setError(errorMessage);
                return null;
            } finally {
                setLoading(false);
            }
        },
        [apiRequest],
    );

    return { fetch, loading, error };
}
