import { eq, sql } from "drizzle-orm";

import MapRepository from "../../core/dependencies/MapRepository";
import { CreateMapPointDto } from "../../core/dtos/CreateMapPointDto";
import MapEntity from "../../core/entities/MapEntity";
import { MapPointEntity } from "../../core/entities/MapPointEntity";
import { db } from "../../db";
import { mapPoints, maps } from "../../db/schema";
import { makeMapPointEntity } from "./converters/makeMapPointEntity";
import { makeMapEntity } from "./converters/makeMapEntity";

export class DrizzleMapRepository implements MapRepository {
    async findAllMapPoints(): Promise<MapPointEntity[]> {
        const allMapPoints = await db
            .select({
                id: mapPoints.id,
                long: sql<number>`ST_X(${mapPoints.location})`,
                lat: sql<number>`ST_Y(${mapPoints.location})`,
                type: mapPoints.type,
                date: mapPoints.date,
                createdAt: mapPoints.createdAt,
                updatedAt: mapPoints.updatedAt,
            })
            .from(mapPoints);

        return allMapPoints.map(makeMapPointEntity);
    }

    async findMapByGroupId(groupId: string): Promise<MapEntity[]> {
        const dbMaps = await db
            .select()
            .from(maps)
            .where(eq(maps.groupId, groupId));

        return dbMaps.map(makeMapEntity);
    }

    async createMapPoint(data: CreateMapPointDto): Promise<MapPointEntity> {
        const [createdMapPoint] = await db
            .insert(mapPoints)
            .values({
                location: sql`ST_GeomFromText(${`POINT(${data.long} ${data.lat})`}, 4326)`,
                type: data.type,
                date: data.date,
            })
            .returning({
                id: mapPoints.id,
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
}
