import MapPointDto from "./MapPointDto";

export interface ImportRowError {
    row: number;
    error: string;
}

export default interface ImportMapPointsResultDto {
    imported: MapPointDto[];
    errors: ImportRowError[];
    totalRows: number;
    successCount: number;
    errorCount: number;
}
