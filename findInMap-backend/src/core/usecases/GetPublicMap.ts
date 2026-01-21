import MapRepository from "../dependencies/MapRepository";
import PublicMapDto, { makePublicMapDto } from "../dtos/PublicMapDto";
import ItemNotFoundError from "../errors/ItemNotFoundError";

export default class GetPublicMap {
    constructor(private mapRepository: MapRepository) {}

    async execute(publicMapId: string): Promise<PublicMapDto> {
        const map = await this.mapRepository.findMapByPublicId(publicMapId);

        if (!map) {
            throw new ItemNotFoundError("Public map not found");
        }

        return makePublicMapDto(map);
    }
}
