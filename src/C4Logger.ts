import Winston          = require('winston');
import C4LoggerOptions  = require('./C4LoggerOptions');
import C4LogLevel       = require('./C4LogLevels');

import { C4Log2ConsoleTransport}    from "./C4Log2ConsoleTransport";
import { C4Log2FilesTransport }     from "./C4Log2FilesTransport";
import { C4Log2RedisTransport }     from "./C4Log2RedisTransport";

import C4LogTransportInstance from './C4LogTransportInstance';

export class C4Logger {
    private m_Logger        : Winston.LoggerInstance | null;
    private m_Transports    : { [key:string] : C4LogTransportInstance}

    constructor() {
        this.m_Logger       = null;
        this.m_Transports   = {};
    }

    /**
     * 初始化Logger
     * @param LogConfig Logger配置
     */
    async init(LogConfig : C4LoggerOptions.C4LoggerConfig) {
        this.m_Logger   = new Winston.Logger({
            name : 'C4Logger',
            levels  : C4LogLevel.C4LogLevels.levels,
            transports : [],
            exitOnError : function(err) {
                console.log(err);
                return false;
            }
        });
        Winston.addColors(C4LogLevel.C4LogLevels.colors);
        if (LogConfig.defaultLoggers !== null
            && LogConfig.defaultLoggers !== undefined
            && Object.prototype.toString.call(LogConfig.defaultLoggers) === '[object Array]'
            && LogConfig.defaultLoggers.length > 0) {
            for (let i = 0; i < LogConfig.defaultLoggers.length; i++) {
                this.addTransport(LogConfig.defaultLoggers[i]);
            }
        }

        if (LogConfig.customLoggers !== null
            && LogConfig.customLoggers !== undefined
            && Object.prototype.toString.call(LogConfig.customLoggers) === '[object Array]'
            && LogConfig.customLoggers.length > 0) {
            for (let i = 0; i < LogConfig.customLoggers.length; i++) {
                this.addTransport(LogConfig.customLoggers[i]);
            }
        }
    }

    /**
     * 添加Logger配置
     * @param LogConfig logger配置
     */
    async addTransport(LogConfig : C4LoggerOptions.C4LoggerOptions) {
        if (null === this.m_Logger) {
            return;
        }
        if ((LogConfig.logtype && LogConfig.logtype === 'console')
            || LogConfig.name === 'default-console-logger'
        ) {
            let CurConsoleConfig : C4LoggerOptions.ConsoleLoggerOptions = 
                <C4LoggerOptions.ConsoleLoggerOptions> LogConfig;
            let CurTransport = new C4Log2ConsoleTransport();
            await CurTransport.init(CurConsoleConfig);

            this.m_Logger.add(<Winston.TransportInstance>CurTransport.getTransport(), {}, true);
            this.m_Transports[LogConfig.name] = CurTransport;
        } else if (LogConfig.logtype === 'files'
            || LogConfig.name === 'default-files-logger'
        ) {
            let CurFilesConfig : C4LoggerOptions.FileLoggerOptions = 
                <C4LoggerOptions.FileLoggerOptions> LogConfig;
            let CurTransport   = new C4Log2FilesTransport();
            await CurTransport.init(CurFilesConfig);

            this.m_Logger.add(<Winston.TransportInstance>CurTransport.getTransport(), {}, true);
            this.m_Transports[LogConfig.name] = CurTransport;
        } else if (LogConfig.logtype === 'redis'
            || LogConfig.name === 'default-redis-logger'
        ) {
            let CurRedisConfig : C4LoggerOptions.RedisLoggerOptions = 
                <C4LoggerOptions.RedisLoggerOptions> LogConfig;
            let CurTransport   = new C4Log2RedisTransport();
            await CurTransport.init(CurRedisConfig);

            this.m_Logger.add(<Winston.TransportInstance>CurTransport.getTransport(), {}, true);
            this.m_Transports[LogConfig.name] = CurTransport;
        }
    }

    /**
     * 移除Logger配置
     * @param LoggerName logger名
     */
    async removeTransport(LoggerName : string) {
        if (null === this.m_Logger) {
            return;
        }

        this.m_Logger.remove(LoggerName);
        if (this.m_Transports[LoggerName]) {
            delete this.m_Transports[LoggerName];
        }
    }

