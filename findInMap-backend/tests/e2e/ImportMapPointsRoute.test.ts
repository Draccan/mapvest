import request from "supertest";
import * as XLSX from "xlsx";

import { DrizzleGroupRepository } from "../../src/dependency-implementations/DrizzleGroupRepository";
import { getTestApp } from "./setup";

function createExcelFile(
    data: Record<string, unknown>[],
    headers?: string[],
): string {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data, { header: headers });
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
    return buffer.toString("base64");
}

function createCsvContent(rows: string[][]): string {
    const csvString = rows.map((row) => row.join(",")).join("\n");
    return Buffer.from(csvString).toString("base64");
}

describe("Import Map Points Route", () => {
    let app: any;
    let accessToken: string;
    let groupId: string;
    let mapId: string;
    let categoryId: string;

    beforeAll(async () => {
        app = getTestApp();

        const uniqueUser = {
            name: "Import",
            surname: "TestUser",
            email: `import-test-${Date.now()}@example.com`,
            password: "testpass123",
        };

        await request(app).post("/users").send(uniqueUser);

        const loginResponse = await request(app).post("/users/login").send({
            email: uniqueUser.email,
            password: uniqueUser.password,
        });

        accessToken = loginResponse.body.token;
        const userId = loginResponse.body.user.id;

        const groupRepository = new DrizzleGroupRepository();
        const group = await groupRepository.createGroup(
            "Import Test Group",
            userId,
        );
        groupId = group.id;

        const mapResponse = await request(app)
            .post(`/${groupId}/maps`)
            .set("Authorization", `Bearer ${accessToken}`)
            .send({ name: "Import Test Map" });

        mapId = mapResponse.body.id;

        const categoryResponse = await request(app)
            .post(`/${groupId}/maps/${mapId}/categories`)
            .set("Authorization", `Bearer ${accessToken}`)
            .send({ description: "Test Category", color: "#FF0000" });

        categoryId = categoryResponse.body.id;
    });

    it("POST /:groupId/maps/:mapId/points/import should import points from Excel file", async () => {
        const excelData = [
            {
                description: "Point 1",
                latitude: 45.4642,
                longitude: 9.19,
                date: "2025-12-03",
            },
            {
                description: "Point 2",
                latitude: 41.9028,
                longitude: 12.4964,
                date: "2025-12-04",
                notes: "Some notes",
            },
        ];

        const fileContent = createExcelFile(excelData);

        const response = await request(app)
            .post(`/${groupId}/maps/${mapId}/points/import`)
            .set("Authorization", `Bearer ${accessToken}`)
            .send({
                file: {
                    name: "points.xlsx",
                    content: fileContent,
                },
            })
            .expect(200);

        expect(response.body.totalRows).toBe(2);
        expect(response.body.successCount).toBe(2);
        expect(response.body.errorCount).toBe(0);
        expect(response.body.imported).toHaveLength(2);
        expect(response.body.imported[0].description).toBe("Point 1");
        expect(response.body.imported[1].description).toBe("Point 2");
        expect(response.body.imported[1].notes).toBe("Some notes");
    });

    it("POST /:groupId/maps/:mapId/points/import should import points from CSV file", async () => {
        const csvRows = [
            ["description", "latitude", "longitude", "date"],
            ["CSV Point 1", "45.4642", "9.19", "2025-12-05"],
            ["CSV Point 2", "41.9028", "12.4964", "2025-12-06"],
        ];

        const fileContent = createCsvContent(csvRows);

        const response = await request(app)
            .post(`/${groupId}/maps/${mapId}/points/import`)
            .set("Authorization", `Bearer ${accessToken}`)
            .send({
                file: {
                    name: "points.csv",
                    content: fileContent,
                },
            })
            .expect(200);

        expect(response.body.totalRows).toBe(2);
        expect(response.body.successCount).toBe(2);
        expect(response.body.errorCount).toBe(0);
        expect(response.body.imported[0].description).toBe("CSV Point 1");
    });

    it("POST /:groupId/maps/:mapId/points/import should use today as default date when missing", async () => {
        const excelData = [
            {
                description: "No Date Point",
                latitude: 45.4642,
                longitude: 9.19,
            },
        ];

        const fileContent = createExcelFile(excelData);

        const response = await request(app)
            .post(`/${groupId}/maps/${mapId}/points/import`)
            .set("Authorization", `Bearer ${accessToken}`)
            .send({
                file: {
                    name: "points.xlsx",
                    content: fileContent,
                },
            })
            .expect(200);

        expect(response.body.successCount).toBe(1);
        const today = new Date().toISOString().split("T")[0];
        expect(response.body.imported[0].date).toBe(today);
    });

    it("POST /:groupId/maps/:mapId/points/import should match category by name", async () => {
        const excelData = [
            {
                description: "Categorized Point",
                latitude: 45.4642,
                longitude: 9.19,
                category: "Test Category",
            },
        ];

        const fileContent = createExcelFile(excelData);

        const response = await request(app)
            .post(`/${groupId}/maps/${mapId}/points/import`)
            .set("Authorization", `Bearer ${accessToken}`)
            .send({
                file: {
                    name: "points.xlsx",
                    content: fileContent,
                },
            })
            .expect(200);

        expect(response.body.successCount).toBe(1);
        expect(response.body.imported[0].categoryId).toBe(categoryId);
    });

    it("POST /:groupId/maps/:mapId/points/import should match category case-insensitively", async () => {
        const excelData = [
            {
                description: "Case Insensitive Category",
                latitude: 45.4642,
                longitude: 9.19,
                category: "test category",
            },
        ];

        const fileContent = createExcelFile(excelData);

        const response = await request(app)
            .post(`/${groupId}/maps/${mapId}/points/import`)
            .set("Authorization", `Bearer ${accessToken}`)
            .send({
                file: {
                    name: "points.xlsx",
                    content: fileContent,
                },
            })
            .expect(200);

        expect(response.body.successCount).toBe(1);
        expect(response.body.imported[0].categoryId).toBe(categoryId);
    });

    it("POST /:groupId/maps/:mapId/points/import should report errors for invalid rows", async () => {
        const excelData = [
            {
                description: "Valid Point",
                latitude: 45.4642,
                longitude: 9.19,
            },
            {
                description: "",
                latitude: 45.4642,
                longitude: 9.19,
            },
            {
                description: "Missing Lat",
                longitude: 9.19,
            },
            {
                description: "Invalid Lat",
                latitude: 999,
                longitude: 9.19,
            },
        ];

        const fileContent = createExcelFile(excelData);

        const response = await request(app)
            .post(`/${groupId}/maps/${mapId}/points/import`)
            .set("Authorization", `Bearer ${accessToken}`)
            .send({
                file: {
                    name: "points.xlsx",
                    content: fileContent,
                },
            })
            .expect(200);

        expect(response.body.totalRows).toBe(4);
        expect(response.body.successCount).toBe(1);
        expect(response.body.errorCount).toBe(3);
        expect(response.body.errors).toHaveLength(3);
        expect(response.body.errors[0].row).toBe(3);
        expect(response.body.errors[0].error).toContain("description");
        expect(response.body.errors[1].row).toBe(4);
        expect(response.body.errors[1].error).toContain("latitude");
        expect(response.body.errors[2].row).toBe(5);
        expect(response.body.errors[2].error).toContain("latitude");
    });

    it("POST /:groupId/maps/:mapId/points/import should handle DD/MM/YYYY date format", async () => {
        const excelData = [
            {
                description: "EU Date Format",
                latitude: 45.4642,
                longitude: 9.19,
                date: "25/12/2025",
            },
        ];

        const fileContent = createExcelFile(excelData);

        const response = await request(app)
            .post(`/${groupId}/maps/${mapId}/points/import`)
            .set("Authorization", `Bearer ${accessToken}`)
            .send({
                file: {
                    name: "points.xlsx",
                    content: fileContent,
                },
            })
            .expect(200);

        expect(response.body.successCount).toBe(1);
        expect(response.body.imported[0].date).toBe("2025-12-25");
    });

    it("POST /:groupId/maps/:mapId/points/import should handle case-insensitive headers", async () => {
        const csvRows = [
            ["DESCRIPTION", "Latitude", "LONGITUDE", "Date"],
            ["Header Test", "45.4642", "9.19", "2025-12-10"],
        ];

        const fileContent = createCsvContent(csvRows);

        const response = await request(app)
            .post(`/${groupId}/maps/${mapId}/points/import`)
            .set("Authorization", `Bearer ${accessToken}`)
            .send({
                file: {
                    name: "points.csv",
                    content: fileContent,
                },
            })
            .expect(200);

        expect(response.body.successCount).toBe(1);
        expect(response.body.imported[0].description).toBe("Header Test");
    });

    it("POST /:groupId/maps/:mapId/points/import should return 403 for unauthorized group", async () => {
        const fakeGroupId = "00000000-0000-0000-0000-000000000000";
        const excelData = [{ description: "Test", latitude: 45, longitude: 9 }];
        const fileContent = createExcelFile(excelData);

        await request(app)
            .post(`/${fakeGroupId}/maps/${mapId}/points/import`)
            .set("Authorization", `Bearer ${accessToken}`)
            .send({
                file: {
                    name: "points.xlsx",
                    content: fileContent,
                },
            })
            .expect(403);
    });

    it("POST /:groupId/maps/:mapId/points/import should return 403 for unauthorized map", async () => {
        const fakeMapId = "00000000-0000-0000-0000-000000000000";
        const excelData = [{ description: "Test", latitude: 45, longitude: 9 }];
        const fileContent = createExcelFile(excelData);

        await request(app)
            .post(`/${groupId}/maps/${fakeMapId}/points/import`)
            .set("Authorization", `Bearer ${accessToken}`)
            .send({
                file: {
                    name: "points.xlsx",
                    content: fileContent,
                },
            })
            .expect(403);
    });

    it("POST /:groupId/maps/:mapId/points/import should return 401 without token", async () => {
        const excelData = [{ description: "Test", latitude: 45, longitude: 9 }];
        const fileContent = createExcelFile(excelData);

        await request(app)
            .post(`/${groupId}/maps/${mapId}/points/import`)
            .send({
                file: {
                    name: "points.xlsx",
                    content: fileContent,
                },
            })
            .expect(401);
    });

    it("POST /:groupId/maps/:mapId/points/import should import with dueDate", async () => {
        const excelData = [
            {
                description: "With Due Date",
                latitude: 45.4642,
                longitude: 9.19,
                date: "2025-12-01",
                dueDate: "2025-12-31",
            },
        ];

        const fileContent = createExcelFile(excelData);

        const response = await request(app)
            .post(`/${groupId}/maps/${mapId}/points/import`)
            .set("Authorization", `Bearer ${accessToken}`)
            .send({
                file: {
                    name: "points.xlsx",
                    content: fileContent,
                },
            })
            .expect(200);

        expect(response.body.successCount).toBe(1);
        expect(response.body.imported[0].dueDate).toBe("2025-12-31");
    });
});
