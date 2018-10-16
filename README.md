<h1>C4Logger 说明</h1>

<h2>模块简介</h2>

C4Logger基于winston进行封装，提供日志的多目的输出，即同一日志信息可以同时输出到文件、控制台和ELK（redis）。

支持日志的颜色显示，对象输出和profile的帮助方法，并且可以在运行时修改当前的日志级别。

日志默认支持fatal、err、warn、info、debug、trace六个日志级别，对应red、red、yellow、green、blue、magenta的颜色（在./src/C4LogLevels.ts中进行配置）。

<h2>使用</h2>

<h3>配置</h3>

使用C4Logger.yml进行配置，配置文件属性详见配置文件注释。配置文件需要配合C4Configger或其他加载配置文件的方法进行配置。在C4Framework中使用Helper进行初始化。

<h3>手动配置</h3>

在C4Logger对象构造完毕后，可以根据需要添加对应的Logger的配置。参考./src/main.ts。

<h3>类s</h3>

* C4Logger

  * 说明：C4 Logger对象
  * 路径：./src/C4Logger.ts
  * 成员变量：

    * m_Logger，Winston的Logger实例；
    * m_Transports，日志写入目标的配置的存储字典，key为logger的名字，value为C4LogTransportInstance。

  * 成员方法：

    * init

    <code>
    
        /**
        * 初始化Logger
        * @param LogConfig Logger配置
        */
        async init(LogConfig : C4LoggerOptions.C4LoggerConfig)
    
    </code>

    <hr>

    * addTransport

    <code>
    
        /**
        * 添加Logger配置
        * @param LogConfig logger配置
        */
        async addTransport(LogConfig : C4LoggerOptions.C4LoggerOptions)
    
    </code>

    <hr>

    * removeTransport

    <code>
    
        /**
        * 移除Logger配置
        * @param LoggerName logger名
        */
        async removeTransport(LoggerName : string)
    
    </code>

    <hr>

    * changeLevel

    <code>
    
        /**
        * 改变日志级别
        * @param Level 级别
        * @param LoggerName logger名
        */
        changeLevel(Level : C4LogLevel.C4LogLevel) : void;
        changeLevel(Level : C4LogLevel.C4LogLevel, LoggerName?: string) : void 
    
    </code>

    <hr>

    * close

    <code>
    
        /**
        * 关闭Logger
        * @param LoggerName logger名
        */
        async close(LoggerName ?: string)
    
    </code>

    <hr>

    * fatal
    * err
    * warn
    * info
    * debug
    * trace

    <code>
    
        fatal(msg : any, ...meta : any[]) : C4Logger 
        err(msg : any, ...meta : any[]) : C4Logger 
        warn(msg : any, ...meta : any[]) : C4Logger 
        info(msg : any, ...meta : any[]) : C4Logger 
        debug(msg : any, ...meta : any[]) : C4Logger 
        trace(msg : any, ...meta : any[]) : C4Logger 
    
    </code>

    <hr>

    * profile

    <code>
    
        /**
        * 进行性能统计
        * @param id 标识
        * @param meta meta信息
        */
        profile(id : string, ...meta : any[]) : C4Logger
    
    </code>

  <hr>

* C4LogTransportInstance

  * 说明：Log Transport的接口类
  * 路径：./src/C4LogTransportInstance.ts
  * 成员变量：无
  * 成员方法：

    * init
    * changeLevel
    * close
    * getName
    * getTransport

    <code>
    
        // 初始化
        init(LogConfig : C4LoggerOptions.C4LoggerOptions) : void;

        // 改变日志等级
        changeLevel(Level : C4LogLevel.C4LogLevel) : void;

        // 关闭Logger
        close() : void;

        // 获取Logger名字
        getName() : string;

        // 获取Transport实例
        getTransport() : Winston.TransportInstance | null;
    
    </code>

    * 其他Transport需要继承并实现这些方法

  <hr>

* C4Log2ConsoleTransport

  * 说明：写入控制台的Logger，继承自C4LogTransportInstance
  * 路径：./src/C4Log2ConsoleTransport
  * 成员变量：
    
    * m_transport，Winston的TransportInstance对象；

  * 成员方法：与C4LogTransportInstance相同

  <hr>

* C4Log2FilesTransport

  * 说明：写入文件的Logger，继承自C4LogTransportInstance
  * 路径：./src/C4Log2FilesTransport
  * 成员变量：

    * m_transport，Winston的TransportInstance对象；
    * m_CurDate，日期字符串，用来按日期来切分日志文件；
    * m_CurDateCount，相同日期文件的计数，用来按日期来切分日志文件；

  * 成员方法：与C4LogTransportInstance相同

  <hr>

* C4Log2RedisTransport

  * 说明：写入Redis的Logger（用于ELK写入），继承自C4LogTransportInstance
  * 路径：./src/C4Log2RedisTransport
  * 成员变量：

    * m_transport，Winston的TransportInstance对象；
    * m_RClient，redis客户端；

  * 成员方法：与C4LogTransportInstance相同

  <hr>
