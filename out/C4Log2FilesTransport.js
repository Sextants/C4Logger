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
class C4Log2FilesTransport {
    constructor() {
        this.m_transport = null;
        this.m_CurDate = '';
        this.m_CurDateCount = 0;
    }
    init(LogConig) {
        return __awaiter(this, void 0, void 0, function* () {
            let Self = this;
            this.m_transport = new Winston.transports.File({
                name: LogConig.name,
                label: LogConig.label || LogConig.name,
                filename: LogConig.filename || './logs/default-logs.log',
                level: LogConig.level || 'info',
                maxsize: LogConig.maxsize || 102400,
                maxfiles: LogConig.maxfiles || 10,
                rotationFormat: function () {
                    return getForamtteDate();
                    function getForamtteDate() {
                        let temp = new Date();
                        let dateStr = padStr(temp.getFullYear())
                            + '-' + padStr(temp.getMonth() + 1)
                            + '-' + padStr(temp.getDate());
                        ;
                        Self.m_CurDateCount++;
                        if (dateStr !== Self.m_CurDate) {
                            Self.m_CurDate = dateStr;
                            Self.m_CurDateCount = 0;
                        }
                        return (dateStr + '_' + padStr(Self.m_CurDateCount));
                    }
                    function padStr(i) {
                        return (i < 10) ? "0" + i : "" + i;
                    }
                },
                timestamp: function () {
                    return (new Date()).toISOString();
                },
                json: false,
                formatter: function (options) {
                    return '[' + options.timestamp() + '] [' + options.level.toUpperCase()
                        + '] ' + options.label + ' - ' + (options.message ? options.message : '')
                        + (options.meta && Object.keys(options.meta).length ? '\n\t' + JSON.stringify(options.meta) : '');
                },
                handleExceptions: true,
                humanReadableUnhandledException: true
            });
        });
    }
    changeLevel(Level) {
        if (null !== this.m_transport) {
            this.m_transport.level = Level;
        }
    }
    close() { }
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
exports.C4Log2FilesTransport = C4Log2FilesTransport;
//# sourceMappingURL=C4Log2FilesTransport.js.map