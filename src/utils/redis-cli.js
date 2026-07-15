const net = require('net');
const readline = require('readline');

const client = net.createConnection(
    {
        port: 8888,
        host: '127.0.0.1'
    },
    () => {
        askCommand();
    }
);


const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});


function askCommand(){

    rl.question("127.0.0.1:8888> ", (command)=>{

        client.write(command);

    });

}


client.on("data",(data)=>{

    console.log(data.toString());

    askCommand();

});


client.on("error",(err)=>{
    console.log(err.message);
});