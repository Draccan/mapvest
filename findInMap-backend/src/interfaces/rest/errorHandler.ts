import { NextFunction, Request, Response } from "express";
import { error as openapiValidatorErrors } from "express-openapi-validator";

import { RateLimitError } from "../../core/errors/RateLimitError";
import LoggerService from "../../core/services/LoggerService";

export default function errorHandler(
    error: any,
    req: Request,
    res: Response,
    _next: NextFunction,
) {
    if (error instanceof openapiValidatorErrors.BadRequest) {
        res.status(400).send({
            name: "InvalidRequestError",
            details: {
                message: error.message,
                errors: error.errors,
            },
        });
    } else if (error instanceof RateLimitError) {
        res.status(429).json({
            error: error.message,
            remainingTime: error.remainingTime,
        });
    } else if (error.type && error.type === "entity.too.large") {
        res.status(500).send({ name: "PayloadTooLargeError" });
    } else {
        LoggerService.error("Unhandled error:", error);
        res.status(500).json({
            success: false,
            error: "Internal server error",
        });
    }
}
