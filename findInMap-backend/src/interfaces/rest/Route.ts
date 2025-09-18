import { RequestHandler } from "express";
import { OpenAPIV3 } from "express-openapi-validator/dist/framework/types";

export default interface Route<
    ReqParams = any,
    ReqQuery = any,
    ReqBody = any,
    ResBody = any,
> {
    path: string;
    method:
        | "get"
        | "put"
        | "post"
        | "delete"
        | "options"
        | "head"
        | "patch"
        | "trace";
    operationObject: OpenAPIV3.OperationObject;
    handler: RequestHandler<ReqParams, ResBody, ReqBody, ReqQuery>;
}
