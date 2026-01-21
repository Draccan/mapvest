import MapRepository from "../dependencies/MapRepository";
import { makeMapPointDto, MapPointDto } from "../dtos/MapPointDto";
import ItemNotFoundError from "../errors/ItemNotFoundError";

export default class GetPublicMapPoints {
    constructor(private mapRepository: MapRepository) {}

    async exec(publicMapId: string): Promise<MapPointDto[]> {
        const map = await this.mapRepository.findMapByPublicId(publicMapId);

        if (!map) {
            throw new ItemNotFoundError("Public map not found");
        }

        const mapPoints = await this.mapRepository.findAllMapPoints(map.id);
        return mapPoints.map(makeMapPointDto);
    }
}
