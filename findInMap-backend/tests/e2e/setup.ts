import { cleanupTestApp, createTestApp } from "../helpers";

let server: any;
let app: any;

export const setupTestServer = () => {
    beforeAll(async () => {
        const restInterface = createTestApp();
        app = restInterface["app"];
        server = app.listen(0);
    });

    afterAll((done) => {
        cleanupTestApp();
        if (server) {
            server.close(() => {
                done();
            });
        } else {
            done();
        }
    });
};

export const getTestApp = () => {
    return app;
};

setupTestServer();
