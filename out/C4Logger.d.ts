import C4LoggerOptions = require('./C4LoggerOptions');
import C4LogLevel = require('./C4LogLevels');
export declare class C4Logger {
    private m_Logger;
    private m_Transports;
    constructor();
    /**
     * 初始化Logger
     * @param LogConfig Logger配置
     */
    init(LogConfig: C4LoggerOptions.C4LoggerConfig): Promise<void>;
    /**
     * 添加Logger配置
     * @param LogConfig logger配置
     */
    addTransport(LogConfig: C4LoggerOptions.C4LoggerOptions): Promise<void>;
    /**
     * 移除Logger配置
     * @param LoggerName logger名
     */
    removeTransport(LoggerName: string): Promise<void>;
    /**
     * 改变日志级别
     * @param Level 级别
     * @param LoggerName logger名
     */
    changeLevel(Level: C4LogLevel.C4LogLevel): void;
    /**
     * 关闭Logger
     * @param LoggerName logger名
     */
    close(LoggerName?: string): Promise<void>;
    fatal(msg: any, ...meta: any[]): C4Logger;
    err(msg: any, ...meta: any[]): C4Logger;
    warn(msg: any, ...meta: any[]): C4Logger;
    info(msg: any, ...meta: any[]): C4Logger;
    debug(msg: any, ...meta: any[]): C4Logger;
    trace(msg: any, ...meta: any[]): C4Logger;
    /**
     * 进行性能统计
     * @param id 标识
     * @param meta meta信息
     */
    profile(id: string, ...meta: any[]): C4Logger;
}
