import type { MapPointDto } from "./MapPointDto";

export interface ImportError {
    row: number;
    error: string;
}

export interface ImportMapPointsResultDto {
    imported: MapPointDto[];
    errors: ImportError[];
    totalRows: number;
    successCount: number;
    errorCount: number;
}
