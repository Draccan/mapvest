import { http, HttpResponse, passthrough, delay } from "msw";

import { type CategoryDto } from "../src/core/dtos/CategoryDto";
import { type MapPointDto } from "../src/core/dtos/MapPointDto";

let mockCategories: CategoryDto[] = [
    {
        id: "74f9aa54-dd40-4f63-9d50-1c2387b2623d",
        description: "Test",
        color: "#FF5733",
    },
    {
        id: "77e9e792-f2a3-4c47-95f1-d5f692124047",
        description: "Test 2 cat",
        color: "#3633ff",
    },
];

let mockMapPointsMap1: MapPointDto[] = [
    {
        id: "9403dab5-aa23-4680-bf21-0b9d31867874",
        long: 13.740255476095486,
        lat: 42.62991729384455,
        description: "THEFT",
        date: "2025-11-07",
        dueDate: "2025-12-11",
        createdAt: "2025-11-07T07:46:12.491Z",
    },
    {
        id: "c6649416-8731-4207-8ea0-1dca20fde4ed",
        long: 13.74373061232151,
        lat: 42.635145645200105,
        description: "Theft",
        date: "2025-11-19",
        createdAt: "2025-11-19T17:07:12.106Z",
    },
    {
        id: "2a4a1ac8-4052-47ec-ad4a-98c4bf47078e",
        long: 13.2220985,
        lat: 43.7009486,
        description: "CASA",
        date: "2025-11-21",
        createdAt: "2025-11-21T15:32:02.152Z",
    },
    {
        id: "80af8a67-cf68-46c9-9e34-79197dd4cb23",
        long: 13.23441040341626,
        lat: 43.70335248759944,
        description: "SUOCERI",
        date: "2025-11-21",
        createdAt: "2025-11-21T15:32:15.800Z",
    },
    {
        id: "da719f73-d475-4fb6-9d48-11b5291112a1",
        long: 13.739096298989303,
        lat: 42.63261983110725,
        description: "Test",
        date: "2025-11-26",
        categoryId: "74f9aa54-dd40-4f63-9d50-1c2387b2623d",
        createdAt: "2025-11-26T18:02:08.152Z",
    },
    {
        id: "1c950da1-8ff9-42ad-998d-c64b0d6ab274",
        long: 13.73540477238822,
        lat: 42.632998709756215,
        description: "Test2",
        date: "2025-11-26",
        categoryId: "77e9e792-f2a3-4c47-95f1-d5f692124047",
        createdAt: "2025-11-26T18:02:30.920Z",
    },
    {
        id: "6d524949-ac8f-4478-a950-057595abcac1",
        long: 13.738796663489452,
        lat: 42.63116744158582,
        description: "Test3",
        date: "2025-12-03",
        categoryId: "74f9aa54-dd40-4f63-9d50-1c2387b2623d",
        createdAt: "2025-12-03T16:16:59.498Z",
    },
    {
        id: "8fc0fc4d-21d8-4e43-98a2-31ed001fec34",
        long: 13.743131779906895,
        lat: 42.627125831507094,
        description: "Test4",
        date: "2025-12-03",
        categoryId: "74f9aa54-dd40-4f63-9d50-1c2387b2623d",
        createdAt: "2025-12-03T16:17:13.751Z",
    },
    {
        id: "db309330-5a2f-4378-914f-96fa6ce30f36",
        long: 13.746821692514757,
        lat: 42.63306185597348,
        description: "TestAModifica",
        date: "2025-11-18",
        categoryId: "74f9aa54-dd40-4f63-9d50-1c2387b2623d",
        createdAt: "2025-11-18T17:28:25.455Z",
    },
    {
        id: "522762e3-77fd-4ad6-9c33-57c8971ef87e",
        long: 13.743860656566163,
        lat: 42.63334601315828,
        description: "AAA-Modifica",
        date: "2025-12-03",
        categoryId: "77e9e792-f2a3-4c47-95f1-d5f692124047",
        createdAt: "2025-11-19T17:07:17.861Z",
    },
    {
        id: "686616fe-6db2-45b1-b190-df85bbe7cb65",
        long: 13.740790902469485,
        lat: 42.6337248873865,
        description: "Test Modifica Again",
        date: "2025-11-24",
        createdAt: "2025-11-24T15:25:26.235Z",
    },
    {
        id: "4ca37276-cf43-4f92-99db-909ad2d24cc0",
        long: 13.739096298989303,
        lat: 42.63261983110725,
        description: "AAA",
        date: "2025-12-02",
        createdAt: "2025-12-03T17:46:15.682Z",
    },
    {
        id: "9ecc90b9-a71e-442f-9c6f-359f010f1fd7",
        long: 13.746996178379833,
        lat: 42.630820126026684,
        description: "THEFT",
        date: "2025-11-08",
        createdAt: "2025-11-07T07:46:14.542Z",
    },
    {
        id: "2d9a1c64-5e92-4848-b025-bdfb55545809",
        long: 13.731585183947168,
        lat: 42.63350387770033,
        date: "2025-11-27",
        categoryId: "77e9e792-f2a3-4c47-95f1-d5f692124047",
        createdAt: "2025-11-26T18:03:35.872Z",
    },
    {
        id: "44f9efa8-1afa-43ff-99d3-7903e03e22af",
        long: 13.284821011186533,
        lat: 43.677700524230545,
        description: "GENITORI",
        date: "2025-11-21",
        categoryId: "77e9e792-f2a3-4c47-95f1-d5f692124047",
        createdAt: "2025-11-21T15:32:30.280Z",
    },
    {
        id: "55fc476b-d80a-4aa0-acf7-2608951f212d",
        long: 13.2028576477987,
        lat: 43.71188608243436,
        description: "AAA",
        date: "2025-12-12",
        categoryId: "74f9aa54-dd40-4f63-9d50-1c2387b2623d",
        createdAt: "2025-12-12T14:18:23.206Z",
    },
    {
        id: "2acb48cb-d01e-4e58-aa56-3dee2a185a43",
        long: 13.214716374339247,
        lat: 43.71648368614917,
        description: "AAA",
        date: "2025-12-12",
        categoryId: "74f9aa54-dd40-4f63-9d50-1c2387b2623d",
        createdAt: "2025-12-12T14:18:30.626Z",
    },
    {
        id: "fdf37cf9-1d6c-4ccb-837b-d9c0f5a14fa6",
        long: 13.209957911346288,
        lat: 43.712451229629735,
        description: "AAA",
        date: "2025-12-12",
        dueDate: "2025-12-19",
        categoryId: "74f9aa54-dd40-4f63-9d50-1c2387b2623d",
        createdAt: "2025-12-12T14:18:26.623Z",
    },
    {
        id: "87e90263-5554-4ea2-af43-234d3b8b90a4",
        long: 13.220008544556979,
        lat: 43.714928290280646,
        description: "Rocca",
        date: "2025-12-17",
        dueDate: "2025-12-18",
        categoryId: "77e9e792-f2a3-4c47-95f1-d5f692124047",
        createdAt: "2025-12-17T17:15:25.100Z",
    },
    {
        id: "9d29f30b-caad-47c6-ae6d-66596f5e029c",
        long: 13.21584570134272,
        lat: 43.71512833605614,
        description: "Poste",
        date: "2025-12-17",
        dueDate: "2025-12-24",
        categoryId: "77e9e792-f2a3-4c47-95f1-d5f692124047",
        createdAt: "2025-12-17T17:15:48.092Z",
    },
];

