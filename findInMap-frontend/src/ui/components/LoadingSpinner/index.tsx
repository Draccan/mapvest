import React from "react";
import { Loader2 } from "lucide-react";
import "./style.css";

export const LoadingSpinner: React.FC = () => {
    return <Loader2 className="c-loading-spinner" size={18} />;
};
