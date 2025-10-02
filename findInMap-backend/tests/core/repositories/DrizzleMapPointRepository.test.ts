import { MapPointType } from "../../../src/core/commons/enums";
import { CreateMapPointDto } from "../../../src/core/dtos/CreateMapPointDto";
import { db } from "../../../src/db";
import { mapPoints } from "../../../src/db/schema";
import { DrizzleMapPointRepository } from "../../../src/dependency-implementations/DrizzleMapPointRepository";

describe("DrizzleMapPointRepository", () => {
    let repository: DrizzleMapPointRepository;

    beforeAll(() => {
        repository = new DrizzleMapPointRepository();
    });

    beforeEach(async () => {
        await db.delete(mapPoints);
    });

    describe("create", () => {
        it("should create a new map point in the database", async () => {
            const createMapPointDto: CreateMapPointDto = {
                x: 12.4964,
                y: 41.9028,
                type: MapPointType.Theft,
                date: "2024-01-01",
            };

            const result = await repository.create(createMapPointDto);

            expect(result).toBeDefined();
            expect(result.id).toBeDefined();
            expect(result.x).toBe(createMapPointDto.x);
            expect(result.y).toBe(createMapPointDto.y);
            expect(result.type).toBe(createMapPointDto.type);
            expect(result.created_at).toBeInstanceOf(Date);
            expect(result.updated_at).toBeInstanceOf(Date);
        });

        it("should handle different map point types", async () => {
            const testCases = [
                {
                    type: MapPointType.Theft,
                    x: 10.0,
                    y: 20.0,
                    date: "2024-01-01",
                },
                {
                    type: MapPointType.Aggression,
                    x: 15.0,
                    y: 25.0,
                    date: "2024-01-02",
                },
                {
                    type: MapPointType.Robbery,
                    x: 20.0,
                    y: 30.0,
                    date: "2024-01-03",
                },
            ];

            for (const testCase of testCases) {
                const result = await repository.create(testCase);
                expect(result.type).toBe(testCase.type);
                expect(result.x).toBe(testCase.x);
                expect(result.y).toBe(testCase.y);
            }
        });
    });

    describe("findAll", () => {
        it("should return empty array when no map points exist", async () => {
            const result = await repository.findAll();
            expect(Array.isArray(result)).toBe(true);
            expect(result.length).toBe(0);
        });

        it("should return all map points when they exist", async () => {
            const testPoints = [
                { x: 10, y: 20, type: MapPointType.Theft, date: "2024-01-01" },
                {
                    x: 30,
                    y: 40,
                    type: MapPointType.Aggression,
                    date: "2024-01-02",
                },
                {
                    x: 50,
                    y: 60,
                    type: MapPointType.Robbery,
                    date: "2024-01-03",
                },
            ];

            for (const point of testPoints) {
                await repository.create(point);
            }

            const result = await repository.findAll();

            expect(result.length).toBe(3);
            expect(result.every((point) => point.id !== undefined)).toBe(true);
            expect(
                result.every((point) => point.created_at instanceof Date),
            ).toBe(true);
            expect(
                result.every((point) => point.updated_at instanceof Date),
            ).toBe(true);

            const types = result.map((point) => point.type);
            expect(types).toContain(MapPointType.Theft);
            expect(types).toContain(MapPointType.Aggression);
            expect(types).toContain(MapPointType.Robbery);
        });

        it("should preserve coordinate precision", async () => {
            const precisePoint = {
                x: 12.123456789,
                y: 41.987654321,
                type: MapPointType.Theft,
                date: "2024-01-01",
            };

            await repository.create(precisePoint);
            const result = await repository.findAll();

            expect(result.length).toBe(1);
            expect(result[0].x).toBeCloseTo(precisePoint.x, 6);
            expect(result[0].y).toBeCloseTo(precisePoint.y, 6);
        });
    });
});