let mockMapPointsMap2: MapPointDto[] = [
    {
        id: "map2-point-1",
        long: 11.255814,
        lat: 43.769562,
        description: "Firenze Centro",
        date: "2025-12-20",
        createdAt: "2025-12-20T10:00:00.000Z",
    },
    {
        id: "map2-point-2",
        long: 11.248785,
        lat: 43.773472,
        description: "Duomo di Firenze",
        date: "2025-12-21",
        categoryId: "74f9aa54-dd40-4f63-9d50-1c2387b2623d",
        createdAt: "2025-12-21T14:30:00.000Z",
    },
];

const getMapPoints = (mapId: string): MapPointDto[] => {
    if (mapId === "map-1") return mockMapPointsMap1;
    if (mapId === "map-2") return mockMapPointsMap2;
    return [];
};

const setMapPoints = (mapId: string, points: MapPointDto[]) => {
    if (mapId === "map-1") mockMapPointsMap1 = points;
    else if (mapId === "map-2") mockMapPointsMap2 = points;
};

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
    {
        id: "map-2",
        groupId: "group-1",
        name: "Second Map",
    },
];

let mockGroupUsers = [
    {
        id: "user-1",
        name: "John",
        surname: "Doe",
        email: "john.doe@example.com",
        userGroupRole: "owner",
        groupId: "group-1",
    },
    {
        id: "user-2",
        name: "Jane",
        surname: "Smith",
        email: "jane.smith@example.com",
        userGroupRole: "contributor",
        groupId: "group-1",
    },
];

