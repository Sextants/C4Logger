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
class C4Log2ConsoleTransport {
    // private m_CurDate       : string;
    // private m_CurDateCount  : number;
    constructor() {
        this.m_transport = null;
        // this.m_CurDate      = '';
        // this.m_CurDateCount = 0;
    }
    init(LogConfig) {
        return __awaiter(this, void 0, void 0, function* () {
            // let Self = this;
            this.m_transport = new Winston.transports.Console({
                name: LogConfig.name,
                label: LogConfig.label || LogConfig.name,
                level: LogConfig.level || 'info',
                // rotationFormat : function() : string {
                //     return getForamtteDate();
                //     function getForamtteDate() : string {
                //         let temp : Date         = new Date();
                //         let dateStr : string    = padStr(temp.getFullYear())
                //             + '-' + padStr(temp.getMonth() + 1)
                //             + '-' + padStr(temp.getDate());;
                //         Self.m_CurDateCount++;
                //         if (dateStr !== Self.m_CurDate) {
                //             Self.m_CurDate      = dateStr;
                //             Self.m_CurDateCount = 0;
                //         }
                //         return (dateStr + '_' + padStr(Self.m_CurDateCount));
                //     }
                //     function padStr(i : number) : string {
                //         return (i < 10) ? "0" + i : "" + i;
                //     }
                // },
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
exports.C4Log2ConsoleTransport = C4Log2ConsoleTransport;
//# sourceMappingURL=C4Log2ConsoleTransport.js.map