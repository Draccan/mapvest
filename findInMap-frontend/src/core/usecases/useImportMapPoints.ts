import { useIntl } from "react-intl";
import toast from "react-hot-toast";

import { useApiClient } from "../contexts/ApiClientContext";
import type { ImportMapPointsResultDto } from "../dtos/ImportMapPointsResultDto";
import { useRequestWrapper } from "./utils/useRequestWrapper";

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            const base64 = result.split(",")[1];
            resolve(base64);
        };
        reader.onerror = (error) => reject(error);
    });
};

interface UseImportMapPoints {
    loading: boolean;
    error: any;
    importMapPoints: (
        groupId: string,
        mapId: string,
        file: File,
    ) => Promise<ImportMapPointsResultDto | null>;
}

export const useImportMapPoints = (): UseImportMapPoints => {
    const apiClient = useApiClient();
    const intl = useIntl();

    const { fetch, loading, error } = useRequestWrapper(
        (
            groupId: string,
            mapId: string,
            fileName: string,
            base64Content: string,
        ) => apiClient.importMapPoints(groupId, mapId, fileName, base64Content),
        intl.formatMessage({ id: "errors.importMapPoints" }),
    );

    const importMapPoints = async (
        groupId: string,
        mapId: string,
        file: File,
    ): Promise<ImportMapPointsResultDto | null> => {
        const loadingToastId = toast.loading(
            intl.formatMessage({ id: "messages.importingMapPoints" }),
        );

        const base64Content = await fileToBase64(file);
        const result = await fetch(groupId, mapId, file.name, base64Content);

        toast.dismiss(loadingToastId);

        if (result) {
            if (result.errorCount > 0 && result.successCount > 0) {
                toast.success(
                    intl.formatMessage(
                        { id: "messages.importMapPointsPartialSuccess" },
                        {
                            successCount: result.successCount,
                            errorCount: result.errorCount,
                        },
                    ),
                    { duration: 5000 },
                );
            } else if (result.errorCount === 0) {
                toast.success(
                    intl.formatMessage(
                        { id: "messages.importMapPointsSuccess" },
                        { count: result.successCount },
                    ),
                    { duration: 5000 },
                );
            } else {
                toast.error(
                    intl.formatMessage({
                        id: "messages.importMapPointsAllFailed",
                    }),
                    { duration: 7000 },
                );
            }
        }

        return result;
    };

    return {
        loading,
        error,
        importMapPoints,
    };
};
