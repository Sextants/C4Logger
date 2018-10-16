export const C4LogLevels = {
    levels : {
        fatal   : 0,
        err     : 1,
        warn    : 2,
        info    : 3,
        debug   : 4,
        trace   : 5
    },
    colors : {
        fatal   : 'red',
        err     : 'red',
        warn    : 'yellow',
        info    : 'green',
        debug   : 'blue',
        trace   : 'magenta'
    }
};

export type C4LogLevel = string | 'fatal' | 'err' | 'warn' | 'info' | 'debug' | 'trace';
