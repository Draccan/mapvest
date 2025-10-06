import request from "supertest";

import { createTestApp, testUser, testMapPoint } from "./helpers";

describe("E2E Tests", () => {
    let app: any;
    let server: any;

    beforeAll(async () => {
        const restInterface = createTestApp();
        app = restInterface["app"];
        server = app.listen(3002);
    });

    afterAll(async () => {
        if (server) {
            server.close();
        }
    });

    describe("Health and Info Routes", () => {
        it("GET /health should return health status", async () => {
            const response = await request(app).get("/health").expect(200);

            expect(response.body.status).toBe("ok");
            expect(response.body.message).toBeDefined();
            expect(response.body.timestamp).toBeDefined();
        });

        it("GET /info should return server info", async () => {
            const response = await request(app).get("/info").expect(200);

            expect(response.body).toHaveProperty("name");
            expect(response.body).toHaveProperty("version");
            expect(response.body).toHaveProperty("description");
            expect(response.body).toHaveProperty("swagger");
        });
    });

    describe("User Routes", () => {
        it("POST /users should create a new user", async () => {
            const uniqueUser = {
                ...testUser,
                email: `unique-${Date.now()}@example.com`,
            };

            const response = await request(app)
                .post("/users")
                .send(uniqueUser)
                .expect(201);

            expect(response.body).toHaveProperty("id");
            expect(response.body.name).toBe(uniqueUser.name);
            expect(response.body.surname).toBe(uniqueUser.surname);
            expect(response.body.email).toBe(uniqueUser.email);
            expect(response.body).not.toHaveProperty("password");
        });

        it("POST /users should return 409 for duplicate email", async () => {
            await request(app).post("/users").send(testUser);

            const response = await request(app)
                .post("/users")
                .send(testUser)
                .expect(409);

            expect(response.body).toHaveProperty("message");
        });

        it("POST /users/login should authenticate user", async () => {
            await request(app).post("/users").send(testUser);

            const response = await request(app)
                .post("/users/login")
                .send({
                    email: testUser.email,
                    password: testUser.password,
                })
                .expect(200);

            expect(response.body).toHaveProperty("token");
            expect(response.body).toHaveProperty("user");
            expect(response.body.user.email).toBe(testUser.email);
        });

        it("POST /users/login should return 401 for invalid credentials", async () => {
            const response = await request(app)
                .post("/users/login")
                .send({
                    email: "nonexistent@example.com",
                    password: "wrongpassword",
                })
                .expect(401);

            expect(response.body).toHaveProperty("error");
        });
    });

    describe("MapPoint Routes", () => {
        it("GET /map-points should return empty array initially", async () => {
            const response = await request(app)
                .get("/api/map-points")
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
        });

        it("POST /map-points should create a new map point", async () => {
            const response = await request(app)
                .post("/api/map-points")
                .send(testMapPoint)
                .expect(201);

            expect(response.body).toHaveProperty("id");
            expect(response.body.long).toBe(testMapPoint.long);
            expect(response.body.lat).toBe(testMapPoint.lat);
            expect(response.body.type).toBe(testMapPoint.type);
        });

        it("GET /map-points should return created map points", async () => {
            await request(app).post("/api/map-points").send(testMapPoint);

            const response = await request(app)
                .get("/api/map-points")
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBeGreaterThan(0);
        });
    });
});
