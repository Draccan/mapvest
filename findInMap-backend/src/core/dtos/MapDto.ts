import MapEntity from "../entities/MapEntity";

export default interface MapDto {
    id: string;
    name: string;
    isPublic: boolean;
    publicId: string | null;
}

export function makeMapDto(mapEntity: MapEntity): MapDto {
    return {
        id: mapEntity.id,
        name: mapEntity.name,
        isPublic: mapEntity.isPublic,
        publicId: mapEntity.publicId,
    };
}
