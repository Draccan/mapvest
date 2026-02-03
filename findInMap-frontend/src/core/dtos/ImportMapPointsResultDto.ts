import type { MapPointDto } from "./MapPointDto";

export interface ImportError {
    row: number;
    message: string;
}

export interface ImportMapPointsResultDto {
    imported: MapPointDto[];
    errors: ImportError[];
    totalRows: number;
    successCount: number;
    errorCount: number;
}
