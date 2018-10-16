var C4Logger    = require('./C4LoggerNew');
var Yaml        = require('js-yaml');
var FS          = require('fs');

async function Launch() {
    let doc = null;
    try {
        doc = Yaml.safeLoad(FS.readFileSync('./config/C4Logger.yml', 'utf8'));
    } catch (error) {
        console.log(error);
        process.exit(-1);
    }

    let CurLogger   = new C4Logger.C4Logger();
    await CurLogger.init(doc);

    let TempConfig = {
        name: 'custom-logger-02',
        type: 'redis',
        level: 'info',
        label: 'custom-02',
        host: /*'10.0.0.95'*/ '192.168.189.113',
        port: 6379,
        length: 300,
        container: 'test-custom-log'
    };

    await CurLogger.addTransport(TempConfig);
    CurLogger.debug('test a', { type: 'test' });
    CurLogger.info('test a -> %s', '123', { type: 'test' }, () => {
        return 'custom-logger-00';
    });
    CurLogger.info('test a -> %s', '123', { type: 'test' });
    await CurLogger.removeTransport('custom-logger-01');
    CurLogger.info('test b -> %j', { type: 'test' }, { type: 'test' });
    CurLogger.profile('testProfile');
    await new Promise((resolve, reject) => {
        setTimeout(() => {
            CurLogger.profile('testProfile', { type : 'test'});
            resolve();
        }, 4000);
    });

    await CurLogger.close();
}

Launch();

