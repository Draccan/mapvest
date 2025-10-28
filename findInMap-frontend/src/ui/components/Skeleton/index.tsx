import React from "react";
import "./style.css";

export const Skeleton: React.FC = () => {
    return (
        <div className="c-skeleton">
            <div className="c-skeleton-shimmer"></div>
        </div>
    );
};
