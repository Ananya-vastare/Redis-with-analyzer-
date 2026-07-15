const fs = require("fs").promises;
const path = require("path");

const logger = require("./utils/logger")("persistence");

class Persistence {

    constructor(store, expirationTimes) {

        this.store = store;
        this.expirationTimes = expirationTimes;

        this.DATA_FILE = path.join(__dirname, "data.rdb");

    }

    async saveSnapshot() {

        try {

            const data = JSON.stringify(
                {
                    store: this.store,
                    expirationTimes: this.expirationTimes
                },
                null,
                2
            );

            await fs.writeFile(
                this.DATA_FILE,
                data,
                "utf8"
            );

            logger.log("Snapshot saved successfully.");

        } catch (error) {

            logger.log(
                `Error saving snapshot: ${error.message}`
            );

        }

    }

    async loadSnapshot() {

        try {

            const data = await fs.readFile(
                this.DATA_FILE,
                "utf8"
            );

            const parsedData = JSON.parse(data);

            // Keep the same object references
            Object.assign(
                this.store,
                parsedData.store || {}
            );

            Object.assign(
                this.expirationTimes,
                parsedData.expirationTimes || {}
            );

            logger.log("Snapshot loaded successfully.");

        } catch (error) {

            if (error.code === "ENOENT") {

                logger.log(
                    "No snapshot found. Starting with an empty store."
                );

            } else {

                logger.log(
                    `Error loading snapshot: ${error.message}`
                );

            }

        }

    }

}

module.exports = Persistence;