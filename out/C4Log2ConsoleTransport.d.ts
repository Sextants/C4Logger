import Winston = require('winston');
import C4LoggerOptions = require('./C4LoggerOptions');
import C4LogLevel = require('./C4LogLevels');
import C4LogTransportInstance from './C4LogTransportInstance';
export declare class C4Log2ConsoleTransport implements C4LogTransportInstance {
    private m_transport;
    constructor();
    init(LogConfig: C4LoggerOptions.ConsoleLoggerOptions): Promise<void>;
    changeLevel(Level: C4LogLevel.C4LogLevel): void;
    close(): void;
    getName(): string;
    getTransport(): Winston.TransportInstance | null;
}
