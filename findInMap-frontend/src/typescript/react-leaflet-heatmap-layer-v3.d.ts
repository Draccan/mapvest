declare module "react-leaflet-heatmap-layer-v3" {
    import { ReactElement } from "react";

    interface HeatmapLayerProps {
        points: any[];
        longitudeExtractor: (point: any) => number;
        latitudeExtractor: (point: any) => number;
        intensityExtractor: (point: any) => number;
        radius?: number;
        blur?: number;
        maxZoom?: number;
        gradient?: Record<number, string>;
    }

    export function HeatmapLayer(props: HeatmapLayerProps): ReactElement;
    export default function HeatmapLayer(
        props: HeatmapLayerProps,
    ): ReactElement;
}
