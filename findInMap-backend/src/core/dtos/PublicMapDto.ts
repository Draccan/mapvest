import MapEntity from "../entities/MapEntity";

export default interface PublicMapDto {
    name: string;
    publicId: string;
}

export function makePublicMapDto(mapEntity: MapEntity): PublicMapDto {
    return {
        name: mapEntity.name,
        publicId: mapEntity.publicId!,
    };
}
