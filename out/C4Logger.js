"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const Winston = require("winston");
const C4LogLevel = require("./C4LogLevels");
const C4Log2ConsoleTransport_1 = require("./C4Log2ConsoleTransport");
const C4Log2FilesTransport_1 = require("./C4Log2FilesTransport");
const C4Log2RedisTransport_1 = require("./C4Log2RedisTransport");
class C4Logger {
    constructor() {
        this.m_Logger = null;
        this.m_Transports = {};
    }
    /**
     * 初始化Logger
     * @param LogConfig Logger配置
     */
    init(LogConfig) {
        return __awaiter(this, void 0, void 0, function* () {
            this.m_Logger = new Winston.Logger({
                name: 'C4Logger',
                levels: C4LogLevel.C4LogLevels.levels,
                transports: [],
                exitOnError: function (err) {
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
        });
    }
    /**
     * 添加Logger配置
     * @param LogConfig logger配置
     */
    addTransport(LogConfig) {
        return __awaiter(this, void 0, void 0, function* () {
            if (null === this.m_Logger) {
                return;
            }
            if ((LogConfig.logtype && LogConfig.logtype === 'console')
                || LogConfig.name === 'default-console-logger') {
                let CurConsoleConfig = LogConfig;
                let CurTransport = new C4Log2ConsoleTransport_1.C4Log2ConsoleTransport();
                yield CurTransport.init(CurConsoleConfig);
                this.m_Logger.add(CurTransport.getTransport(), {}, true);
                this.m_Transports[LogConfig.name] = CurTransport;
            }
            else if (LogConfig.logtype === 'files'
                || LogConfig.name === 'default-files-logger') {
                let CurFilesConfig = LogConfig;
                let CurTransport = new C4Log2FilesTransport_1.C4Log2FilesTransport();
                yield CurTransport.init(CurFilesConfig);
                this.m_Logger.add(CurTransport.getTransport(), {}, true);
                this.m_Transports[LogConfig.name] = CurTransport;
            }
            else if (LogConfig.logtype === 'redis'
                || LogConfig.name === 'default-redis-logger') {
                let CurRedisConfig = LogConfig;
                let CurTransport = new C4Log2RedisTransport_1.C4Log2RedisTransport();
                yield CurTransport.init(CurRedisConfig);
                this.m_Logger.add(CurTransport.getTransport(), {}, true);
                this.m_Transports[LogConfig.name] = CurTransport;
            }
        });
    }
    /**
     * 移除Logger配置
     * @param LoggerName logger名
     */
    removeTransport(LoggerName) {
        return __awaiter(this, void 0, void 0, function* () {
            if (null === this.m_Logger) {
                return;
            }
            this.m_Logger.remove(LoggerName);
            if (this.m_Transports[LoggerName]) {
                delete this.m_Transports[LoggerName];
            }
        });
    }
    changeLevel(Level, LoggerName) {
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
        }
        else {
            if (null !== this.m_Logger) {
                let CurTrans = this.m_Logger.transports[LoggerName];
                CurTrans.level = Level;
            }
        }
    }
    /**
     * 关闭Logger
     * @param LoggerName logger名
     */
    close(LoggerName) {
        return __awaiter(this, void 0, void 0, function* () {
            if (null !== this.m_Logger) {
                if (LoggerName !== null
                    || LoggerName !== undefined
                    || (typeof LoggerName !== 'string')
                    || LoggerName === '') {
                    for (let key in this.m_Transports) {
                        if (this.m_Transports[key]) {
                            this.m_Logger.remove(this.m_Transports[key].getTransport());
                            yield this.m_Transports[key].close();
                            delete this.m_Transports[key];
                        }
                    }
                }
                else {
                    let CurTransport = this.m_Transports[LoggerName];
                    if (CurTransport) {
                        this.m_Logger.remove(CurTransport.getTransport());
                        yield CurTransport.close();
                        delete this.m_Transports[LoggerName];
                    }
                }
            }
        });
    }
    fatal(msg, ...meta) {
        if (this.m_Logger) {
            if (msg && (typeof msg) !== "string" && msg.message && msg.stack) {
                msg = Object.assign({
                    message: msg.message,
                    stack: msg.stack
                }, msg);
                msg = JSON.stringify(msg, null, 4).split('\\n').join('"\n    "');
            }
            this.m_Logger.log('fatal', msg, ...meta);
        }
        return this;
    }
    err(msg, ...meta) {
        if (this.m_Logger) {
            if (msg && (typeof msg) !== "string" && msg.message && msg.stack) {
                msg = Object.assign({
                    message: msg.message,
                    stack: msg.stack
                }, msg);
                msg = JSON.stringify(msg, null, 4).split('\\n').join('"\n    "');
            }
            this.m_Logger.log('err', msg.toString(), ...meta);
        }
        return this;
    }
    warn(msg, ...meta) {
        if (this.m_Logger) {
            if (msg && (typeof msg) !== "string" && msg.message && msg.stack) {
                msg = Object.assign({
                    message: msg.message,
                    stack: msg.stack
                }, msg);
                msg = JSON.stringify(msg, null, 4).split('\\n').join('"\n    "');
            }
            this.m_Logger.log('warn', msg, ...meta);
        }
        return this;
    }
    info(msg, ...meta) {
        if (this.m_Logger) {
            if (msg && (typeof msg) !== "string" && msg.message && msg.stack) {
                msg = Object.assign({
                    message: msg.message,
                    stack: msg.stack
                }, msg);
                msg = JSON.stringify(msg, null, 4).split('\\n').join('"\n    "');
            }
            this.m_Logger.log('info', msg, ...meta);
        }
        return this;
    }
    debug(msg, ...meta) {
        if (this.m_Logger) {
            if (msg && (typeof msg) !== "string" && msg.message && msg.stack) {
                msg = Object.assign({
                    message: msg.message,
                    stack: msg.stack
                }, msg);
                msg = JSON.stringify(msg, null, 4).split('\\n').join('"\n    "');
            }
            this.m_Logger.log('debug', msg, ...meta);
        }
        return this;
    }
    trace(msg, ...meta) {
        if (this.m_Logger) {
            if (msg && (typeof msg) !== "string" && msg.message && msg.stack) {
                msg = Object.assign({
                    message: msg.message,
                    stack: msg.stack
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
    profile(id, ...meta) {
        if (this.m_Logger) {
            this.m_Logger.profile(id, ...meta);
        }
        return this;
    }
}
exports.C4Logger = C4Logger;
//# sourceMappingURL=C4Logger.js.map