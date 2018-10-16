import Winston          = require('winston');
import IORedis          = require('ioredis');
import C4LogLevel       = require('./C4LogLevels');
import C4LoggerOptions  = require('./C4LoggerOptions');

import C4LogTransportInstance from './C4LogTransportInstance';

var WinstonRedis        = require('winston-redis');

export class C4Log2RedisTransport implements C4LogTransportInstance {
    private m_transport : Winston.TransportInstance | null;
    private m_RClient   : IORedis.Redis | null;

    constructor() {
        this.m_transport    = null;
        this.m_RClient      = null;
    }

    async init(LogConfig : C4LoggerOptions.RedisLoggerOptions) {
        let CurRedisClient  : IORedis.Redis;
        // let Self : C4Log2RedisTransport = this;
        if (!(LogConfig.redis instanceof IORedis)) {
            CurRedisClient  = new IORedis(
                LogConfig.port,
                LogConfig.host,
                {
                    family          : 4,
                    connectionName  : 'C4Log2Redis',
                    db              : 0,
                    password        : LogConfig.auth,
                    retryStrategy   : function(times : number) : number | false {
                        if (times > 5) {
                            return false;
                        }

                        return Math.min(times * 1000, 30000);
                    },
                    reconnectOnError : function(err : Error) : boolean {
                        let TargetError = 'READONLY';
                        if (err.message.slice(0, TargetError.length) === TargetError) {
                            return true;
                        }
                        return false;
                    }
                }
            );
            await new Promise((resolve, reject) => {
                CurRedisClient.on('ready', () => {
                    resolve();
                });

                CurRedisClient.on('error', (err) => {
                    console.log(JSON.stringify(err));
                    reject();
                });
            });

            this.m_RClient  = CurRedisClient;
        } else {
            CurRedisClient  = LogConfig.redis;
        }

        this.m_transport    = new WinstonRedis.Redis({
            name        : LogConfig.name,
            label       : LogConfig.label || LogConfig.name,
            redis       : CurRedisClient,
            container   : LogConfig.container,
            length      : LogConfig.length,
            channel     : LogConfig.channel,
            pattern     : LogConfig.pattern,
            level       : LogConfig.level || 'info'
        });
    }

    changeLevel(Level : C4LogLevel.C4LogLevel) : void {
        if (null !== this.m_transport) {
            this,this.m_transport.level = Level;
        }
    }

    async close() {
        if (null === this.m_transport
            || null === this.m_RClient) {
            return;
        }

        this.m_RClient.disconnect();
        let Self = this;
        await new Promise((resolve) => {
            if (Self.m_RClient !== null) {
                Self.m_RClient.on('close', () => {
                    Self.m_RClient = null;
                    resolve();
                });
            } else {
                resolve();
            }
        });
    }

    getName() : string {
        if (null !== this.m_transport) {
            return this.m_transport.name;
        }

        return '';
    }

    getTransport() {
        return this.m_transport;
    }
}