let userIdCounter = 2;
let groupIdCounter = 2;
let mapIdCounter = mockMaps.length + 1;
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
    http.get(
        "http://localhost:3001/groups/:groupId/users",
        async ({ params }) => {
            await delay(1000);
            const { groupId } = params;
            const groupUsers = mockGroupUsers.filter(
                (user) => user.groupId === groupId,
            );
            return HttpResponse.json(groupUsers);
        },
    ),
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
    http.get(
        "http://localhost:3001/:groupId/maps/:mapId/points",
        async ({ params }) => {
            await delay(1000);
            const { mapId } = params;
            const points = getMapPoints(mapId as string);
            return HttpResponse.json(points);
        },
    ),
    http.post(
        "http://localhost:3001/:groupId/maps/:mapId/points",
        async ({ params, request }) => {
            await delay(1000);
            const { mapId } = params;
            const newPoint = (await request.json()) as Omit<
                MapPointDto,
                "id" | "createdAt"
            >;

            const mapPoint: MapPointDto = {
                ...newPoint,
                id: `${Date.now()}${Math.random()}`,
                createdAt: new Date().toISOString(),
            };

            const currentPoints = getMapPoints(mapId as string);
            setMapPoints(mapId as string, [...currentPoints, mapPoint]);

            return HttpResponse.json(mapPoint, { status: 201 });
        },
    ),
    http.delete(
        "http://localhost:3001/:groupId/maps/:mapId/points",
        async ({ params, request }) => {
            await delay(1000);
            const { mapId } = params;
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

            const currentPoints = getMapPoints(mapId as string);
            const filteredPoints = currentPoints.filter(
                (point) => !payload.pointIds.includes(point.id),
            );
            setMapPoints(mapId as string, filteredPoints);

            return HttpResponse.json(undefined, { status: 200 });
        },
    ),
    http.put(
        "http://localhost:3001/:groupId/maps/:mapId/points/:pointId",
        async ({ params, request }) => {
            await delay(1000);
            const { mapId, pointId } = params;
            const updateData = (await request.json()) as {
                description?: string;
                date: string;
                categoryId?: string;
                dueDate?: string;
            };

            const currentPoints = getMapPoints(mapId as string);
            const pointIndex = currentPoints.findIndex(
                (point) => point.id === pointId,
            );

            if (pointIndex === -1) {
                return HttpResponse.json(
                    { error: "Point not found" },
                    { status: 404 },
                );
            }

            currentPoints[pointIndex] = {
                ...currentPoints[pointIndex],
                dueDate: updateData.dueDate,
                ...updateData,
            };

            setMapPoints(mapId as string, currentPoints);

            return HttpResponse.json(currentPoints[pointIndex], {
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
    http.put(
        "http://localhost:3001/groups/:groupId",
        async ({ params, request }) => {
            await delay(1000);
            const { groupId } = params;
            const updateData = (await request.json()) as { name: string };

            const groupIndex = mockGroups.findIndex(
                (group) => group.id === groupId,
            );

            if (groupIndex === -1) {
                return HttpResponse.json(
                    { error: "Group not found" },
                    { status: 404 },
                );
            }

            mockGroups[groupIndex] = {
                ...mockGroups[groupIndex],
                name: updateData.name,
            };

            return HttpResponse.json(mockGroups[groupIndex], { status: 200 });
        },
    ),
    http.put(
        "http://localhost:3001/:groupId/maps/:mapId",
        async ({ params, request }) => {
            await delay(1000);
            const { groupId, mapId } = params;
            const updateData = (await request.json()) as { name: string };

            const mapIndex = mockMaps.findIndex(
                (map) => map.id === mapId && map.groupId === groupId,
            );

            if (mapIndex === -1) {
                return HttpResponse.json(
                    { error: "Map not found" },
                    { status: 404 },
                );
            }

            mockMaps[mapIndex] = {
                ...mockMaps[mapIndex],
                name: updateData.name,
            };

            return HttpResponse.json(mockMaps[mapIndex], { status: 200 });
        },
    ),
    http.post(
        "http://localhost:3001/groups/:groupId/users",
        async ({ params, request }) => {
            await delay(2000);
            const { groupId } = params;
            const payload = (await request.json()) as {
                userEmails: string[];
            };

            if (
                !payload.userEmails ||
                !Array.isArray(payload.userEmails) ||
                payload.userEmails.length === 0
            ) {
                return HttpResponse.json(
                    {
                        error: "userEmails array is required and cannot be empty",
                    },
                    { status: 400 },
                );
            }

            payload.userEmails.forEach((email) => {
                const existingUser = mockGroupUsers.find(
                    (user) => user.email === email && user.groupId === groupId,
                );

                if (!existingUser) {
                    const newUser = {
                        id: `user-${++userIdCounter}`,
                        name: email.split("@")[0],
                        surname: "New",
                        email: email,
                        userGroupRole: "contributor",
                        groupId: groupId as string,
                    };
                    mockGroupUsers.push(newUser);
                }
            });

            return HttpResponse.json(undefined, { status: 204 });
        },
    ),
];
