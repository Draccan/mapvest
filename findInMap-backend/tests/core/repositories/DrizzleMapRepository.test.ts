import { MapPointType } from "../../../src/core/commons/enums";
import { CreateMapPointDto } from "../../../src/core/dtos/CreateMapPointDto";
import { db } from "../../../src/db";
import { mapPoints } from "../../../src/db/schema";
import { DrizzleMapRepository } from "../../../src/dependency-implementations/DrizzleMapRepository";

describe("DrizzleMapRepository", () => {
    let repository: DrizzleMapRepository;

    beforeAll(() => {
        repository = new DrizzleMapRepository();
    });

    beforeEach(async () => {
        await db.delete(mapPoints);
    });

    describe("createMapPoint", () => {
        it("should createMapPoint a new map point in the database", async () => {
            const createMapPointDto: CreateMapPointDto = {
                long: 12.4964,
                lat: 41.9028,
                type: MapPointType.Theft,
                date: "2024-01-01",
            };

            const result = await repository.createMapPoint(createMapPointDto);

            expect(result).toBeDefined();
            expect(result.id).toBeDefined();
            expect(result.long).toBe(createMapPointDto.long);
            expect(result.lat).toBe(createMapPointDto.lat);
            expect(result.type).toBe(createMapPointDto.type);
            expect(result.created_at).toBeInstanceOf(Date);
            expect(result.updated_at).toBeInstanceOf(Date);
        });

        it("should handle different map point types", async () => {
            const testCases = [
                {
                    type: MapPointType.Theft,
                    long: 10.0,
                    lat: 20.0,
                    date: "2024-01-01",
                },
                {
                    type: MapPointType.Aggression,
                    long: 15.0,
                    lat: 25.0,
                    date: "2024-01-02",
                },
                {
                    type: MapPointType.Robbery,
                    long: 20.0,
                    lat: 30.0,
                    date: "2024-01-03",
                },
            ];

            for (const testCase of testCases) {
                const result = await repository.createMapPoint(testCase);
                expect(result.type).toBe(testCase.type);
                expect(result.long).toBe(testCase.long);
                expect(result.lat).toBe(testCase.lat);
            }
        });
    });

    describe("findAllMapPoints", () => {
        it("should return empty array when no map points exist", async () => {
            const result = await repository.findAllMapPoints();
            expect(Array.isArray(result)).toBe(true);
            expect(result.length).toBe(0);
        });

        it("should return all map points when they exist", async () => {
            const testPoints = [
                {
                    long: 10,
                    lat: 20,
                    type: MapPointType.Theft,
                    date: "2024-01-01",
                },
                {
                    long: 30,
                    lat: 40,
                    type: MapPointType.Aggression,
                    date: "2024-01-02",
                },
                {
                    long: 50,
                    lat: 60,
                    type: MapPointType.Robbery,
                    date: "2024-01-03",
                },
            ];

            for (const point of testPoints) {
                await repository.createMapPoint(point);
            }

            const result = await repository.findAllMapPoints();

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
                long: 12.123456789,
                lat: 41.987654321,
                type: MapPointType.Theft,
                date: "2024-01-01",
            };

            await repository.createMapPoint(precisePoint);
            const result = await repository.findAllMapPoints();

            expect(result.length).toBe(1);
            expect(result[0].long).toBeCloseTo(precisePoint.long, 6);
            expect(result[0].lat).toBeCloseTo(precisePoint.lat, 6);
        });
    });
});
