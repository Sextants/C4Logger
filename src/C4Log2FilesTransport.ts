import Winston          = require('winston');
import C4LogLevel       = require('./C4LogLevels');
import C4LoggerOptions  = require('./C4LoggerOptions');

import C4LogTransportInstance from './C4LogTransportInstance';

export class C4Log2FilesTransport implements C4LogTransportInstance {
    protected m_transport   : Winston.TransportInstance | null;
    private m_CurDate       : string;
    private m_CurDateCount  : number;

    constructor() {
        this.m_transport    = null;
        this.m_CurDate      = '';
        this.m_CurDateCount = 0;
    }

    async init(LogConig : C4LoggerOptions.FileLoggerOptions) {
        let Self : C4Log2FilesTransport = this;
        this.m_transport    = new Winston.transports.File({
            name    : LogConig.name,
            label   : LogConig.label || LogConig.name,
            filename: LogConig.filename || './logs/default-logs.log',
            level   : LogConig.level || 'info',
            maxsize : LogConig.maxsize  || 102400,
            maxfiles: LogConig.maxfiles || 10,
            rotationFormat : function() : string {
                return getForamtteDate();

                function getForamtteDate() : string {
                    let temp : Date         = new Date();
                    let dateStr : string    = padStr(temp.getFullYear())
                        + '-' + padStr(temp.getMonth() + 1)
                        + '-' + padStr(temp.getDate());;
                        
                    Self.m_CurDateCount++;
                    if (dateStr !== Self.m_CurDate) {
                        Self.m_CurDate      = dateStr;
                        Self.m_CurDateCount = 0;
                    }
                    return (dateStr + '_' + padStr(Self.m_CurDateCount));
                }

                function padStr(i : number) : string {
                    return (i < 10) ? "0" + i : "" + i;
                }
            },
            timestamp : function() : string {
                return (new Date()).toISOString();
            },
            json : false,
            formatter : function(options : any) : string {
                return '[' + options.timestamp() + '] [' + options.level.toUpperCase()
                    + '] ' + options.label + ' - ' + (options.message ? options.message : '')
                    + (options.meta && Object.keys(options.meta).length ? '\n\t'+ JSON.stringify(options.meta) : '' );
            },
            handleExceptions : true,
            humanReadableUnhandledException : true
        });
    }

    changeLevel(Level : C4LogLevel.C4LogLevel) : void {
        if (null !== this.m_transport) {
            this.m_transport.level  = Level;
        }
    }

    close() {}

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
