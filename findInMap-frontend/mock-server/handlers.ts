import { http, HttpResponse, passthrough, delay } from "msw";

import { type CategoryDto } from "../src/core/dtos/CategoryDto";
import { type MapPointDto } from "../src/core/dtos/MapPointDto";

let mockCategories: CategoryDto[] = [
    {
        id: "cat-1",
        description: "Customer",
        color: "#FF5733",
    },
    {
        id: "cat-2",
        description: "Supplier",
        color: "#33FF57",
    },
];

let mockMapPoints: MapPointDto[] = [
    {
        id: "1",
        lat: 41.90195,
        long: 12.504533,
        description: "Theft",
        date: "2025-12-03",
        createdAt: new Date("2024-01-01").toISOString(),
        categoryId: "cat-1",
    },
    {
        id: "2",
        lat: 41.9109,
        long: 12.4818,
        description: "Aggression",
        date: "2025-12-03",
        createdAt: new Date("2024-01-02").toISOString(),
        categoryId: "cat-2",
    },
    {
        id: "3",
        lat: 41.8986,
        long: 12.4768,
        description: "Robbery",
        date: "2025-12-03",
        createdAt: new Date("2024-01-03").toISOString(),
        categoryId: "cat-1",
    },
];

let mockUsers = [
    {
        id: "1",
        name: "Test",
        surname: "User",
        email: "a@b.com",
        password: "12345678",
    },
];

let mockGroups = [
    {
        id: "group-1",
        name: "First Group",
        role: "owner",
    },
];

let mockMaps = [
    {
        id: "map-1",
        groupId: "group-1",
        name: "First Map",
    },
];

let userIdCounter = 2;
let groupIdCounter = 2;
let mapIdCounter = 2;
let categoryIdCounter = 4;

