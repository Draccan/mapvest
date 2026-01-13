import { useState, useCallback } from "react";
import toast from "react-hot-toast";

import { UnauthorizedError } from "../../api/errors/UnauthorizedError";

interface UseRequestWrapper<T> {
    fetch: (...args: any[]) => Promise<T | null>;
    loading: boolean;
    error: any;
}

export function useRequestWrapper<T, Args extends any[]>(
    apiRequest: (...args: Args) => Promise<T>,
    errorMessage?: string,
    successMessage?: string,
): UseRequestWrapper<T> {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<any>(null);

    const fetch = useCallback(
        async (...args: Args): Promise<T | null> => {
            try {
                setLoading(true);
                setError(null);
                const result = await apiRequest(...args);
                if (successMessage) {
                    toast.success(successMessage, { duration: 5000 });
                }
                return result;
            } catch (err) {
                if (err instanceof UnauthorizedError) {
                    throw err;
                }
                const serverErrorMessage =
                    err instanceof Error
                        ? err.message
                        : typeof err === "string"
                          ? err
                          : "An unexpected error occurred";
                setError(serverErrorMessage);

                // Show toast notification with custom error message if provided
                if (errorMessage) {
                    toast.error(errorMessage, { duration: 7000 });
                }

                return null;
            } finally {
                setLoading(false);
            }
        },
        [apiRequest],
    );

    return { fetch, loading, error };
}
