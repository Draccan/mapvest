import MapPointRepository from "../dependencies/MapPointRepository";
import { makeMapPointDto, MapPointDto } from "../dtos/MapPointDto";

export default class GetMapPoints {
    constructor(private mapPointRepository: MapPointRepository) {}

    async exec(): Promise<MapPointDto[]> {
        const mapPoints = await this.mapPointRepository.findAll();
        return mapPoints.map(makeMapPointDto);
    }
}
