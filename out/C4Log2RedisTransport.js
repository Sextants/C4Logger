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
const IORedis = require("ioredis");
var WinstonRedis = require('winston-redis');
class C4Log2RedisTransport {
    constructor() {
        this.m_transport = null;
        this.m_RClient = null;
    }
    init(LogConfig) {
        return __awaiter(this, void 0, void 0, function* () {
            let CurRedisClient;
            // let Self : C4Log2RedisTransport = this;
            if (!(LogConfig.redis instanceof IORedis)) {
                CurRedisClient = new IORedis(LogConfig.port, LogConfig.host, {
                    family: 4,
                    connectionName: 'C4Log2Redis',
                    db: 0,
                    password: LogConfig.auth,
                    retryStrategy: function (times) {
                        if (times > 5) {
                            return false;
                        }
                        return Math.min(times * 1000, 30000);
                    },
                    reconnectOnError: function (err) {
                        let TargetError = 'READONLY';
                        if (err.message.slice(0, TargetError.length) === TargetError) {
                            return true;
                        }
                        return false;
                    }
                });
                yield new Promise((resolve, reject) => {
                    CurRedisClient.on('ready', () => {
                        resolve();
                    });
                    CurRedisClient.on('error', (err) => {
                        console.log(JSON.stringify(err));
                        reject();
                    });
                });
                this.m_RClient = CurRedisClient;
            }
            else {
                CurRedisClient = LogConfig.redis;
            }
            this.m_transport = new WinstonRedis.Redis({
                name: LogConfig.name,
                label: LogConfig.label || LogConfig.name,
                redis: CurRedisClient,
                container: LogConfig.container,
                length: LogConfig.length,
                channel: LogConfig.channel,
                pattern: LogConfig.pattern,
                level: LogConfig.level || 'info'
            });
        });
    }
    changeLevel(Level) {
        if (null !== this.m_transport) {
            this, this.m_transport.level = Level;
        }
    }
    close() {
        return __awaiter(this, void 0, void 0, function* () {
            if (null === this.m_transport
                || null === this.m_RClient) {
                return;
            }
            this.m_RClient.disconnect();
            let Self = this;
            yield new Promise((resolve) => {
                if (Self.m_RClient !== null) {
                    Self.m_RClient.on('close', () => {
                        Self.m_RClient = null;
                        resolve();
                    });
                }
                else {
                    resolve();
                }
            });
        });
    }
    getName() {
        if (null !== this.m_transport) {
            return this.m_transport.name;
        }
        return '';
    }
    getTransport() {
        return this.m_transport;
    }
}
exports.C4Log2RedisTransport = C4Log2RedisTransport;
//# sourceMappingURL=C4Log2RedisTransport.js.map