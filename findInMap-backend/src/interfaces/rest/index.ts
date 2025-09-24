import compression from "compression";
import cors from "cors";
import express from "express";
import { middleware as openapiValidator } from "express-openapi-validator";
import { OpenAPIV3 } from "express-openapi-validator/dist/framework/types";
import expressWinston from "express-winston";
import helmet from "helmet";
import * as http from "http";
import * as swaggerUi from "swagger-ui-express";

import LoggerService from "../../core/services/LoggerService";
import CreateMapPoint from "../../core/usecases/CreateMapPoint";
import GetMapPoints from "../../core/usecases/GetMapPoints";
import errorHandler from "./errorHandler";
import Route from "./Route";
import CreateMapPointRoute from "./routes/CreateMapPointRoute";
import GetMapPointsRoute from "./routes/GetMapPointsRoute";
import HealthRoute from "./routes/HealthRoute";
import InfoRoute from "./routes/InfoRoute";

export default class RestInterface {
    private routes: Route[];
    private app = express();

    constructor(
        private publicUrl: string,
        private port: number,
        private serverVersion: string,
        private serverTitle: string,
        private corsAllowedOrigins: string[],
        private validateResponses: boolean,
        usecases: {
            getMapPoints: GetMapPoints;
            createMapPoint: CreateMapPoint;
        },
    ) {
        this.routes = [
            CreateMapPointRoute(usecases.createMapPoint),
            GetMapPointsRoute(usecases.getMapPoints),
            HealthRoute(),
            InfoRoute(),
        ];

        // OpenAPI Spec
        const apiSpec: OpenAPIV3.DocumentV3 = {
            openapi: "3.0.3",
            info: {
                title: this.serverTitle,
                version: this.serverVersion,
                description:
                    "MapVest Backend API for managing crime map points",
            },
            servers: [{ url: this.publicUrl }],
            paths: this.makePaths(),
            components: {
                schemas: {},
            },
        };

        this.app.disable("x-powered-by");
        this.app.set("trust proxy", true);

        // Warning: CORS must be the first app.use to handle preflight requests
        this.app.use(
            cors({
                origin: this.corsAllowedOrigins,
                credentials: false,
                methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
                allowedHeaders: ["Content-Type", "Authorization", "Accept"],
            }),
        );

        // Middlewares
        this.app.use(
            expressWinston.logger({
                winstonInstance: LoggerService,
                meta: true,
                msg: "HTTP {{req.method}} {{req.url}} {{res.statusCode}} {{res.responseTime}}ms",
                expressFormat: false,
                colorize: false,
                ignoreRoute: (req) => req.url === "/health",
            }),
        );
        this.app.use(helmet());
        this.app.use(compression());
        this.app.use(express.json({ limit: "10mb" }));
        this.app.use(express.urlencoded({ limit: "10mb", extended: true }));
        this.app.use(
            openapiValidator({
                apiSpec: apiSpec,
                validateResponses: this.validateResponses,
                ignorePaths: (path: string) => path.startsWith("/swagger"),
            }),
        );

        // Swagger UI
        this.app.use(
            "/swagger",
            swaggerUi.serve,
            swaggerUi.setup(apiSpec, {
                explorer: true,
                customCss: ".swagger-ui .topbar { display: none }",
            }),
        );

        // Register API routes
        this.registerHandlers();

        // 404 handler
        this.app.use((req, res) => {
            res.status(404).json({
                success: false,
                error: `Route ${req.method} ${req.path} not found`,
            });
        });

        // Error handler
        this.app.use(errorHandler);
    }

    async start() {
        const server = http.createServer(this.app);
        await new Promise<void>((resolve) =>
            server.listen(this.port, () => {
                LoggerService.info(`Server listening on port ${this.port}`);
                LoggerService.info(
                    `Swagger documentation: ${this.publicUrl}/swagger`,
                );
                LoggerService.info(`Server info: ${this.publicUrl}/info`);
                LoggerService.info(`Health check: ${this.publicUrl}/health`);
                resolve();
            }),
        );
    }

    private makePaths(): OpenAPIV3.PathsObject {
        const pathsObject: OpenAPIV3.PathsObject = {};

        this.routes.forEach((route) => {
            if (!pathsObject[route.path]) {
                pathsObject[route.path] = {};
            }
            pathsObject[route.path][route.method] = route.operationObject;
        });

        return pathsObject;
    }

    private registerHandlers() {
        this.routes.forEach((route) => {
            this.app[route.method](route.path, route.handler);
        });
    }
}
