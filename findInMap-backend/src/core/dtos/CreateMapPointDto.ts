import MapPointDto from "./MapPointDto";

export default interface CreateMapPointDto
    extends Omit<MapPointDto, "id" | "createdAt"> {}
