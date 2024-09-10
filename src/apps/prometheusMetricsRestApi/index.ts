import express, { Request, Response } from "express";
import { getDepositsFetcherService } from "./context";
import { Registry, Counter, Gauge, Summary } from "prom-client";

// Initialize Express app
const app = express();

// Create a Prometheus Registry
const register = new Registry();

// Define Prometheus metrics

// Total number of crypto deposits
// This counter helps in tracking the overall number of deposits processed,
// which can be useful for understanding the scale of transactions over time.
const depositsTotal = new Counter({
  name: "crypto_deposits_total",
  help: "Total number of crypto deposits",
  labelNames: ["blockchain", "network", "token"],
  registers: [register],
});

// Latest block number processed
// This gauge indicates the most recent block number that has been processed.
// It helps in monitoring which block is currently being analyzed and ensures
// the application is processing up-to-date data.
const latestBlockNumber = new Gauge({
  name: "crypto_deposits_latest_block",
  help: "Latest block number processed",
  labelNames: ["blockchain", "network"],
  registers: [register],
});

// Timestamp of the latest processed block
// This gauge shows the timestamp of the latest block processed,
// which is useful for verifying the freshness of the data being analyzed.
const latestBlockTimestamp = new Gauge({
  name: "crypto_deposits_latest_timestamp",
  help: "Timestamp of the latest processed block",
  labelNames: ["blockchain", "network"],
  registers: [register],
});

// Total amount of crypto deposits
// This counter accumulates the total value of all deposits,
// providing insights into the overall financial volume of transactions.
const depositsTotalAmount = new Counter({
  name: "crypto_deposits_total_amount",
  help: "Total amount of crypto deposits",
  labelNames: ["blockchain", "network", "token"],
  registers: [register],
});

// Number of crypto deposits
// This counter tracks the number of individual deposits,
// helping to monitor the transaction activity level over time.
const depositsCount = new Counter({
  name: "crypto_deposits_count",
  help: "Number of crypto deposits",
  labelNames: ["blockchain", "network", "token"],
  registers: [register],
});

// Summary of deposit amounts
// This summary provides statistical information on deposit amounts,
// including metrics such as the average and percentiles, useful for analyzing
// the distribution of deposit values.
const depositAmountSummary = new Summary({
  name: "crypto_deposits_amount_summary",
  help: "Summary of deposit amounts",
  labelNames: ["blockchain", "network", "token"],
  registers: [register],
});

// Details of individual crypto deposits
// This gauge stores details about individual deposits, including the amount and transaction hash.
// It can be used for detailed analysis and tracking specific transactions.
const individualDepositDetails = new Gauge({
  name: "crypto_deposits_individual_details",
  help: "Details of individual crypto deposits",
  labelNames: ["blockchain", "network", "token", "hash"],
  registers: [register],
});

// Average amount of crypto deposits
// This gauge represents the average deposit amount, providing an overview of the
// typical deposit size and helping to identify trends in deposit behavior.
const averageDepositAmount = new Gauge({
  name: "crypto_deposits_average_amount",
  help: "Average amount of crypto deposits",
  labelNames: ["blockchain", "network", "token"],
  registers: [register],
});

// Middleware to parse JSON
app.use(express.json());

let totalFee = 0;
let count = 0;

// Define the metrics endpoint
app.get("/prometheus", async (req: Request, res: Response) => {
  const { blockchain, network, token } = req.query;

  // Calculate timestamp for the last 24 hours
  const oneDayAgo = Math.floor((Date.now() - 24 * 60 * 60 * 1000) / 1000);

  // Check for required query parameters
  if (!blockchain || !network || !token) {
    return res.status(400).send("Missing required parameters");
  }

  try {
    const depositsFetcherService = await getDepositsFetcherService();

    // Fetch deposits from the database
    const deposits = await depositsFetcherService.getDeposits({
      blockchain: blockchain as string,
      network: network as string,
      token: token as string,
      blockTimestamp: oneDayAgo,
    });

    // Update metrics with fetched deposit data
    deposits.forEach((deposit) => {
      depositsTotal
        .labels(deposit.blockchain, deposit.network, deposit.token)
        .inc();
      latestBlockNumber
        .labels(deposit.blockchain, deposit.network)
        .set(deposit.blockNumber);
      latestBlockTimestamp
        .labels(deposit.blockchain, deposit.network)
        .set(deposit.blockTimestamp);

      // Convert fee to number if it's a bigint
      const fee: number = typeof deposit.fee === 'bigint'
        ? Number(deposit.fee)
        : deposit.fee || 0;

      depositsTotalAmount
        .labels(deposit.blockchain, deposit.network, deposit.token)
        .inc(fee);

      depositsCount
        .labels(deposit.blockchain, deposit.network, deposit.token)
        .inc();

      depositAmountSummary
        .labels(deposit.blockchain, deposit.network, deposit.token)
        .observe(fee);

      individualDepositDetails
        .labels(deposit.blockchain, deposit.network, deposit.token, deposit.hash || 'unknown')
        .set(fee);

      totalFee += fee;
      count += 1;
    });

    const averageFee = count > 0 ? totalFee / count : 0;
    averageDepositAmount
      .labels('all', 'all', 'all') // Aggregate average deposit amount
      .set(averageFee);

    // Return metrics in Prometheus format
    res.set("Content-Type", register.contentType);
    res.end(await register.metrics());
    console.log(await register.metrics())
    console.log("Metrics sent to Prometheus");
  } catch (error) {
    console.error("Error querying deposits:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Connect to MongoDB and start the server
const startServer = async () => {
  try {
    app.listen(3005, () => {
      console.log(`Server is running on http://localhost:3005`);
    });
  } catch (error) {
    console.error("Error starting server:", error);
  }
};

startServer();
