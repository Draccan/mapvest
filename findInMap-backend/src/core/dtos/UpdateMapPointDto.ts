import MapPointDto from "./MapPointDto";

export interface UpdateMapPointDto
    extends Omit<MapPointDto, "id" | "createdAt" | "long" | "lat"> {}
