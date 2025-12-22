import { eq, sql, inArray, and } from "drizzle-orm";
import mem from "mem";

import DbOrTransaction from "../../core/dependencies/DatabaseTransaction";
import MapRepository from "../../core/dependencies/MapRepository";
import CreateCategoryDto from "../../core/dtos/CreateCategoryDto";
import CreateMapDto from "../../core/dtos/CreateMapDto";
import { CreateMapPointDto } from "../../core/dtos/CreateMapPointDto";
import { UpdateMapPointDto } from "../../core/dtos/UpdateMapPointDto";
import { MapCategoryEntity } from "../../core/entities/MapCategoryEntity";
import MapEntity from "../../core/entities/MapEntity";
import { MapPointEntity } from "../../core/entities/MapPointEntity";
import { db } from "../../db";
import { mapPoints, maps, mapCategories } from "../../db/schema";
import { makeMapCategoryEntity } from "./converters/makeMapCategoryEntity";
import { makeMapEntity } from "./converters/makeMapEntity";
import { makeMapPointEntity } from "./converters/makeMapPointEntity";

export class DrizzleMapRepository implements MapRepository {
    async findAllMapPoints(mapId: string): Promise<MapPointEntity[]> {
        const allMapPoints = await db
            .select({
                id: mapPoints.id,
                mapId: mapPoints.mapId,
                categoryId: mapPoints.categoryId,
                long: sql<number>`ST_X(${mapPoints.location})`,
                lat: sql<number>`ST_Y(${mapPoints.location})`,
                description: mapPoints.description,
                date: mapPoints.date,
                dueDate: mapPoints.dueDate,
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
                description: data.description,
                date: data.date,
                dueDate: data.dueDate,
                categoryId: data.categoryId,
                mapId: mapId,
            })
            .returning({
                id: mapPoints.id,
                mapId: mapPoints.mapId,
                categoryId: mapPoints.categoryId,
                long: sql<number>`ST_X(${mapPoints.location})`,
                lat: sql<number>`ST_Y(${mapPoints.location})`,
                description: mapPoints.description,
                date: mapPoints.date,
                dueDate: mapPoints.dueDate,
                createdAt: mapPoints.createdAt,
                updatedAt: mapPoints.updatedAt,
            });

        return makeMapPointEntity(createdMapPoint);
    }

    async deleteMapPoints(mapId: string, pointIds: string[]): Promise<void> {
        if (pointIds.length === 0) {
            return;
        }

        await db
            .delete(mapPoints)
            .where(
                and(
                    inArray(mapPoints.id, pointIds),
                    eq(mapPoints.mapId, mapId),
                ),
            );
    }

    async findMapPointById(id: string): Promise<MapPointEntity | null> {
        const [mapPoint] = await db
            .select({
                id: mapPoints.id,
                mapId: mapPoints.mapId,
                categoryId: mapPoints.categoryId,
                long: sql<number>`ST_X(${mapPoints.location})`,
                lat: sql<number>`ST_Y(${mapPoints.location})`,
                description: mapPoints.description,
                date: mapPoints.date,
                dueDate: mapPoints.dueDate,
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

    async createCategory(
        mapId: string,
        data: CreateCategoryDto,
    ): Promise<MapCategoryEntity> {
        const [createdCategory] = await db
            .insert(mapCategories)
            .values({
                mapId: mapId,
                description: data.description,
                color: data.color,
            })
            .returning();

        return makeMapCategoryEntity(createdCategory);
    }

    async findCategoriesByMapId(mapId: string): Promise<MapCategoryEntity[]> {
        const categories = await db
            .select()
            .from(mapCategories)
            .where(eq(mapCategories.mapId, mapId));

        return categories.map(makeMapCategoryEntity);
    }

    async updateMapPoint(
        pointId: string,
        mapId: string,
        data: UpdateMapPointDto,
    ): Promise<MapPointEntity | null> {
        const [updatedMapPoint] = await db
            .update(mapPoints)
            .set({
                description: data.description,
                date: data.date,
                dueDate: data.dueDate ?? null,
                categoryId: data.categoryId,
            })
            .where(and(eq(mapPoints.id, pointId), eq(mapPoints.mapId, mapId)))
            .returning({
                id: mapPoints.id,
                mapId: mapPoints.mapId,
                categoryId: mapPoints.categoryId,
                long: sql<number>`ST_X(${mapPoints.location})`,
                lat: sql<number>`ST_Y(${mapPoints.location})`,
                description: mapPoints.description,
                date: mapPoints.date,
                dueDate: mapPoints.dueDate,
                createdAt: mapPoints.createdAt,
                updatedAt: mapPoints.updatedAt,
            });

        if (!updatedMapPoint) {
            return null;
        }

        return makeMapPointEntity(updatedMapPoint);
    }
}
