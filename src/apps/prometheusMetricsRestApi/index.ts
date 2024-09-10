// import express, { Request, Response } from "express";
// import { MongoClient } from "mongodb";
// import { getDepositsFetcherService } from "./context";
// import { Registry, Counter, Gauge } from "prom-client";

// const MONGO_URI = "mongodb+srv://Denji:Santhosh@cluster0.agbc7.mongodb.net/deposits?retryWrites=true&w=majority";

// // Initialize Express app
// const app = express();

// // Create a Registry
// const register = new Registry();

// // Define metrics
// const depositsTotal = new Counter({
//   name: "crypto_deposits_total",
//   help: "Total number of crypto deposits",
//   labelNames: ["blockchain", "network", "token"],
//   registers: [register],
// });

// const latestBlockNumber = new Gauge({
//   name: "crypto_deposits_latest_block",
//   help: "Latest block number processed",
//   labelNames: ["blockchain", "network"],
//   registers: [register],
// });

// const latestBlockTimestamp = new Gauge({
//   name: "crypto_deposits_latest_timestamp",
//   help: "Timestamp of the latest processed block",
//   labelNames: ["blockchain", "network"],
//   registers: [register],
// });

// // Middleware to parse JSON
// app.use(express.json());

// // Connect to MongoDB
// let client: MongoClient;

// const connectToMongoDB = async () => {
//   if (!client) {
//     client = new MongoClient(MONGO_URI);
//     await client.connect();
//     console.log("Connected to MongoDB");
//   }
//   return client.db('test');
// };


// // Define the metrics endpoint
// app.get("/prometheus", async (req: Request, res: Response) => {
//   console.log("Received request for /prometheus");
//   const { blockchain, network, token } = req.query;

//   // Current timestamp - 5 minutes, converted to seconds
//   const fiveMinutesAgo = Math.floor((Date.now() - 5 * 60 * 1000) / 1000);

//   // Check if all required parameters are present
//   if (!blockchain || !network || !token) {
//     return res.status(400).send("Missing required parameters");
//   }

//   try {
//     const depositsFetcherService = await getDepositsFetcherService();

//     // Query the database for deposits matching the parameters
//     // const deposits = await depositsFetcherService.getDeposits({
//     //   blockchain: blockchain as string,
//     //   network: network as string,
//     //   token: token as string,
//     //   blockTimestamp: fiveMinutesAgo,
//     // });
//     // console.log("Deposits fetched:", deposits);
//     // // Update metrics
//     // deposits.forEach((deposit) => {
//     //   console.log(`Processing deposit: ${JSON.stringify(deposit)}`);
//     //   depositsTotal
//     //     .labels(deposit.blockchain, deposit.network, deposit.token)
//     //     .inc();
//     //   latestBlockNumber
//     //     .labels(deposit.blockchain, deposit.network)
//     //     .set(deposit.blockNumber);
//     //   latestBlockTimestamp
//     //     .labels(deposit.blockchain, deposit.network)
//     //     .set(deposit.blockTimestamp);
//     // });

//     // const mockDeposits = [
//     //   {
//     //     blockchain: "ethereum",
//     //     network: "mainnet",
//     //     token: "ETH",
//     //     blockNumber: 20714986,
//     //     blockTimestamp: 1725908219
//     //   }
//     // ];
    
//     // mockDeposits.forEach((deposit) => {
//     //   depositsTotal
//     //     .labels(deposit.blockchain, deposit.network, deposit.token)
//     //     .inc();
//     //   latestBlockNumber
//     //     .labels(deposit.blockchain, deposit.network)
//     //     .set(deposit.blockNumber);
//     //   latestBlockTimestamp
//     //     .labels(deposit.blockchain, deposit.network)
//     //     .set(deposit.blockTimestamp);
//     // });
    
    
//     const db = await connectToMongoDB();
//     const collection = db.collection('deposits');

    
    
//     // Query the database for deposits matching the parameters
//     const deposits = await collection.find({
//       blockchain: blockchain as string,
//       network: network as string,
//       token: token as string,
//     }).toArray();

//     console.log(`Querying deposits with parameters:`, {
//       blockchain: blockchain as string,
//       network: network as string,
//       token: token as string,
//       blockTimestamp: { $gte: fiveMinutesAgo },
//     });
//     collection.find({}).limit(5).toArray();
//     console.log("Deposits fetched:", deposits);



//     // Update metrics
//     deposits.forEach((deposit) => {
//       depositsTotal
//         .labels(deposit.blockchain, deposit.network, deposit.token)
//         .inc();
//       latestBlockNumber
//         .labels(deposit.blockchain, deposit.network)
//         .set(deposit.blockNumber);
//       latestBlockTimestamp
//         .labels(deposit.blockchain, deposit.network)
//         .set(deposit.blockTimestamp);
//     });