    /**
     * 改变日志级别
     * @param Level 级别
     * @param LoggerName logger名
     */
    changeLevel(Level : C4LogLevel.C4LogLevel) : void;
    changeLevel(Level : C4LogLevel.C4LogLevel, LoggerName?: string) : void {
        if (LoggerName !== null
            || LoggerName !== undefined
            || (typeof LoggerName !== 'string')
            || LoggerName === '') {
            if (null !== this.m_Logger) {
                this.m_Logger.level = Level;
                for (let key in this.m_Logger.transports) {
                    this.m_Logger.transports[key].level = Level;
                }
            }
        } else {
            
            if (null !== this.m_Logger) {
                let CurTrans = this.m_Logger.transports[LoggerName];
                CurTrans.level  = Level;
            }
        }
    }

    /**
     * 关闭Logger
     * @param LoggerName logger名
     */
    async close(LoggerName ?: string) {
        if (null !== this.m_Logger) {
            if (LoggerName !== null
            || LoggerName !== undefined
            || (typeof LoggerName !== 'string')
            || LoggerName === '') {
                for (let key in this.m_Transports) {
                    if (this.m_Transports[key]) {
                        this.m_Logger.remove(<Winston.TransportInstance>this.m_Transports[key].getTransport());
                        await this.m_Transports[key].close();
                        delete this.m_Transports[key];
                    }
                }
            } else {
                let CurTransport    = this.m_Transports[LoggerName];
                if (CurTransport) {
                    this.m_Logger.remove(<Winston.TransportInstance>CurTransport.getTransport());
                    await CurTransport.close();
                    delete this.m_Transports[LoggerName];
                }
            }
        }
    }

    fatal(msg : any, ...meta : any[]) : C4Logger {
        if (this.m_Logger) {
            if (msg && (typeof msg) !== "string" && msg.message && msg.stack) {
                msg = Object.assign({
                    message : msg.message,
                    stack : msg.stack
                }, msg);
                msg = JSON.stringify(msg, null, 4).split('\\n').join('"\n    "');
            }
            this.m_Logger.log('fatal', msg, ...meta);
        }

        return this;
    }

    err(msg : any, ...meta : any[]) : C4Logger {
        if (this.m_Logger) {
            if (msg && (typeof msg) !== "string" && msg.message && msg.stack) {
                msg = Object.assign({
                    message : msg.message,
                    stack : msg.stack
                }, msg);
                msg = JSON.stringify(msg, null, 4).split('\\n').join('"\n    "');
            }
            this.m_Logger.log('err', msg.toString(), ...meta);
        }

        return this;
    }

    warn(msg : any, ...meta : any[]) : C4Logger {
        if (this.m_Logger) {
            if (msg && (typeof msg) !== "string" && msg.message && msg.stack) {
                msg = Object.assign({
                    message : msg.message,
                    stack : msg.stack
                }, msg);
                msg = JSON.stringify(msg, null, 4).split('\\n').join('"\n    "');
            }
            this.m_Logger.log('warn', msg, ...meta);
        }

        return this;
    }

    info(msg : any, ...meta : any[]) : C4Logger {
        if (this.m_Logger) {
            if (msg && (typeof msg) !== "string" && msg.message && msg.stack) {
                msg = Object.assign({
                    message : msg.message,
                    stack : msg.stack
                }, msg);
                msg = JSON.stringify(msg, null, 4).split('\\n').join('"\n    "');
            }
            this.m_Logger.log('info', msg, ...meta);
        }

        return this;
    }

    debug(msg : any, ...meta : any[]) : C4Logger {
        if (this.m_Logger) {
            if (msg && (typeof msg) !== "string" && msg.message && msg.stack) {
                msg = Object.assign({
                    message : msg.message,
                    stack : msg.stack
                }, msg);
                msg = JSON.stringify(msg, null, 4).split('\\n').join('"\n    "');
            }
            this.m_Logger.log('debug', msg, ...meta);
        }

        return this;
    }

    trace(msg : any, ...meta : any[]) : C4Logger {
        if (this.m_Logger) {
            if (msg && (typeof msg) !== "string" && msg.message && msg.stack) {
                msg = Object.assign({
                    message : msg.message,
                    stack : msg.stack
                }, msg);
                msg = JSON.stringify(msg, null, 4).split('\\n').join('"\n    "');
            }
            this.m_Logger.log('trace', msg, ...meta);
        }

        return this;
    }

    /**
     * 进行性能统计
     * @param id 标识
     * @param meta meta信息
     */
    profile(id : string, ...meta : any[]) : C4Logger {
        if (this.m_Logger) {
            this.m_Logger.profile(id, ...meta);
        }

        return this;
    }
}

