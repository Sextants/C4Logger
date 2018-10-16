import Winston = require('winston');
import C4LogLevel = require('./C4LogLevels');
import C4LoggerOptions = require('./C4LoggerOptions');
import C4LogTransportInstance from './C4LogTransportInstance';
export declare class C4Log2RedisTransport implements C4LogTransportInstance {
    private m_transport;
    private m_RClient;
    constructor();
    init(LogConfig: C4LoggerOptions.RedisLoggerOptions): Promise<void>;
    changeLevel(Level: C4LogLevel.C4LogLevel): void;
    close(): Promise<void>;
    getName(): string;
    getTransport(): Winston.TransportInstance | null;
}