//     // Return the metrics in Prometheus format
//     res.set("Content-Type", register.contentType);
//     console.log("Metrics register content type:", register.contentType);
//     res.end(await register.metrics());
//     console.log("Metrics sent to Prometheus");
//   } catch (error) {
//     console.error("Error querying deposits:", error);
//     res.status(500).send("Internal Server Error");
//   }
// });

// // Add the test data fetching route
// app.get("/test-data", async (req: Request, res: Response) => {
//   const { blockchain, network, token } = req.query;
//   if (!blockchain || !network || !token) {
//     return res.status(400).send("Missing required parameters");
//   }

//   try {
//     const depositsFetcherService = await getDepositsFetcherService();
//     const deposits = await depositsFetcherService.getDeposits({
//       blockchain: blockchain as string,
//       network: network as string,
//       token: token as string,
//       blockTimestamp: Math.floor((Date.now() - 5 * 60 * 1000) / 1000),
//     });

//     res.json(deposits);
//   } catch (error) {
//     console.error("Error fetching data:", error);
//     res.status(500).send("Internal Server Error");
//   }
// });

// // Connect to MongoDB and start the server
// const startServer = async () => {
//   try {
//     app.listen(3005, () => {
//       console.log(`Server is running on http://localhost:3005`);
//     });
//   } catch (error) {
//     console.error("Error starting server:", error);
//   }
// };

// startServer();


import express, { Request, Response } from "express";
import { getDepositsFetcherService } from "./context";
import { Registry, Counter, Gauge, Summary } from "prom-client";

// Initialize Express app
const app = express();

// Create a Registry
const register = new Registry();

// Define metrics
const depositsTotalAmount = new Counter({
  name: "crypto_deposits_total_amount",
  help: "Total amount of crypto deposits",
  labelNames: ["blockchain", "network", "token"],
  registers: [register],
});

const depositsCount = new Counter({
  name: "crypto_deposits_count",
  help: "Number of crypto deposits",
  labelNames: ["blockchain", "network", "token"],
  registers: [register],
});

const depositAmountSummary = new Summary({
  name: "crypto_deposits_amount_summary",
  help: "Summary of deposit amounts",
  labelNames: ["blockchain", "network", "token"],
  registers: [register],
});

const individualDepositDetails = new Gauge({
  name: "crypto_deposits_individual_details",
  help: "Details of individual crypto deposits",
  labelNames: ["blockchain", "network", "token", "hash"],
  registers: [register],
});

const averageDepositAmount = new Gauge({
  name: "crypto_deposits_average_amount",
  help: "Average amount of crypto deposits",
  labelNames: ["blockchain", "network", "token"],
  registers: [register],
});



// Middleware to parse JSON
app.use(express.json());

// Define the metrics endpoint
app.get("/prometheus", async (req: Request, res: Response) => {
  const { blockchain, network, token } = req.query;

  // Current timestamp - 24 hours, converted to seconds 
  const twoHoursAgo = Math.floor((Date.now() - 24 * 60 * 60 * 1000) / 1000);

  if (!blockchain || !network || !token) {
    return res.status(400).send("Missing required parameters");
  }

  try {
    const depositsFetcherService = await getDepositsFetcherService();
    const deposits = await depositsFetcherService.getDeposits({
      blockchain: blockchain as string,
      network: network as string,
      token: token as string,
      blockTimestamp: twoHoursAgo,
    });

    let totalFee = 0;
    let count = 0;

    deposits.forEach((deposit) => {
      const fee: number = typeof deposit.fee === 'bigint'
        ? Number(deposit.fee) // Convert bigint to number
        : deposit.fee || 0;   // Use 0 if deposit.fee is null or undefined

      depositsTotalAmount
        .labels(deposit.blockchain, deposit.network, deposit.token)
        .inc(fee); // Increment total amount

      depositsCount
        .labels(deposit.blockchain, deposit.network, deposit.token)
        .inc(); // Increment count

      depositAmountSummary
        .labels(deposit.blockchain, deposit.network, deposit.token)
        .observe(fee); // Observe the fee for summary metrics

      individualDepositDetails
        .labels(deposit.blockchain, deposit.network, deposit.token, deposit.hash || 'unknown')
        .set(fee); // Set individual deposit details (if needed)

      totalFee += fee;
      count += 1;
    });

    const averageFee = count > 0 ? totalFee / count : 0;
    averageDepositAmount
      .labels('all', 'all', 'all') // Adjust labels as needed
      .set(averageFee); // Set the average deposit amount

    console.log(averageDepositAmount);
    console.log(depositAmountSummary);
    
    console.log(depositsCount);
    
    console.log(depositsTotalAmount);
    
    

    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());

  } catch (error) {
    console.error("Error fetching deposits:", error);
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