export const handlers = [
    http.all("https://maps.googleapis.com/*", () => passthrough()),
    http.get("http://localhost:3001/search/addresses", async ({ request }) => {
        await delay(1000);
        const url = new URL(request.url);
        const text = url.searchParams.get("text") || "";

        const mockAddresses = [
            {
                label: text,
                lat: 41.9028,
                long: 12.4964,
            },
            {
                label: "456 Elm St, Townsville",
                lat: 41.8902,
                long: 12.4922,
            },
        ];
        return HttpResponse.json(mockAddresses);
    }),
    http.get("http://localhost:3001/groups", async () => {
        await delay(1000);
        return HttpResponse.json(mockGroups);
    }),
    http.get("http://localhost:3001/:groupId/maps", async ({ params }) => {
        await delay(1000);
        const { groupId } = params;
        const groupMaps = mockMaps.filter((map) => map.groupId === groupId);
        return HttpResponse.json(groupMaps);
    }),
    http.post(
        "http://localhost:3001/:groupId/maps",
        async ({ params, request }) => {
            await delay(1000);
            const { groupId } = params;
            const mapData = (await request.json()) as { name: string };

            const newMap = {
                id: `map-${mapIdCounter}`,
                groupId: groupId as string,
                name: mapData.name,
            };
            mockMaps.push(newMap);
            mapIdCounter++;

            return HttpResponse.json(newMap, { status: 201 });
        },
    ),
    http.get("http://localhost:3001/:groupId/maps/:mapId/points", async () => {
        await delay(1000);
        return HttpResponse.json(mockMapPoints);
    }),
    http.post(
        "http://localhost:3001/:groupId/maps/:mapId/points",
        async ({ request }) => {
            await delay(1000);
            const newPoint = (await request.json()) as Omit<
                MapPointDto,
                "id" | "createdAt"
            >;

            const mapPoint: MapPointDto = {
                ...newPoint,
                id: `${Date.now()}${Math.random()}`,
                createdAt: new Date().toISOString(),
            };

            mockMapPoints.push(mapPoint);

            return HttpResponse.json(mapPoint, { status: 201 });
        },
    ),
    http.delete(
        "http://localhost:3001/:groupId/maps/:mapId/points",
        async ({ request }) => {
            await delay(1000);
            const payload = (await request.json()) as { pointIds: string[] };

            if (!payload.pointIds || !Array.isArray(payload.pointIds)) {
                return HttpResponse.json(
                    { error: "pointIds array is required" },
                    { status: 400 },
                );
            }

            if (payload.pointIds.length === 0) {
                return HttpResponse.json(
                    { error: "pointIds array cannot be empty" },
                    { status: 400 },
                );
            }

            const deletedIds: string[] = [];

            payload.pointIds.forEach((pointId) => {
                const pointIndex = mockMapPoints.findIndex(
                    (point) => point.id === pointId,
                );

                if (pointIndex !== -1) {
                    mockMapPoints.splice(pointIndex, 1);
                    deletedIds.push(pointId);
                }
            });

            return HttpResponse.json(undefined, { status: 200 });
        },
    ),
    http.put(
        "http://localhost:3001/:groupId/maps/:mapId/points/:pointId",
        async ({ params, request }) => {
            await delay(1000);
            const { pointId } = params;
            const updateData = (await request.json()) as {
                description?: string;
                date: string;
                categoryId?: string;
            };

            const pointIndex = mockMapPoints.findIndex(
                (point) => point.id === pointId,
            );

            if (pointIndex === -1) {
                return HttpResponse.json(
                    { error: "Point not found" },
                    { status: 404 },
                );
            }

            mockMapPoints[pointIndex] = {
                ...mockMapPoints[pointIndex],
                ...updateData,
            };

            return HttpResponse.json(mockMapPoints[pointIndex], {
                status: 200,
            });
        },
    ),

    http.post("http://localhost:3001/users", async ({ request }) => {
        await delay(1000);
        const userData = (await request.json()) as {
            name: string;
            surname: string;
            email: string;
            password: string;
        };

        const existingUser = mockUsers.find(
            (user) => user.email === userData.email,
        );
        if (existingUser) {
            return HttpResponse.json(
                { error: "User with this email already exists" },
                { status: 409 },
            );
        }

        const newUser = {
            id: userIdCounter.toString(),
            ...userData,
        };
        mockUsers.push(newUser);

        const newGroup = {
            id: `group-${groupIdCounter}`,
            name: "First Group",
            role: "owner",
        };
        mockGroups.push(newGroup);

        const newMap = {
            id: `map-${mapIdCounter}`,
            groupId: newGroup.id,
            name: "First Map",
        };
        mockMaps.push(newMap);

        userIdCounter++;
        groupIdCounter++;
        mapIdCounter++;

        const { password, ...userResponse } = newUser;
        return HttpResponse.json(userResponse, { status: 201 });
    }),
    http.post("http://localhost:3001/users/login", async ({ request }) => {
        await delay(1000);
        const credentials = (await request.json()) as {
            email: string;
            password: string;
        };

        const user = mockUsers.find(
            (u) =>
                u.email === credentials.email &&
                u.password === credentials.password,
        );

        if (!user) {
            return HttpResponse.json(
                { error: "Invalid credentials" },
                { status: 401 },
            );
        }

        const mockToken = `mock.access.token.${user.id}.${Date.now()}`;
        const mockRefreshToken = `mock.refresh.token.${user.id}.${Date.now()}`;

        const { password, ...userResponse } = user;

        return HttpResponse.json({
            token: mockToken,
            refreshToken: mockRefreshToken,
            user: userResponse,
        });
    }),
    http.post("http://localhost:3001/token/refresh", async ({ request }) => {
        await delay(1000);
        const authHeader = request.headers.get("Authorization");

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return HttpResponse.json(
                { error: "Missing or invalid Authorization header" },
                { status: 400 },
            );
        }

        const refreshToken = authHeader.substring(7);

        if (!refreshToken || !refreshToken.startsWith("mock.refresh.token")) {
            return HttpResponse.json(
                { error: "Invalid or expired refresh token" },
                { status: 401 },
            );
        }

        const parts = refreshToken.split(".");
        const userId = parts[3];
        const newAccessToken = `mock.access.token.${userId}.${Date.now()}`;
        const newRefreshToken = `mock.refresh.token.${userId}.${Date.now()}`;

        return HttpResponse.json({
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
        });
    }),
    http.post("http://localhost:3001/users/logout", async () => {
        await delay(1000);
        return HttpResponse.json();
    }),
    http.post("http://localhost:3001/users/resetPassword", async () => {
        await delay(1000);

        return HttpResponse.json(undefined, { status: 200 });
    }),
    http.put("http://localhost:3001/users/password", async () => {
        await delay(1000);
        return HttpResponse.json(undefined, { status: 200 });
    }),
    http.get("http://localhost:3001/users/me", async ({ request }) => {
        await delay(1000);
        const authHeader = request.headers.get("Authorization");

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return HttpResponse.json(
                { error: "Missing or invalid Authorization header" },
                { status: 401 },
            );
        }

        const token = authHeader.substring(7);

        if (!token || !token.startsWith("mock.access.token")) {
            return HttpResponse.json(
                { error: "Invalid or expired access token" },
                { status: 401 },
            );
        }

        const parts = token.split(".");
        const userId = parts[3];

        const user = mockUsers.find((u) => u.id === userId);

        if (!user) {
            return HttpResponse.json(
                { error: "User not found" },
                { status: 404 },
            );
        }

        const { password, ...userResponse } = user;

        return HttpResponse.json(userResponse);
    }),
    http.put(
        "http://localhost:3001/users/:userId",
        async ({ params, request }) => {
            await delay(2000);
            const { userId } = params;
            const data = (await request.json()) as {
                currentPassword: string;
                newPassword: string;
            };

            const user = mockUsers.find((u) => u.id === userId);

            if (!user) {
                return HttpResponse.json(
                    { error: "User not found" },
                    { status: 404 },
                );
            }

            if (user.password !== data.currentPassword) {
                return HttpResponse.json(
                    { error: "Current password is incorrect" },
                    { status: 403 },
                );
            }

            user.password = data.newPassword;

            return HttpResponse.json(undefined, { status: 204 });
        },
    ),
    http.get(
        "http://localhost:3001/:groupId/maps/:mapId/categories",
        async () => {
            await delay(1000);
            return HttpResponse.json(mockCategories);
        },
    ),
    http.post(
        "http://localhost:3001/:groupId/maps/:mapId/categories",
        async ({ request }) => {
            await delay(1000);
            const newCategory = (await request.json()) as Omit<
                CategoryDto,
                "id"
            >;

            const category: CategoryDto = {
                ...newCategory,
                id: `cat-${categoryIdCounter}`,
            };

            mockCategories.push(category);
            categoryIdCounter++;

            return HttpResponse.json(category, { status: 201 });
        },
    ),
];
