# My Own Redis

A lightweight Redis-inspired in-memory key-value database built using **Node.js** and **TCP sockets**. This project implements core Redis functionality such as key-value storage, persistence, expiration (TTL), and an AI-powered advisor that analyzes the database and provides optimization recommendations.

---

## Features

- In-memory key-value store
- TCP server implementation
- Persistent snapshot storage
- Key expiration (TTL)
- Automatic data recovery on restart
- AI-based database health analysis
- Logging utilities
- Simple Redis CLI
- Unit tests

---

## Tech Stack

- Node.js
- TCP Sockets (`net` module)
- JavaScript (ES6)
- File System (Persistence)
- JSON

---

## Project Structure

```
Redis/
│
├── src/
│   ├── server.js           # TCP server
│   ├── core.js             # Command parser & execution
│   ├── persistence.js      # Snapshot handling
│   ├── Advisor.js          # AI health advisor
│   ├── config.json
│   ├── data.rdb            # Snapshot database
│   └── utils/
│       ├── logger.js
│       └── redis-cli.js
│
├── tests/
│   └── server.test.js
│
├── package.json
├── LICENSE
└── README.md
```

---

## Supported Commands

| Command | Description |
|----------|-------------|
| SET | Store a key-value pair |
| GET | Retrieve a value |
| DELETE | Remove a key |
| EXPIRE | Set key expiration time |
| TTL | Get remaining lifetime |
| RESET | Clear the database |
| AI | Analyze database health *(if enabled)* |

---

## Installation

Clone the repository

```bash
git clone https://github.com/<your-username>/Redis.git
```

Move into the project

```bash
cd Redis
```

Install dependencies

```bash
npm install
```

---

## Running the Server

```bash
npm start
```

The server starts on

```
127.0.0.1:8888
```

---

## Using the Redis CLI

Run the CLI utility

```bash
node src/utils/redis-cli.js
```

Example commands

```text
SET name Ananya

GET name

DELETE name

EXPIRE name 60

TTL name
```

---

## Persistence

The database periodically saves snapshots into:

```
src/data.rdb
```

When the server restarts, the snapshot is automatically loaded, ensuring data is not lost.

---

## AI Advisor

The built-in AI Advisor analyzes the current database and reports:

- Database health score
- Memory usage
- Total keys
- Expired keys
- Keys without TTL
- Largest key
- Optimization recommendations

Example output

```json
{
  "health": 96,
  "statistics": {
    "totalKeys": 12,
    "memoryKB": 2.45,
    "expiredKeys": 0,
    "keysWithoutTTL": 5
  },
  "recommendations": [
    "Consider using EXPIRE for temporary data."
  ]
}
```

---

## Testing

Run the tests

```bash
npm test
```

---

## Future Improvements

- RESP protocol compatibility
- Lists
- Sets
- Hashes
- Sorted Sets
- Pub/Sub
- Transactions
- Replication
- Authentication
- Web dashboard

---

## Learning Outcomes

This project helped in understanding:

- TCP socket programming
- Building an in-memory database
- Persistence mechanisms
- TTL implementation
- Command parsing
- File handling in Node.js
- Database optimization techniques
- Modular software design

---
