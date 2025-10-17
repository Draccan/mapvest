import winston from "winston";

import config from "../../main/config";

const railwayFormat = winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json(),
);

const developmentFormat = winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.errors({ stack: true }),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
        const metaStr = Object.keys(meta).length
            ? ` ${JSON.stringify(meta)}`
            : "";
        return `${timestamp} [${level.toUpperCase()}]: ${message}${metaStr}`;
    }),
);

// Warning: for test purposes
const createConsoleLogger = (): any => ({
    log: (message: any) => {
        console.log(message);
    },
    error: (message: any) => {
        console.error(message);
    },
    warn: (message: any) => {
        console.warn(message);
    },
    info: (message: any) => {
        console.info(message);
    },
    debug: (message: any) => {
        console.debug(message);
    },
    verbose: (message: any) => {
        console.log(message);
    },
    silly: (message: any) => {
        console.log(message);
    },
    http: (message: any) => {
        console.log(message);
    },
    child: () => createConsoleLogger(),
});

const loggerService =
    config.nodeEnv === "test"
        ? createConsoleLogger()
        : winston.createLogger({
              level: config.logLevel.toLowerCase(),
              format:
                  config.nodeEnv === "production"
                      ? railwayFormat
                      : developmentFormat,
              defaultMeta: {
                  service: config.appName,
                  version: config.appVersion,
              },
              transports: [
                  new winston.transports.Console({
                      handleExceptions: true,
                      handleRejections: true,
                  }),
              ],
          });

export default loggerService;
