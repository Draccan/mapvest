import MapRepository from "../dependencies/MapRepository";
import { CreateMapPointDto } from "../dtos/CreateMapPointDto";
import { makeMapPointDto, MapPointDto } from "../dtos/MapPointDto";

export default class CreateMapPoint {
    constructor(private mapPointRepository: MapRepository) {}

    async exec(data: CreateMapPointDto): Promise<MapPointDto> {
        const mapPoint = await this.mapPointRepository.createMapPoint(data);

        return makeMapPointDto(mapPoint);
    }
}
