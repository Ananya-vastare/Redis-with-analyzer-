const net = require('net');//importing module net for TCP server
const logger = require('./utils/logger')('server');//importing logger module
const loggerUtil = require('./utils/logger')('util');//importing logger module for utility functions
const {parseCommand,executeCommand,init,resetStore} = require('./core');//importing core module for parsing and sending commands
const {store,expirationTimes} = require('./persistence');//importing store module for storing data
const server = net.createServer();//creating an object

const port = 8888;
const host = '127.0.0.1';

server.on('connection', (socket) => {
    loggerUtil.log('Server connected');

    socket.on("data", (data) => {
        let response;

        try {
            const { command, args } = parseCommand(data);

            if(command === "RESET"){
                resetStore();
                socket.write("OK");
                return;
            }
            response = executeCommand(command, args);
        } catch (error) {
            console.error("Error parsing command:", error);
            response = "ERROR: Invalid command";
        }

        console.log("RESPONSE:", response);
        socket.write(response);
    });

    socket.on("end", () => {
        loggerUtil.log("Client disconnected");
    });

    socket.on("error", (err) => {
        loggerUtil.log(`Socket error: ${err.message}`);
    });
});


server.listen(port, host,  () => {
     init();
    console.log(`Server is running on http://${host}:${port}`);
});//listening to the port and host