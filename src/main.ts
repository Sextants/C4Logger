import C4Logger  = require('./C4Logger');
import Yaml         = require('js-yaml');
import FS           = require('fs');
// import C4LoggerOptions  = require('./C4LoggerOptions');

// import C4LoggerOptions  = require('./C4LoggerOptions');

// let CurLogger = new C4Log2Files.C4Log2Files();

// let Config = {
//     maxsize     : 1024,
//     maxFiles    : 3,
//     filename : './test-log.log',
//     level : 'info',
//     name : 'test-log',
//     label : 'test-log',
// }

// CurLogger.init(Config, 'info');
// CurLogger.fatal('123', { a : 123});
// CurLogger.profile('TestProfile');
// setTimeout(() => {
//     CurLogger.profile('TestProfile');
// }, 30000)

async function Launch() {
    let doc = null;
    try {
        doc = Yaml.safeLoad(FS.readFileSync('./Config/C4Logger.yml', 'utf8'));
        console.log(JSON.stringify(doc));
    } catch (error) {
        console.log(error);
        process.exit(-1);
    }

    let CurLogger = new C4Logger.C4Logger();
    console.log('begin init....')
    await CurLogger.init(doc).catch((err) => {
        console.log(err);
        process.exit(-1);
    });
    console.log('init');

    // let TempConfig : C4LoggerOptions.RedisLoggerOptions = {
    //     name : 'custom-logger-02',
    //     logtype : 'redis',
    //     level : 'info',
    //     label : 'custom-02',
    //     host : '0.0.0.0',
    //     port : 6379,
    //     length : 300,
    //     container : 'test-custom-log'
    // }
    // await CurLogger.addTransport(TempConfig).catch((err) => {
    //     console.log(err);
    //     process.exit(-1)
    // });

    CurLogger.info('123456');
    CurLogger.debug('test a', { type : 'test'});
    CurLogger.info('test a -> %s', '123', { type : 'test'}, () => {
        return 'custom-logger-00';
    });
    CurLogger.info('test a -> %s', '123', { type : 'test'});
    await CurLogger.removeTransport('custom-logger-01');
    CurLogger.info('test b -> %j', { type : 'test'}, { type : 'test'})
    CurLogger.profile('testProfile');
    await new Promise((resolve) => {
        setTimeout(() => {
            console.log('123')
            CurLogger.profile('testProfile', {type : 'test'});
            resolve();
        }, 4000);
    });

    // await CurLogger.close();
}

Launch().catch((err) => {
    console.log(err);
});
