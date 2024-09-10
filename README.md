

# Ethereum (ETH) Deposit Monitor

## Overview

The Ethereum Deposit Monitor is a TypeScript-based application designed to track and log ETH deposits on the Beacon Deposit Contract. It integrates with Ethereum nodes via RPC, processes deposit transactions, and provides real-time notifications and visualizations.

## Features

- **Real-Time Monitoring**: Tracks ETH deposits on the Beacon Deposit Contract.
- **Detailed Logging**: Records deposit details including sender address, amount, and timestamp.
- **Alerts**: Sends notifications via Telegram for new deposits.
- **Visualization**: Displays deposit data and metrics on a Grafana dashboard.
- **Error Handling**: Robust logging and error management.
- **Dockerization**: Dockerization also performed (May face some Errors, still need work on that)

## Table of Contents

- [Ethereum (ETH) Deposit Monitor](#ethereum-eth-deposit-monitor)
  - [Overview](#overview)
  - [Features](#features)
  - [Table of Contents](#table-of-contents)
  - [Installation](#installation)
  - [Configuration](#configuration)
  - [Running the Application](#running-the-application)
  - [Usage](#usage)
  - [Data Schema](#data-schema)
  - [Project Deliverables](#project-deliverables)
  - [Support and Contributions](#support-and-contributions)

## Installation

To get started with the Ethereum Deposit Monitor, follow these steps:

1. **Clone the Repository**
   ```bash
   git clone [repository-url]
   cd [project-directory]
   ```

2. **Install Node.js and TypeScript**
   - Ensure Node.js is installed. Install TypeScript globally:
     ```bash
     npm install -g typescript
     ```

3. **Install Dependencies**
   ```bash
   npm install
   ```

## Configuration

1. **Set Up Environment Variables**
   - Create a `.env` file in the project root with the following content:
     ```env
     ALCHEMY_API_KEY=YOUR_ALCHEMY_API_KEY
     MONGO_URI=YOUR_MONGO_URI
     ETH_BLOCK_FROM=20714004
     TELEGRAM_NOTIFICATIONS_BOT_TOKEN=YOUR_TELEGRAM_BOT_TOKEN
     TELEGRAM_NOTIFICATIONS_CHAT_ID=YOUR_TELEGRAM_CHAT_ID
     ```

## Running the Application

1. **Start the Main Application**
   ```bash
   npm start
   ```

2. **Run Monitoring and Alerting Servers**
   ```bash
   npm run dev-api
   npm run dev
   ```

   This command will start the Prometheus and Grafana servers.

3. **Access Grafana Dashboard**
   - Visit `http://localhost:3000` to view real-time deposit data.

## Usage

1. **Monitor Deposits**
   - The application will automatically start tracking deposits from the Beacon Deposit Contract.
   - Deposit information will be logged and visible on the Grafana dashboard.

2. **Receive Alerts**
   - Notifications about new deposits will be sent to the configured Telegram chat.

## Data Schema

The deposit data is structured as follows:

```typescript
Deposit {
    blockNumber: number;
    timestamp: number;
    fee?: number;
    transactionHash?: string;
    publicKey: string;
}
```

## Project Deliverables

- TypeScript-based Ethereum deposit monitoring application.
- Complete source code repository with detailed documentation.
- README file with setup and usage instructions.
- Integrated error handling and logging.
- Grafana dashboard for data visualization.
- Telegram notifications for deposit alerts.

## Support and Contributions

For support or to contribute to the project:

- **Issues**: Report any issues on the [GitHub Issues page](#).
- **Contributions**: Submit pull requests or suggestions via [GitHub](#).

