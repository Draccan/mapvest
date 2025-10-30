import MapRepository from "../dependencies/MapRepository";
import { makeMapPointDto, MapPointDto } from "../dtos/MapPointDto";

export default class GetMapPoints {
    constructor(private mapPointRepository: MapRepository) {}

    async exec(): Promise<MapPointDto[]> {
        const mapPoints = await this.mapPointRepository.findAllMapPoints();
        return mapPoints.map(makeMapPointDto);
    }
}
