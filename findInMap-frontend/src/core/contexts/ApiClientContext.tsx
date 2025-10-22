import { createContext, type ReactNode, useContext } from "react";
import ApiClient from "../ApiClient";

const ApiClientContext = createContext<ApiClient>(new ApiClient());

export const ApiClientProvider = ({ children }: { children: ReactNode }) => {
    const apiClient = new ApiClient();

    return (
        <ApiClientContext.Provider value={apiClient}>
            {children}
        </ApiClientContext.Provider>
    );
};

export const useApiClient = () => {
    const context = useContext(ApiClientContext);
    if (!context) {
        throw new Error("useApiClient must be used within ApiClientProvider");
    }
    return context;
};
