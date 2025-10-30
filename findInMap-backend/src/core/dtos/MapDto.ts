import MapEntity from "../entities/MapEntity";

export default interface MapDto {
    id: string;
    name: string;
}

export function makeGroupDto(mapEntity: MapEntity): MapDto {
    return {
        id: mapEntity.id,
        name: mapEntity.name,
    };
}
