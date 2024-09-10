import express, { Request, Response } from "express";
import { MongoClient } from "mongodb";
import { getDepositsFetcherService } from "./context";
import { Registry, Counter, Gauge } from "prom-client";

const MONGO_URI = "mongodb+srv://Denji:Santhosh@cluster0.agbc7.mongodb.net/deposits?retryWrites=true&w=majority";

// Initialize Express app
const app = express();

// Create a Registry
const register = new Registry();

// Define metrics
const depositsTotal = new Counter({
  name: "crypto_deposits_total",
  help: "Total number of crypto deposits",
  labelNames: ["blockchain", "network", "token"],
  registers: [register],
});

const latestBlockNumber = new Gauge({
  name: "crypto_deposits_latest_block",
  help: "Latest block number processed",
  labelNames: ["blockchain", "network"],
  registers: [register],
});

const latestBlockTimestamp = new Gauge({
  name: "crypto_deposits_latest_timestamp",
  help: "Timestamp of the latest processed block",
  labelNames: ["blockchain", "network"],
  registers: [register],
});

// Middleware to parse JSON
app.use(express.json());

// Connect to MongoDB
let client: MongoClient;

const connectToMongoDB = async () => {
  if (!client) {
    client = new MongoClient(MONGO_URI);
    await client.connect();
    console.log("Connected to MongoDB");
  }
  return client.db('test');
};


// Define the metrics endpoint
app.get("/prometheus", async (req: Request, res: Response) => {
  console.log("Received request for /prometheus");
  const { blockchain, network, token } = req.query;

  // Current timestamp - 5 minutes, converted to seconds
  const fiveMinutesAgo = Math.floor((Date.now() - 5 * 60 * 1000) / 1000);

  // Check if all required parameters are present
  if (!blockchain || !network || !token) {
    return res.status(400).send("Missing required parameters");
  }

  try {
    const depositsFetcherService = await getDepositsFetcherService();

    // Query the database for deposits matching the parameters
    // const deposits = await depositsFetcherService.getDeposits({
    //   blockchain: blockchain as string,
    //   network: network as string,
    //   token: token as string,
    //   blockTimestamp: fiveMinutesAgo,
    // });
    // console.log("Deposits fetched:", deposits);
    // // Update metrics
    // deposits.forEach((deposit) => {
    //   console.log(`Processing deposit: ${JSON.stringify(deposit)}`);
    //   depositsTotal
    //     .labels(deposit.blockchain, deposit.network, deposit.token)
    //     .inc();
    //   latestBlockNumber
    //     .labels(deposit.blockchain, deposit.network)
    //     .set(deposit.blockNumber);
    //   latestBlockTimestamp
    //     .labels(deposit.blockchain, deposit.network)
    //     .set(deposit.blockTimestamp);
    // });

    // const mockDeposits = [
    //   {
    //     blockchain: "ethereum",
    //     network: "mainnet",
    //     token: "ETH",
    //     blockNumber: 20714986,
    //     blockTimestamp: 1725908219
    //   }
    // ];
    
    // mockDeposits.forEach((deposit) => {
    //   depositsTotal
    //     .labels(deposit.blockchain, deposit.network, deposit.token)
    //     .inc();
    //   latestBlockNumber
    //     .labels(deposit.blockchain, deposit.network)
    //     .set(deposit.blockNumber);
    //   latestBlockTimestamp
    //     .labels(deposit.blockchain, deposit.network)
    //     .set(deposit.blockTimestamp);
    // });
    
    
    const db = await connectToMongoDB();
    const collection = db.collection('deposits');

    
    
    // Query the database for deposits matching the parameters
    const deposits = await collection.find({
      blockchain: blockchain as string,
      network: network as string,
      token: token as string,
    }).toArray();

    console.log(`Querying deposits with parameters:`, {
      blockchain: blockchain as string,
      network: network as string,
      token: token as string,
      blockTimestamp: { $gte: fiveMinutesAgo },
    });
    collection.find({}).limit(5).toArray();
    console.log("Deposits fetched:", deposits);



    // Update metrics
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
    });

    // Return the metrics in Prometheus format
    res.set("Content-Type", register.contentType);
    console.log("Metrics register content type:", register.contentType);
    res.end(await register.metrics());
    console.log("Metrics sent to Prometheus");
  } catch (error) {
    console.error("Error querying deposits:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Add the test data fetching route
app.get("/test-data", async (req: Request, res: Response) => {
  const { blockchain, network, token } = req.query;
  if (!blockchain || !network || !token) {
    return res.status(400).send("Missing required parameters");
  }

  try {
    const depositsFetcherService = await getDepositsFetcherService();
    const deposits = await depositsFetcherService.getDeposits({
      blockchain: blockchain as string,
      network: network as string,
      token: token as string,
      blockTimestamp: Math.floor((Date.now() - 5 * 60 * 1000) / 1000),
    });

    res.json(deposits);
  } catch (error) {
    console.error("Error fetching data:", error);
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