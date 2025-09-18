import { useState, useCallback } from "react";

import { API_URL } from "../../config";
import {
    type CreateMapPointDto,
    type CreateMapPointResponseDto,
} from "../dtos/CreateMapPointDto";

interface UseCreateMapPoint {
    loading: boolean;
    error: any;
    createMapPoint: (
        data: CreateMapPointDto,
    ) => Promise<CreateMapPointResponseDto | null>;
}

export const useCreateMapPoint = (): UseCreateMapPoint => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<any>(null);

    const createMapPoint = useCallback(
        async (
            data: CreateMapPointDto,
        ): Promise<CreateMapPointResponseDto | null> => {
            try {
                setLoading(true);
                setError(null);

                const response = await window.fetch(
                    `${API_URL}/api/map-points`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(data),
                    },
                );

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const result: CreateMapPointResponseDto = await response.json();
                return result;
            } catch (err) {
                setError(err);
                return null;
            } finally {
                setLoading(false);
            }
        },
        [],
    );

    return {
        loading,
        error,
        createMapPoint,
    };
};
