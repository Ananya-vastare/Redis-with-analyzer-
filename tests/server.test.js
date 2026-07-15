const net = require("net");
const assert = require("node:assert");
const { before, after, beforeEach, test } = require("node:test");


let redisClient;
beforeEach(async () => {
    await sendCommand("RESET");
});

const connectToRedis = () => {

    return new Promise((resolve,reject)=>{

        const client = net.createConnection(
            {
                host:"127.0.0.1",
                port:8888
            },
            ()=>{
                resolve(client);
            }
        );


        client.on("error",(err)=>{
            reject(err);
        });

    });

};



before(async()=>{

    redisClient = await connectToRedis();

});



after(()=>{

    if(redisClient && !redisClient.destroyed){
        redisClient.end();
    }

});



const sendCommand = (command)=>{

    return new Promise((resolve,reject)=>{


        const onData=(data)=>{

            redisClient.removeListener(
                "error",
                onError
            );

            resolve(
                data.toString().trim()
            );

        };



        const onError=(err)=>{

            redisClient.removeListener(
                "data",
                onData
            );

            reject(err);

        };



        redisClient.once(
            "data",
            onData
        );


        redisClient.once(
            "error",
            onError
        );


        redisClient.write(command);

    });

};




// ================= SET GET =================


test("SET and GET",async()=>{


    assert.strictEqual(
        await sendCommand("SET name Ananya"),
        "OK"
    );


    assert.strictEqual(
        await sendCommand("GET name"),
        "Ananya"
    );


});




// ================= DELETE =================


test("DELETE key",async()=>{


    await sendCommand(
        "SET temp value"
    );


    assert.strictEqual(
        await sendCommand("DELETE temp"),
        "OK"
    );


    assert.strictEqual(
        await sendCommand("GET temp"),
        "ERROR: Key not found"
    );


});




// ================= EXPIRE =================


test("EXPIRE key",async()=>{


    await sendCommand(
        "SET token abc"
    );


    assert.strictEqual(
        await sendCommand("EXPIRE token 1"),
        ":1"
    );


    await new Promise(
        r=>setTimeout(r,1500)
    );


    assert.strictEqual(
        await sendCommand("GET token"),
        "ERROR: Key has expired"
    );


});





// ================= TTL =================


test("TTL without expiry",async()=>{


    await sendCommand(
        "SET permanent data"
    );


    assert.strictEqual(
        await sendCommand("TTL permanent"),
        ":-1"
    );


});




test("TTL with expiry",async()=>{


    await sendCommand(
        "SET session active"
    );


    await sendCommand(
        "EXPIRE session 5"
    );


    const ttl =
        await sendCommand("TTL session");


    const value =
        Number(ttl.replace(":",""));


    assert.ok(
        value>=0 && value<=5
    );


});





// ================= INCR =================


test("INCR",async()=>{


    assert.strictEqual(
        await sendCommand("INCR counter"),
        ":1"
    );


    assert.strictEqual(
        await sendCommand("GET counter"),
        "1"
    );


});





test("INCR existing",async()=>{


    await sendCommand(
        "SET count 10"
    );


    assert.strictEqual(
        await sendCommand("INCR count"),
        ":11"
    );


});





// ================= DECR =================


test("DECR",async()=>{


    await sendCommand(
        "SET count 10"
    );


    assert.strictEqual(
        await sendCommand("DECR count"),
        ":9"
    );


});





test("DECR new key",async()=>{


    assert.strictEqual(
        await sendCommand("DECR new"),
        ":-1"
    );


});




// ================= LISTS =================


test("LPUSH",async()=>{


    assert.strictEqual(
        await sendCommand(
            "LPUSH fruits apple banana orange"
        ),
        ":3"
    );


});




test("RPUSH",async()=>{


    assert.strictEqual(
        await sendCommand(
            "RPUSH colors red green blue"
        ),
        ":3"
    );


});





test("LRANGE",async()=>{


    await sendCommand(
        "LPUSH numbers one two three"
    );


    const response =
        await sendCommand(
            "LRANGE numbers 0 2"
        );


    assert.strictEqual(
        response,
        "*3\r\n$5\r\nthree\r\n$3\r\ntwo\r\n$3\r\none"
    );


});





test("LPOP",async()=>{


    await sendCommand(
        "RPUSH fruits apple banana orange"
    );


    assert.strictEqual(
        await sendCommand("LPOP fruits"),
        "apple"
    );


});





test("RPOP",async()=>{


    await sendCommand(
        "RPUSH fruits apple banana orange"
    );


    assert.strictEqual(
        await sendCommand("RPOP fruits"),
        "orange"
    );


});





// ================= ERRORS =================


test("invalid command",async()=>{


    assert.strictEqual(
        await sendCommand("HELLO"),
        "ERROR: Invalid command"
    );


});




test("wrong SET arguments",async()=>{


    assert.strictEqual(
        await sendCommand("SET key"),
        "ERROR: SET command requires at least 2 arguments"
    );


});




test("wrong GET arguments",async()=>{


    assert.strictEqual(
        await sendCommand("GET"),
        "ERROR: GET command requires at least 1 argument"
    );


});




test("wrong LPUSH arguments",async()=>{


    assert.strictEqual(
        await sendCommand("LPUSH list"),
        "ERROR: LPUSH command requires at least 2 arguments"
    );


});