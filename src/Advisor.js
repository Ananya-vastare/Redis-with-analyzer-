const config = require("./config");

class AIAdvisor {
    constructor(store, expirationTimes, metrics = {}) {
        this.store = store;
        this.expirationTimes = expirationTimes;
        this.metrics = metrics;
    }
    analyze() {
        const keys = Object.keys(this.store);

        let totalMemory = 0;
        let expired = 0;
        let noTTL = 0;

        let largestKey = null;
        let largestSize = 0;

        const now = Date.now();

        keys.forEach((key) => {

            const item = this.store[key];

            const size = Buffer.byteLength(
                JSON.stringify(item),
                "utf8"
            );

            totalMemory += size;

            if (
                this.expirationTimes[key] &&
                this.expirationTimes[key] < now
            ) {
                expired++;
            }

            if (!this.expirationTimes[key]) {
                noTTL++;
            }

            if (size > largestSize) {
                largestSize = size;
                largestKey = key;
            }
        });

        const issues = [];
        const recommendations = [];

        if (expired > 0) {
            issues.push(`${expired} expired keys detected.`);
            recommendations.push("Delete expired keys periodically.");
        }

        if (noTTL > 0) {
            issues.push(`${noTTL} keys have no TTL.`);
            recommendations.push("Consider using EXPIRE for temporary data.");
        }

        if (largestKey) {
            issues.push(`Largest key: ${largestKey}`);
            recommendations.push(`Split or archive '${largestKey}'.`);
        }

        if (totalMemory > 5 * 1024 * 1024) {
            issues.push("High memory usage.");
            recommendations.push("Compress or remove unused values.");
        }

        const health =
            Math.max(
                0,
                100 -
                    expired * 4 -
                    noTTL * 2 -
                    (totalMemory / (1024 * 1024)) * 3
            ).toFixed(0);

        return JSON.stringify(
            {
                health: Number(health),
                statistics: {
                    totalKeys: keys.length,
                    memoryKB: (totalMemory / 1024).toFixed(2),
                    expiredKeys: expired,
                    keysWithoutTTL: noTTL,
                    largestKey,
                    persistenceEnabled: config.snapshot
                },
                issues,
                recommendations
            },
            null,
            2
        );
    }

    whySlow() {

        const keys = Object.keys(this.store);

        let largestKey = null;
        let largestSize = 0;

        keys.forEach((key) => {

            const size = Buffer.byteLength(
                JSON.stringify(this.store[key]),
                "utf8"
            );

            if (size > largestSize) {
                largestSize = size;
                largestKey = key;
            }
        });

        const reasons = [];
        const suggestions = [];

        if (largestKey) {
            reasons.push(
                `Large key '${largestKey}' occupies most memory.`
            );
            suggestions.push(
                `Split '${largestKey}' into smaller structures.`
            );
        }
        if (config.snapshot) {
            reasons.push(
                "Snapshot persistence may introduce write latency."
            );
            suggestions.push(
                "Increase snapshot interval if acceptable."
            );
        }
        if (
            Object.keys(this.expirationTimes).length <
            keys.length
        ) {
            reasons.push(
                "Many keys never expire."
            );
            suggestions.push(
                "Assign TTL to cache/session data."
            );
        }
        return JSON.stringify(
            {
                diagnosis: reasons,
                suggestions
            },
            null,
            2
        );
    }
}
module.exports = AIAdvisor;