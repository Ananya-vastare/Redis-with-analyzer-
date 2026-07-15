const debugNamespaces = (process.env.DEBUG || '*').split(',').map(ns => ns.trim());// Split the DEBUG environment variable into an array of namespaces

const logger = (namespace)=>{
    const log=(mode,message)=>{
        const logMessage = `[${new Date().toISOString()}] [${mode.toUpperCase()}] [${namespace}] ${message}`;

        if(mode == "error"){
            console.error(logMessage);
            return;
        }
        if(debugNamespaces.includes('*') || debugNamespaces.includes(namespace)){
        console[mode](logMessage);
        }
    };
    return{
        log:(message)=>log('log',message),
        error:(message)=>log('error',message),
        warn:(message)=>log('warn',message),
        debug:(message)=>log('debug',message)

    }
}

module.exports = logger;// Export the logger function for use in other modules
