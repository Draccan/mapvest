import { http, HttpResponse, passthrough } from "msw";
import { type MapPointDto } from "../src/core/dtos/MapPointDto";
import { MapPointType } from "../src/core/commons/enums";

let mockMapPoints: MapPointDto[] = [
    {
        id: 1,
        x: 41.90195,
        y: 12.504533,
        type: MapPointType.Theft,
        date: "01/01/2024",
        createdAt: new Date("2024-01-01"),
    },
    {
        id: 2,
        x: 41.9109,
        y: 12.4818,
        type: MapPointType.Aggression,
        date: "02/01/2024",
        createdAt: new Date("2024-01-02"),
    },
    {
        id: 3,
        x: 41.8986,
        y: 12.4768,
        type: MapPointType.Robbery,
        date: "03/01/2024",
        createdAt: new Date("2024-01-03"),
    },
];

export const handlers = [
    http.all("https://maps.googleapis.com/*", () => passthrough()),
    http.all("https://places.googleapis.com/*", () => passthrough()),
    http.get("http://localhost:3001/api/map-points", () => {
        return HttpResponse.json(mockMapPoints);
    }),

    http.post("http://localhost:3001/api/map-points", async ({ request }) => {
        const newPoint = (await request.json()) as Omit<
            MapPointDto,
            "id" | "createdAt"
        >;

        const mapPoint: MapPointDto = {
            ...newPoint,
            id: mockMapPoints.length + 1,
            createdAt: new Date(),
        };

        mockMapPoints.push(mapPoint);

        return HttpResponse.json(mapPoint, { status: 201 });
    }),
];
