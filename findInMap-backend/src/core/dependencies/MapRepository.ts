import CreateMapDto from "../dtos/CreateMapDto";
import { CreateMapPointDto } from "../dtos/CreateMapPointDto";
import { UpdateMapPointDto } from "../dtos/UpdateMapPointDto";
import UpdateMapDto from "../dtos/UpdateMapDto";
import CreateCategoryDto from "../dtos/CreateCategoryDto";
import MapEntity from "../entities/MapEntity";
import { MapPointEntity } from "../entities/MapPointEntity";
import { MapCategoryEntity } from "../entities/MapCategoryEntity";
import DbOrTransaction from "./DatabaseTransaction";

export default interface MapRepository {
    createMapPoint(
        data: CreateMapPointDto,
        mapId: string,
    ): Promise<MapPointEntity>;
    deleteMapPoints(mapId: string, pointIds: string[]): Promise<void>;
    findAllMapPoints(mapId: string): Promise<MapPointEntity[]>;
    findMapPointById(id: string): Promise<MapPointEntity | null>;
    findMapByGroupId(groupId: string): Promise<MapEntity[]>;
    memoizedFindMapByGroupId(groupId: string): Promise<MapEntity[]>;
    createMap(
        groupId: string,
        data: CreateMapDto,
        dbInstance?: DbOrTransaction,
    ): Promise<MapEntity>;
    createCategory(
        mapId: string,
        data: CreateCategoryDto,
    ): Promise<MapCategoryEntity>;
    findCategoriesByMapId(mapId: string): Promise<MapCategoryEntity[]>;
    updateMapPoint(
        pointId: string,
        mapId: string,
        data: UpdateMapPointDto,
    ): Promise<MapPointEntity | null>;
    updateMap(
        mapId: string,
        groupId: string,
        data: UpdateMapDto,
    ): Promise<MapEntity | null>;
    invalidateMapsCache(): void;
}
