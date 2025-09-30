import { eq, sql } from "drizzle-orm";

import MapPointRepository from "../../core/dependencies/MapPointRepository";
import { CreateMapPointDto } from "../../core/dtos/CreateMapPointDto";
import { MapPointEntity } from "../../core/entities/MapPointEntity";
import { db } from "../../db";
import { mapPoints } from "../../db/schema";
import { makeMapPointEntity } from "./converters/makeMapPointEntity";

export class DrizzleMapPointRepository implements MapPointRepository {
    async findAll(): Promise<MapPointEntity[]> {
        const allMapPoints = await db
            .select({
                id: mapPoints.id,
                x: sql<number>`ST_X(${mapPoints.location})`,
                y: sql<number>`ST_Y(${mapPoints.location})`,
                type: mapPoints.type,
                date: mapPoints.date,
                createdAt: mapPoints.createdAt,
                updatedAt: mapPoints.updatedAt,
            })
            .from(mapPoints);

        return allMapPoints.map(makeMapPointEntity);
    }

    async create(data: CreateMapPointDto): Promise<MapPointEntity> {
        const [createdMapPoint] = await db
            .insert(mapPoints)
            .values({
                location: sql`ST_GeomFromText(${`POINT(${data.y} ${data.x})`}, 4326)`,
                type: data.type,
                date: data.date,
            })
            .returning({
                id: mapPoints.id,
                x: sql<number>`ST_X(${mapPoints.location})`,
                y: sql<number>`ST_Y(${mapPoints.location})`,
                type: mapPoints.type,
                date: mapPoints.date,
                createdAt: mapPoints.createdAt,
                updatedAt: mapPoints.updatedAt,
            });

        return makeMapPointEntity(createdMapPoint);
    }

    async findById(id: number): Promise<MapPointEntity | null> {
        const [mapPoint] = await db
            .select({
                id: mapPoints.id,
                x: sql<number>`ST_X(${mapPoints.location})`,
                y: sql<number>`ST_Y(${mapPoints.location})`,
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
