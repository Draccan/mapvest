import MapEntity from "../entities/MapEntity";

export default interface MapDto {
    id: string;
    name: string;
}

export function makeMapDto(mapEntity: MapEntity): MapDto {
    return {
        id: mapEntity.id,
        name: mapEntity.name,
    };
}
