import MapEntity from "../../../core/entities/MapEntity";
import { Map } from "../../../db/schema";

export const makeMapEntity = (map: Map): MapEntity => {
    return {
        id: map.id,
        groupId: map.groupId,
        name: map.name,
        isPublic: map.isPublic ?? false,
        publicId: map.publicId,
    };
};
