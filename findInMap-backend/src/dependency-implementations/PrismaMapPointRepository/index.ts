import { PrismaClient } from "@prisma/client";

import MapPointRepository from "../../core/dependencies/MapPointRepository";
import { CreateMapPointDto } from "../../core/dtos/CreateMapPointDto";
import { MapPointEntity } from "../../core/entities/MapPointEntity";
import makeMapPointEntity from "./converters/makeMapPointEntity";
import { MapPoint } from "./types";

export default class PrismaMapPointRepository implements MapPointRepository {
    constructor(private prisma: PrismaClient) {}

    async findAll(): Promise<MapPointEntity[]> {
        // Warning: Cast location to text to avoid Prisma deserialization issues
        const mapPoints = await this.prisma.$queryRaw<MapPoint[]>`
            SELECT 
                id,
                ST_X(location) as longitude,
                ST_Y(location) as latitude,
                type,
                date,
                created_at,
                updated_at
            FROM map_points 
            ORDER BY created_at DESC
        `;

        return mapPoints.map(makeMapPointEntity);
    }

    async create(data: CreateMapPointDto): Promise<MapPointEntity> {
        const result = await this.prisma.$queryRaw<MapPoint[]>`
            INSERT INTO map_points (location, type, date)
            VALUES (ST_SetSRID(ST_Point(${data.x}, ${data.y}), 4326), ${data.type}::"MapPointType", ${data.date})
            RETURNING 
                id,
                ST_X(location) as longitude,
                ST_Y(location) as latitude,
                type,
                date,
                created_at,
                updated_at
        `;

        return makeMapPointEntity(result[0]);
    }

    async findById(id: number): Promise<MapPointEntity | null> {
        const result = await this.prisma.$queryRaw<MapPoint[]>`
            SELECT 
                id,
                ST_X(location) as longitude,
                ST_Y(location) as latitude,
                type,
                date,
                created_at,
                updated_at
            FROM map_points 
            WHERE id = ${id}
        `;

        return result.length > 0 ? makeMapPointEntity(result[0]) : null;
    }
}
