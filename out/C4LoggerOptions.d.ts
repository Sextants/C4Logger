/// <reference types="node" />
import Redis = require('ioredis');
export interface GenericOptions {
    logtype?: 'files' | 'redis' | 'console';
    level: string | 'fatal' | 'err' | 'warn' | 'info' | 'debug' | 'trace';
    silent?: boolean;
    raw?: boolean;
    name: string;
    handleExceptions?: boolean;
    exceptionsLevel?: string;
    humanReadableUnhandledException?: boolean;
}
export interface GenericTextOptions {
    json?: boolean;
    colorize?: boolean;
    colors?: any;
    prettyPrint?: boolean;
    showLevel?: boolean;
    label: string;
    depth?: number;
    timestamp?: boolean | (() => string | boolean);
    stringify?(obj: any): string;
}
export interface ConsoleLoggerOptions extends GenericOptions, GenericTextOptions {
    logstash?: boolean;
    debugStdout?: boolean;
}
export interface FileLoggerOptions extends GenericOptions, GenericTextOptions {
    logstash?: boolean;
    maxsize: number;
    rotationFormat?: boolean;
    zippedArchive?: boolean;
    maxfiles: number;
    eol?: string;
    tailable?: boolean;
    maxRetries?: number;
    filename: string;
    dirname?: string;
    options?: {
        flags: string;
        highWaterMark: number;
    };
    stream?: NodeJS.WritableStream | null;
}
export interface RedisLoggerOptions extends GenericOptions, GenericTextOptions {
    host: string | 'localhost';
    port: number | 6379;
    auth?: string;
    redis?: Redis.Redis;
    length?: number | 200;
    container: string;
    channel?: string;
    pattern?: string;
    logstash?: boolean | false;
}
export declare type C4LoggerOptions = FileLoggerOptions | ConsoleLoggerOptions | RedisLoggerOptions | GenericOptions;
export interface C4LoggerConfig {
    defaultLoggers?: C4LoggerOptions[];
    customLoggers?: C4LoggerOptions[];
}
