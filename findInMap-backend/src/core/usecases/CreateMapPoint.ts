import MapRepository from "../dependencies/MapRepository";
import { CreateMapPointDto } from "../dtos/CreateMapPointDto";
import { makeMapPointDto, MapPointDto } from "../dtos/MapPointDto";
import { RateLimitError } from "../errors/RateLimitError";
import { RateLimitService } from "../services/RateLimitService";

export default class CreateMapPoint {
    constructor(
        private mapPointRepository: MapRepository,
        private rateLimitService: RateLimitService,
    ) {}

    async exec(
        data: CreateMapPointDto,
        clientIp: string,
    ): Promise<MapPointDto> {
        if (!this.rateLimitService.isAllowed(clientIp)) {
            const remainingTime =
                this.rateLimitService.getRemainingTime(clientIp);
            throw new RateLimitError(remainingTime);
        }

        const mapPoint = await this.mapPointRepository.createMapPoint(data);

        this.rateLimitService.recordRequest(clientIp);

        return makeMapPointDto(mapPoint);
    }
}
