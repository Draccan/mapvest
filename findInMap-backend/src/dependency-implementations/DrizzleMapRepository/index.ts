import { eq, sql } from "drizzle-orm";
import mem from "mem";

import DbOrTransaction from "../../core/dependencies/DatabaseTransaction";
import MapRepository from "../../core/dependencies/MapRepository";
import CreateMapDto from "../../core/dtos/CreateMapDto";
import { CreateMapPointDto } from "../../core/dtos/CreateMapPointDto";
import MapEntity from "../../core/entities/MapEntity";
import { MapPointEntity } from "../../core/entities/MapPointEntity";
import { db } from "../../db";
import { mapPoints, maps } from "../../db/schema";
import { makeMapPointEntity } from "./converters/makeMapPointEntity";
import { makeMapEntity } from "./converters/makeMapEntity";

export class DrizzleMapRepository implements MapRepository {
    async findAllMapPoints(mapId: string): Promise<MapPointEntity[]> {
        const allMapPoints = await db
            .select({
                id: mapPoints.id,
                mapId: mapPoints.mapId,
                long: sql<number>`ST_X(${mapPoints.location})`,
                lat: sql<number>`ST_Y(${mapPoints.location})`,
                type: mapPoints.type,
                date: mapPoints.date,
                createdAt: mapPoints.createdAt,
                updatedAt: mapPoints.updatedAt,
            })
            .from(mapPoints)
            .where(eq(mapPoints.mapId, mapId));

        return allMapPoints.map(makeMapPointEntity);
    }

    async findMapByGroupId(groupId: string): Promise<MapEntity[]> {
        const dbMaps = await db
            .select()
            .from(maps)
            .where(eq(maps.groupId, groupId));

        return dbMaps.map(makeMapEntity);
    }

    memoizedFindMapByGroupId = mem(this.findMapByGroupId, {
        maxAge: 1000 * 60,
    });

    async createMapPoint(
        data: CreateMapPointDto,
        mapId: string,
    ): Promise<MapPointEntity> {
        const [createdMapPoint] = await db
            .insert(mapPoints)
            .values({
                location: sql`ST_GeomFromText(${`POINT(${data.long} ${data.lat})`}, 4326)`,
                type: data.type,
                date: data.date,
                mapId: mapId,
            })
            .returning({
                id: mapPoints.id,
                mapId: mapPoints.mapId,
                long: sql<number>`ST_X(${mapPoints.location})`,
                lat: sql<number>`ST_Y(${mapPoints.location})`,
                type: mapPoints.type,
                date: mapPoints.date,
                createdAt: mapPoints.createdAt,
                updatedAt: mapPoints.updatedAt,
            });

        return makeMapPointEntity(createdMapPoint);
    }

    async findMapPointById(id: number): Promise<MapPointEntity | null> {
        const [mapPoint] = await db
            .select({
                id: mapPoints.id,
                mapId: mapPoints.mapId,
                long: sql<number>`ST_X(${mapPoints.location})`,
                lat: sql<number>`ST_Y(${mapPoints.location})`,
                type: mapPoints.type,
                date: mapPoints.date,
                createdAt: mapPoints.createdAt,
                updatedAt: mapPoints.updatedAt,
            })
            .from(mapPoints)
            .where(eq(mapPoints.id, id));

        return mapPoint ? makeMapPointEntity(mapPoint) : null;
    }

    async createMap(
        groupId: string,
        data: CreateMapDto,
        dbInstance: DbOrTransaction = db,
    ): Promise<MapEntity> {
        const [createdMap] = await dbInstance
            .insert(maps)
            .values({
                name: data.name,
                groupId: groupId,
            })
            .returning();

        return makeMapEntity(createdMap);
    }
}
