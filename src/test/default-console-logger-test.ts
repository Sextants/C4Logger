import C4Logger     = require('../C4Logger');
import Should       = require('should');
import Intercept    = require('intercept-stdout');
import Yaml         = require('js-yaml');
import Path         = require('path');
import FS           = require('fs');
import FSEx         = require('fs-extra');
import Redis        = require('ioredis');
import 'mocha'

async function Connect2Redis(host: string, port: number, auth: string | null) {
    let CurClient = new Redis(
        port,
        host,
        {
            family          : 4,
            connectionName  : 'C4LoggerTest',
            password        : auth
        }
    )

    await new Promise((resolve, reject) => {
        CurClient.on('ready', () => {
            resolve();
        });

        CurClient.on('error', (err) => {
            reject(err);
        });
    }).catch((err) => {
        console.log(err);
        CurClient = null;
    });
    return CurClient;
}

describe('默认类型Logger测试', () => {
    process.setMaxListeners(0);
    it('fatal level', (done) => {
        (async () => {
            let CapturedText : string = "";
            let doc = null;
            try {
                doc = Yaml.safeLoad(FS.readFileSync('./src/test/config/DefaultLoggerTestConfig-fatal.yml', 'utf8'));
            } catch (error) {
                Should.throws(error);
            }
            // 清理上次的输出结果
            let LogFileAbPath = Path.join(process.cwd(), doc.defaultLoggers[1].filename)
            try {
                let LastState = FS.statSync(LogFileAbPath);
                if (LastState.isFile()) {
                    FS.unlinkSync(LogFileAbPath);
                } else {
                    FSEx.removeSync(LogFileAbPath);
                }
            } catch (error) {
                // console.log(error)
            }

            // 读取redis，验证写入内容
            let CurClient = await Connect2Redis(
                doc.defaultLoggers[2].host,
                doc.defaultLoggers[2].port,
                doc.defaultLoggers[2].auth
            );

            Should.notEqual(CurClient, null);
            CurClient.del(doc.defaultLoggers[2].container);

            let CurLogger = new C4Logger.C4Logger();
            await CurLogger.init(doc);

            // 开始捕获标准输出
            let UnhookIntercept = Intercept((text) => {
                CapturedText += text;
            }, (err) => {
                CapturedText += err;
            });

            CurLogger.fatal('test fatal.');
            UnhookIntercept();
            // 验证Console类型Logger
            CapturedText.should.match(/\[\d+-\d+-\d+T\d+:\d+:\d+\.\d+Z\]\s+\[FATAL\]\s+default-console-logger\s+-\s+test fatal./);

            // 验证Files类型Logger
            // 等一下，有可能文件还没有写入
            await new Promise((resolve, reject) => {
                setTimeout(() => {
                    let CurState = null;
                    let FileContent = null;
                    try {
                        // 日志文件是否存在
                        CurState = FS.statSync(LogFileAbPath);
                        let isFile = CurState.isFile();
                        isFile.should.be.ok();

                        // 读取日志文件内容
                        FileContent = FS.readFileSync(LogFileAbPath, { encoding : 'utf8'});
                        // 判断内容
                        FileContent.should.match(/\[\d+-\d+-\d+T\d+:\d+:\d+\.\d+Z\]\s+\[FATAL\]\s+default-files-logger\s+-\s+test fatal./);
                    } catch (error) {
                        console.log(error);
                        CurState    = null;
                        FileContent = null;
                    }
                    Should.notEqual(CurState, null);
                    Should.notEqual(FileContent, null);

                    resolve();
                }, 1000);
            });

            let CurMsg = await CurClient.rpop(doc.defaultLoggers[2].container);
            CurClient.disconnect();
            await new Promise((resolve, reject) => {
                CurClient.on('close', () => {
                    resolve();
                });
            });

            Should.notEqual(CurMsg, null);
            let CurMsgObj = JSON.parse(CurMsg);
            CurMsgObj.message.should.equal('test fatal.');

            await CurLogger.close();
            done();
        })();
    });

    it('err level', (done) => {
        (async () => {
            let CapturedText : string = "";
            let doc = null;
            try {
                doc = Yaml.safeLoad(FS.readFileSync('./src/test/config/DefaultLoggerTestConfig-err.yml', 'utf8'));
            } catch (error) {
                Should.throws(error);
            }
            // 清理上次的输出结果
            let LogFileAbPath = Path.join(process.cwd(), doc.defaultLoggers[1].filename)
            try {
                let LastState = FS.statSync(LogFileAbPath);
                if (LastState.isFile()) {
                    FS.unlinkSync(LogFileAbPath);
                } else {
                    FSEx.removeSync(LogFileAbPath);
                }
            } catch (error) {
                // console.log(error)
            }
            
            // 读取redis，验证写入内容
            let CurClient = await Connect2Redis(
                doc.defaultLoggers[2].host,
                doc.defaultLoggers[2].port,
                doc.defaultLoggers[2].auth
            );

            Should.notEqual(CurClient, null);
            CurClient.del(doc.defaultLoggers[2].container);

            let CurLogger = new C4Logger.C4Logger();
            await CurLogger.init(doc);

            // 开始捕获标准输出
            let UnhookIntercept = Intercept((text) => {
                CapturedText += text;
            }, (err) => {});

            CurLogger.err('test err.');
            UnhookIntercept();
            // 验证Console类型Logger
            CapturedText.should.match(/\[\d+-\d+-\d+T\d+:\d+:\d+\.\d+Z\]\s+\[ERR\]\s+default-console-logger\s+-\s+test err./);

            // 验证Files类型Logger
            // 等一下，有可能文件还没有写入
            await new Promise((resolve, reject) => {
                setTimeout(() => {
                    let CurState = null;
                    let FileContent = null;
                    try {
                        // 日志文件是否存在
                        CurState = FS.statSync(LogFileAbPath);
                        let isFile = CurState.isFile();
                        isFile.should.be.ok();

                        // 读取日志文件内容
                        FileContent = FS.readFileSync(LogFileAbPath, { encoding : 'utf8'});
                        // 判断内容
                        FileContent.should.match(/\[\d+-\d+-\d+T\d+:\d+:\d+\.\d+Z\]\s+\[ERR\]\s+default-files-logger\s+-\s+test err./);
                    } catch (error) {
                        console.log(error);
                        CurState    = null;
                        FileContent = null;
                    }
                    Should.notEqual(CurState, null);
                    Should.notEqual(FileContent, null);

                    resolve();
                }, 1000);
            });

            let CurMsg = await CurClient.rpop(doc.defaultLoggers[2].container);
            CurClient.disconnect();
            await new Promise((resolve, reject) => {
                CurClient.on('close', () => {
                    resolve();
                });
            });

            Should.notEqual(CurMsg, null);
            let CurMsgObj = JSON.parse(CurMsg);
            CurMsgObj.message.should.equal('test err.');

            await CurLogger.close();
            done();
        })();
    });

    it('warn level', (done) => {
        (async () => {
            let CapturedText : string = "";
            let doc = null;
            try {
                doc = Yaml.safeLoad(FS.readFileSync('./src/test/config/DefaultLoggerTestConfig-warn.yml', 'utf8'));
            } catch (error) {
                Should.throws(error);
            }

            // 清理上次的输出结果
            let LogFileAbPath = Path.join(process.cwd(), doc.defaultLoggers[1].filename)
            try {
                let LastState = FS.statSync(LogFileAbPath);
                if (LastState.isFile()) {
                    FS.unlinkSync(LogFileAbPath);
                } else {
                    FSEx.removeSync(LogFileAbPath);
                }
            } catch (error) {
                // console.log(error)
            }
            
            // 读取redis，验证写入内容
            let CurClient = await Connect2Redis(
                doc.defaultLoggers[2].host,
                doc.defaultLoggers[2].port,
                doc.defaultLoggers[2].auth
            );

            Should.notEqual(CurClient, null);
            CurClient.del(doc.defaultLoggers[2].container);

            let CurLogger = new C4Logger.C4Logger();
            await CurLogger.init(doc);

            // 开始捕获标准输出
            let UnhookIntercept = Intercept((text) => {
                CapturedText += text;
            }, (err) => {});

            CurLogger.warn('test warn.');
            UnhookIntercept();
            // 验证Console类型Logger
            CapturedText.should.match(/\[\d+-\d+-\d+T\d+:\d+:\d+\.\d+Z\]\s+\[WARN\]\s+default-console-logger\s+-\s+test warn./);

            // 验证Files类型Logger
            // 等一下，有可能文件还没有写入
            await new Promise((resolve, reject) => {
                setTimeout(() => {
                    let CurState = null;
                    let FileContent = null;
                    try {
                        // 日志文件是否存在
                        CurState = FS.statSync(LogFileAbPath);
                        let isFile = CurState.isFile();
                        isFile.should.be.ok();

                        // 读取日志文件内容
                        FileContent = FS.readFileSync(LogFileAbPath, { encoding : 'utf8'});
                        // 判断内容
                        FileContent.should.match(/\[\d+-\d+-\d+T\d+:\d+:\d+\.\d+Z\]\s+\[WARN\]\s+default-files-logger\s+-\s+test warn./);
                    } catch (error) {
                        console.log(error);
                        CurState    = null;
                        FileContent = null;
                    }
                    Should.notEqual(CurState, null);
                    Should.notEqual(FileContent, null);

                    resolve();
                }, 1000);
            });

            let CurMsg = await CurClient.rpop(doc.defaultLoggers[2].container);
            CurClient.disconnect();
            await new Promise((resolve, reject) => {
                CurClient.on('close', () => {
                    resolve();
                });
            });

            Should.notEqual(CurMsg, null);
            let CurMsgObj = JSON.parse(CurMsg);
            CurMsgObj.message.should.equal('test warn.');

            await CurLogger.close();
            done();
        })();
    });

    it('info level', (done) => {
        (async () => {
            let CapturedText : string = "";
            let doc = null;
            try {
                doc = Yaml.safeLoad(FS.readFileSync('./src/test/config/DefaultLoggerTestConfig-info.yml', 'utf8'));
            } catch (error) {
                Should.throws(error);
            }
            // 清理上次的输出结果
            let LogFileAbPath = Path.join(process.cwd(), doc.defaultLoggers[1].filename)
            try {
                let LastState = FS.statSync(LogFileAbPath);
                if (LastState.isFile()) {
                    FS.unlinkSync(LogFileAbPath);
                } else {
                    FSEx.removeSync(LogFileAbPath);
                }
            } catch (error) {
                // console.log(error)
            }
            
            // 读取redis，验证写入内容
            let CurClient = await Connect2Redis(
                doc.defaultLoggers[2].host,
                doc.defaultLoggers[2].port,
                doc.defaultLoggers[2].auth
            );

            Should.notEqual(CurClient, null);
            CurClient.del(doc.defaultLoggers[2].container);

            let CurLogger = new C4Logger.C4Logger();
            await CurLogger.init(doc);

            // 开始捕获标准输出
            let UnhookIntercept = Intercept((text) => {
                CapturedText += text;
            }, (err) => {});

            CurLogger.info('test info.');
            UnhookIntercept();
            // 验证Console类型Logger
            CapturedText.should.match(/\[\d+-\d+-\d+T\d+:\d+:\d+\.\d+Z\]\s+\[INFO\]\s+default-console-logger\s+-\s+test info./);

            // 验证Files类型Logger
            // 等一下，有可能文件还没有写入
            await new Promise((resolve, reject) => {
                setTimeout(() => {
                    let CurState = null;
                    let FileContent = null;
                    try {
                        // 日志文件是否存在
                        CurState = FS.statSync(LogFileAbPath);
                        let isFile = CurState.isFile();
                        isFile.should.be.ok();

                        // 读取日志文件内容
                        FileContent = FS.readFileSync(LogFileAbPath, { encoding : 'utf8'});
                        // 判断内容
                        FileContent.should.match(/\[\d+-\d+-\d+T\d+:\d+:\d+\.\d+Z\]\s+\[INFO\]\s+default-files-logger\s+-\s+test info./);
                    } catch (error) {
                        console.log(error);
                        CurState    = null;
                        FileContent = null;
                    }
                    Should.notEqual(CurState, null);
                    Should.notEqual(FileContent, null);

                    resolve();
                }, 1000);
            });

            let CurMsg = await CurClient.rpop(doc.defaultLoggers[2].container);
            CurClient.disconnect();
            await new Promise((resolve, reject) => {
                CurClient.on('close', () => {
                    resolve();
                });
            });

            Should.notEqual(CurMsg, null);
            let CurMsgObj = JSON.parse(CurMsg);
            CurMsgObj.message.should.equal('test info.');

            await CurLogger.close();
            done();
        })();
    });

    it('debug level', (done) => {
        (async () => {
            let CapturedText : string = "";
            let doc = null;
            try {
                doc = Yaml.safeLoad(FS.readFileSync('./src/test/config/DefaultLoggerTestConfig-debug.yml', 'utf8'));
            } catch (error) {
                Should.throws(error);
            }
            // 清理上次的输出结果
            let LogFileAbPath = Path.join(process.cwd(), doc.defaultLoggers[1].filename)
            try {
                let LastState = FS.statSync(LogFileAbPath);
                if (LastState.isFile()) {
                    FS.unlinkSync(LogFileAbPath);
                } else {
                    FSEx.removeSync(LogFileAbPath);
                }
            } catch (error) {
                // console.log(error)
            }
            
            // 读取redis，验证写入内容
            let CurClient = await Connect2Redis(
                doc.defaultLoggers[2].host,
                doc.defaultLoggers[2].port,
                doc.defaultLoggers[2].auth
            );

            Should.notEqual(CurClient, null);
            CurClient.del(doc.defaultLoggers[2].container);

            let CurLogger = new C4Logger.C4Logger();
            await CurLogger.init(doc);

            // 开始捕获标准输出
            let UnhookIntercept = Intercept((text) => {
                CapturedText += text;
            }, (err) => {
                CapturedText += err;
            });

            CurLogger.debug('test debug.');
            UnhookIntercept();
            // console.log(CapturedText);
            // await new Promise((resovle) => {
            //     setTimeout(() => {
            //         resovle();
            //     }, 2000);
            // })
            // 验证Console类型Logger
            CapturedText.should.match(/\[\d+-\d+-\d+T\d+:\d+:\d+\.\d+Z\]\s+\[DEBUG\]\s+default-console-logger\s+-\s+test debug./);

            // console.log('xxxxxxx');

            // 验证Files类型Logger
            // 等一下，有可能文件还没有写入
            await new Promise((resolve, reject) => {
                setTimeout(() => {
                    let CurState = null;
                    let FileContent = null;
                    try {
                        // 日志文件是否存在
                        CurState = FS.statSync(LogFileAbPath);
                        let isFile = CurState.isFile();
                        isFile.should.be.ok();

                        // 读取日志文件内容
                        FileContent = FS.readFileSync(LogFileAbPath, { encoding : 'utf8'});
                        // 判断内容
                        FileContent.should.match(/\[\d+-\d+-\d+T\d+:\d+:\d+\.\d+Z\]\s+\[DEBUG\]\s+default-files-logger\s+-\s+test debug./);
                    } catch (error) {
                        console.log(error);
                        CurState    = null;
                        FileContent = null;
                    }
                    Should.notEqual(CurState, null);
                    Should.notEqual(FileContent, null);

                    resolve();
                }, 1000);
            });

            let CurMsg = await CurClient.rpop(doc.defaultLoggers[2].container);
            CurClient.disconnect();
            await new Promise((resolve, reject) => {
                CurClient.on('close', () => {
                    resolve();
                });
            });

            Should.notEqual(CurMsg, null);
            let CurMsgObj = JSON.parse(CurMsg);
            CurMsgObj.message.should.equal('test debug.');

            await CurLogger.close();
            done();
        })();
    });

    it('trace level', (done) => {
        (async () => {
            let CapturedText : string = "";
            let doc = null;
            try {
                doc = Yaml.safeLoad(FS.readFileSync('./src/test/config/DefaultLoggerTestConfig-trace.yml', 'utf8'));
            } catch (error) {
                Should.throws(error);
            }
            // 清理上次的输出结果
            let LogFileAbPath = Path.join(process.cwd(), doc.defaultLoggers[1].filename)
            try {
                let LastState = FS.statSync(LogFileAbPath);
                if (LastState.isFile()) {
                    FS.unlinkSync(LogFileAbPath);
                } else {
                    FSEx.removeSync(LogFileAbPath);
                }
            } catch (error) {
                // console.log(error)
            }
            
            // 读取redis，验证写入内容
            let CurClient = await Connect2Redis(
                doc.defaultLoggers[2].host,
                doc.defaultLoggers[2].port,
                doc.defaultLoggers[2].auth
            );

            Should.notEqual(CurClient, null);
            CurClient.del(doc.defaultLoggers[2].container);

            let CurLogger = new C4Logger.C4Logger();
            await CurLogger.init(doc);

            // 开始捕获标准输出
            let UnhookIntercept = Intercept((text) => {
                CapturedText += text;
            }, (err) => {});

            CurLogger.trace('test trace.');
            UnhookIntercept();
            // 验证Console类型Logger
            CapturedText.should.match(/\[\d+-\d+-\d+T\d+:\d+:\d+\.\d+Z\]\s+\[TRACE\]\s+default-console-logger\s+-\s+test trace./);

            // 验证Files类型Logger
            // 等一下，有可能文件还没有写入
            await new Promise((resolve, reject) => {
                setTimeout(() => {
                    let CurState = null;
                    let FileContent = null;
                    try {
                        // 日志文件是否存在
                        CurState = FS.statSync(LogFileAbPath);
                        let isFile = CurState.isFile();
                        isFile.should.be.ok();

                        // 读取日志文件内容
                        FileContent = FS.readFileSync(LogFileAbPath, { encoding : 'utf8'});
                        // 判断内容
                        FileContent.should.match(/\[\d+-\d+-\d+T\d+:\d+:\d+\.\d+Z\]\s+\[TRACE\]\s+default-files-logger\s+-\s+test trace./);
                    } catch (error) {
                        console.log(error);
                        CurState    = null;
                        FileContent = null;
                    }
                    Should.notEqual(CurState, null);
                    Should.notEqual(FileContent, null);

                    resolve();
                }, 1000);
            });

            let CurMsg = await CurClient.rpop(doc.defaultLoggers[2].container);
            CurClient.disconnect();
            await new Promise((resolve, reject) => {
                CurClient.on('close', () => {
                    resolve();
                });
            });

            Should.notEqual(CurMsg, null);
            let CurMsgObj = JSON.parse(CurMsg);
            CurMsgObj.message.should.equal('test trace.');

            await CurLogger.close();
            done();
        })();
    });
});
