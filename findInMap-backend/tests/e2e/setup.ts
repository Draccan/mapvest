import { createTestApp } from "./helpers";

let server: any;
let app: any;

export const setupTestServer = () => {
    beforeAll(async () => {
        const restInterface = createTestApp();
        app = restInterface["app"];
        server = app.listen(0);
    });

    afterAll(async () => {
        if (server) {
            server.close();
        }
    });
};

export const getTestApp = () => {
    return app;
};

setupTestServer();
