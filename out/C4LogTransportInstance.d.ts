import C4LoggerOptions = require('./C4LoggerOptions');
import C4LogLevel = require('./C4LogLevels');
import Winston = require('winston');
export default interface C4LogTransportInstance {
    init(LogConfig: C4LoggerOptions.C4LoggerOptions): void;
    changeLevel(Level: C4LogLevel.C4LogLevel): void;
    close(): void;
    getName(): string;
    getTransport(): Winston.TransportInstance | null;
}
