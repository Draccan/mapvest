import { CreateMapPointDto } from "../dtos/CreateMapPointDto";
import MapEntity from "../entities/MapEntity";
import { MapPointEntity } from "../entities/MapPointEntity";

export default interface MapRepository {
    findAllMapPoints(): Promise<MapPointEntity[]>;
    createMapPoint(data: CreateMapPointDto): Promise<MapPointEntity>;
    findMapPointById(id: number): Promise<MapPointEntity | null>;
    findMapByGroupId(groupId: string): Promise<MapEntity[]>;
}
