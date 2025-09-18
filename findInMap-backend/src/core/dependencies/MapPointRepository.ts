import { CreateMapPointDto } from "../dtos/CreateMapPointDto";
import { MapPointEntity } from "../entities/MapPointEntity";

export default interface MapPointRepository {
    findAll(): Promise<MapPointEntity[]>;
    create(data: CreateMapPointDto): Promise<MapPointEntity>;
    findById(id: number): Promise<MapPointEntity | null>;
}
