import Winston = require('winston');
import C4LogLevel = require('./C4LogLevels');
import C4LoggerOptions = require('./C4LoggerOptions');
import C4LogTransportInstance from './C4LogTransportInstance';
export declare class C4Log2FilesTransport implements C4LogTransportInstance {
    protected m_transport: Winston.TransportInstance | null;
    private m_CurDate;
    private m_CurDateCount;
    constructor();
    init(LogConig: C4LoggerOptions.FileLoggerOptions): Promise<void>;
    changeLevel(Level: C4LogLevel.C4LogLevel): void;
    close(): void;
    getName(): string;
    getTransport(): Winston.TransportInstance | null;
}
