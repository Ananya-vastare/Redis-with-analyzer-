const logger = require("./utils/logger")("core");
const config = require("./config");
const Persistence = require("./persistence");
const AIAdvisor = require("./Advisor");
// Shared in-memory database
const store = {};
const expirationTimes = {};

// Pass the store references to Persistence
const persistence = new Persistence(
    store,
    expirationTimes
);
const aiAdvisor = new AIAdvisor(
    store,
    expirationTimes
);
const isExpired = (key) => {
    if (expirationTimes[key] && Date.now() > expirationTimes[key]) {
        delete store[key];
        delete expirationTimes[key];
        return true;
    }
    return false;
};

const commonHandler = {

    SET: (args) => {
        if (args.length < 2) {
            return "ERROR: SET command requires at least 2 arguments";
        }
        const [key, value] = args;
        store[key] = {
            type: "string",
            value
        };
        delete expirationTimes[key];
        persistence.saveSnapshot();
        return "OK";
    },
    GET: (args) => {
        if (args.length < 1) {
            return "ERROR: GET command requires at least 1 argument";
        }
        const [key] = args;
        if (isExpired(key)) {
            return "ERROR: Key has expired";
        }
        if (!store[key]) {
            return "ERROR: Key not found";
        }
        if (store[key].type !== "string") {
            return "ERROR: WRONGTYPE Operation against a key holding the wrong kind of value";
        }
        return store[key].value;
    },
    DELETE: (args) => {
        if (args.length < 1) {
            return "ERROR: DELETE command requires at least 1 argument";
        }
        const [key] = args;
        if (isExpired(key)) {
            return "ERROR: Key has expired";
        }
        if (!store[key]) {
            return "ERROR: Key not found";
        }
        delete store[key];
        delete expirationTimes[key];
        persistence.saveSnapshot();
        return "OK";
    },
    EXPIRE: (args) => {
        if (args.length < 2) {
            return "ERROR: EXPIRE command requires at least 2 arguments";
        }
        const [key, seconds] = args;
        if (isExpired(key)) {
            return "ERROR: Key has expired";
        }
        if (!store[key]) {
            return "ERROR: Key not found";
        }
        const ttl = parseInt(seconds);
        if (isNaN(ttl) || ttl < 0) {
            return "ERROR: Invalid expiration time";
        }
        expirationTimes[key] = Date.now() + ttl * 1000;
        persistence.saveSnapshot();
        return ":1\r\n";
    },
    TTL: (args) => {
        if (args.length < 1) {
            return "ERROR: TTL command requires at least 1 argument";
        }
        const [key] = args;
        if (isExpired(key)) {
            return "ERROR: Key has expired";
        }
        if (!store[key]) {
            return "ERROR: Key not found";
        }
        if (!expirationTimes[key]) {
            return ":-1\r\n";
        }
        const ttl = Math.ceil(
            (expirationTimes[key] - Date.now()) / 1000
        );
        return `:${Math.max(ttl, 0)}\r\n`;
    },
    INCR: (args) => {
        if (args.length < 1) {
            return "-ERR wrong number of arguments for 'incr' command\r\n";
        }
        const [key] = args;
        if (isExpired(key)) {
            delete store[key];
        }
        if (!store[key]) {
            store[key] = {
                type: "string",
                value: "1"
            };
            persistence.saveSnapshot();
            return ":1\r\n";
        }
        const value = Number(store[key].value);
        if (isNaN(value)) {
            return "-ERR value is not an integer or out of range\r\n";
        }
        store[key].value = String(value + 1);
        persistence.saveSnapshot();
        return `:${value + 1}\r\n`;
    },
    DECR: (args) => {
        if (args.length < 1) {
            return "-ERR wrong number of arguments for 'decr' command\r\n";
        }
        const [key] = args;
        if (isExpired(key)) {
            delete store[key];
        }
        if (!store[key]) {
            store[key] = {
                type: "string",
                value: "-1"
            };
            persistence.saveSnapshot();
            return ":-1\r\n";
        }
        const value = Number(store[key].value);
        if (isNaN(value)) {
            return "-ERR value is not an integer or out of range\r\n";
        }
        store[key].value = String(value - 1);
        persistence.saveSnapshot();
        return `:${value - 1}\r\n`;
    },
    LPUSH: (args)=>{
        if(args.length < 2){
            return "ERROR: LPUSH command requires at least 2 arguments";
        }
        const [key,...values] = args;
        if(isExpired(key)){
            return "ERROR: Key has expired";
        }
        if(store[key] && store[key].type !== "list"){
            return "ERROR: Key is not a list";
        }
        if(!store[key]){
            store[key]={
                type:"list",
                value:[]
            };
        }
        store[key].value.unshift(...values.reverse());
        persistence.saveSnapshot();
        return `:${store[key].value.length}\r\n`;
    },
    RPUSH:(args)=>{
        if(args.length < 2){
            return "ERROR: RPUSH command requires at least 2 arguments";
        }
        const [key,...values]=args;
        if(isExpired(key)){
            return "ERROR: Key has expired";
        }
        if(store[key] && store[key].type !== "list"){
            return "ERROR: Key is not a list";
        }
        if(!store[key]){
            store[key]={
                type:"list",
                value:[]
            };
        }
        store[key].value.push(...values);
        persistence.saveSnapshot();
        return `:${store[key].value.length}\r\n`;

    },
    LPOP:(args)=>{
        if(args.length < 1){
            return "ERROR: LPOP command requires at least 1 argument";
        }
        const [key]=args;
        if(isExpired(key)){
            return "ERROR: Key has expired";
        }
        if(!store[key]){
            return "ERROR: Key not found";
        }
        if(store[key].type !== "list"){
            return "ERROR: Key is not a list";
        }
        const value = store[key].value.shift();
        persistence.saveSnapshot();
        return value;
    },
    RPOP:(args)=>{
        if(args.length < 1){
            return "ERROR: RPOP command requires at least 1 argument";
        }
        const [key]=args;
        if(isExpired(key)){
            return "ERROR: Key has expired";
        }
        if(!store[key]){
            return "ERROR: Key not found";
        }
        if(store[key].type !== "list"){
            return "ERROR: Key is not a list";
        }
        const value = store[key].value.pop();
        persistence.saveSnapshot();
        return value;
},
    LRANGE: (args) => {
        if (args.length < 3) {
            return "ERROR: LRANGE command requires at least 3 arguments";
        }
        const [key, start, stop] = args;
        if (isExpired(key)) {
            return "ERROR: Key has expired";
        }
        if (!store[key]) {
            return "ERROR: Key not found";
        }
        if (store[key].type !== "list") {
            return "ERROR: Key is not a list";
        }
        const list = store[key].value;
        const startIndex = parseInt(start);
        const stopIndex = parseInt(stop);
        const range = list.slice(
            startIndex,
            stopIndex + 1
        );
        let response = `*${range.length}\r\n`;
        range.forEach(item => {

            response += `$${item.length}\r\n${item}\r\n`;

        });

        return response;
    },


    COMMAND: () => {
        return "OK";
    }

};

const executeCommand = (command, args) => {
    logger.log(`Executing command: ${command} with arguments: ${args}`);
    command = command.toUpperCase();
    if (command === "AI_ANALYZE") {
        return aiAdvisor.analyze();
    }
    if (command === "WHY_SLOW") {
        return aiAdvisor.whySlow();
    }
    const handler = commonHandler[command];
    if (!handler) {
        return "ERROR: Invalid command";
    }
    return handler(args);
};

const parseCommand = (data) => {
    const lines = data.toString().split('\r\n').filter((line) => line);
    const command = lines[0].split(" ");

    return {
        command: command[0],
        args: command.slice(1)
    };
};

const init = async () => {
    if (config.snapshot) {
        logger.log("Loading snapshot...");
        await persistence.loadSnapshot();
        setInterval(async () => {
            await persistence.saveSnapshot();
        }, config.snapshotInterval);
    } else {
        logger.log("Snapshot loading disabled.");
    }
};

const resetStore = () => {
    Object.keys(store).forEach((key) => {
        delete store[key];
    });
    Object.keys(expirationTimes).forEach((key) => {
        delete expirationTimes[key];
    });
    persistence.saveSnapshot();
};
module.exports = {
    parseCommand,
    executeCommand,
    init,
    resetStore
};