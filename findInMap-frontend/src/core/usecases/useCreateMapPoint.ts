import { useState, useCallback } from "react";

import { API_URL } from "../../config";
import TokenStorageService from "../../utils/TokenStorageService";
import { type CreateMapPointDto } from "../dtos/CreateMapPointDto";
import type { MapPointDto } from "../dtos/MapPointDto";

interface UseCreateMapPoint {
    loading: boolean;
    error: any;
    createMapPoint: (data: CreateMapPointDto) => Promise<MapPointDto | null>;
}

export const useCreateMapPoint = (): UseCreateMapPoint => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<any>(null);

    const createMapPoint = useCallback(
        async (data: CreateMapPointDto): Promise<MapPointDto | null> => {
            try {
                setLoading(true);
                setError(null);

                const accessToken = TokenStorageService.getAccessToken();

                const response = await window.fetch(`${API_URL}/map-points`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${accessToken}`,
                    },
                    body: JSON.stringify(data),
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const result: MapPointDto = await response.json();
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
