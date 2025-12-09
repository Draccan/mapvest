import { NextFunction, Request, Response } from "express";
import { error as openapiValidatorErrors } from "express-openapi-validator";

import IncorrectPasswordError from "../../core/errors/IncorrectPasswordError";
import InvalidCredentialsError from "../../core/errors/InvalidCredentialsError";
import InvalidPasswordError from "../../core/errors/InvalidPasswordError";
import InvalidResetTokenError from "../../core/errors/InvalidResetTokenError";
import ItemNotFoundError from "../../core/errors/ItemNotFoundError";
import NotAllowedActionError from "../../core/errors/NotAllowedActionError";
import UserEmailAlreadyRegisteredError from "../../core/errors/UserEmailAlreadyRegisteredError";
import UserNotFoundError from "../../core/errors/UserNotFoundError";
import LoggerService from "../../core/services/LoggerService";

export default function errorHandler(
    error: any,
    _req: Request,
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
    } else if (error instanceof InvalidPasswordError) {
        res.status(400).json({
            error: error.message,
        });
    } else if (
        error instanceof InvalidCredentialsError ||
        error instanceof InvalidResetTokenError
    ) {
        res.status(401).json({
            error: error.message,
        });
    } else if (
        error instanceof NotAllowedActionError ||
        error instanceof IncorrectPasswordError
    ) {
        res.status(403).json({
            error: error.message,
        });
    } else if (
        error instanceof UserNotFoundError ||
        error instanceof ItemNotFoundError
    ) {
        res.status(404).json({
            error: error.message,
        });
    } else if (error instanceof UserEmailAlreadyRegisteredError) {
        res.status(409).json({ message: error.message });
    } else if (error instanceof openapiValidatorErrors.UnsupportedMediaType) {
        res.status(415).json({
            error: "Unsupported Media Type",
            message: "Content-Type must be application/json",
            details: error.message,
        });
    } else if (error instanceof UserEmailAlreadyRegisteredError) {
        res.status(409).json({
            error: error.message,
        });
    } else if (error.type && error.type === "entity.too.large") {
        res.status(500).send({ name: "PayloadTooLargeError" });
    } else {
        LoggerService.error(`Unhandled error: ${error.message || error}`);
        res.status(500).json({
            success: false,
            error: "Internal server error",
        });
    }
}
