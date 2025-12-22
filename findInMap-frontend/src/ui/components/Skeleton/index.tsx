import React from "react";
import "./style.css";

interface SkeletonProps {
    width?: string;
    height?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ width, height }) => {
    return (
        <div
            className="c-skeleton"
            style={{
                width: width || "100%",
                height: height || "100%",
            }}
        >
            <div className="c-skeleton-shimmer"></div>
        </div>
    );
};
