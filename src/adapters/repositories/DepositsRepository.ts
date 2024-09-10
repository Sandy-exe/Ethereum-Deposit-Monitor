import { Deposit } from "core/domain/deposit";
import { IDepositsRepository } from "core/types.repositories";
import { GetDepositsProps } from "core/types.services";
import { Model } from "mongoose";

export class DepositsRepository implements IDepositsRepository {
  private depositsModel: Model<Deposit>;

  // Constructor for the DepositsRepository class
  // Initializes with a Mongoose model for deposits
  constructor(depositsModel: Model<Deposit>) {
    this.depositsModel = depositsModel;
  }

  // Method to store a new deposit in the database
  public async storeDeposit(deposit: Deposit): Promise<void> {
    try {
      // Create a new deposit document
      const newDeposit = new this.depositsModel({
        id: deposit.hash, // Set unique identifier based on deposit hash
        ...deposit, // Spread other deposit properties
      });
      // Save the new deposit to the database
      await newDeposit.save();
    } catch (error: any) {
      // Handle errors that occur during saving

      // Check if the error is due to a duplicate key (hash already exists)
      if (error.code === 11000) {
        // Log a warning for duplicate key error
        console.warn("Deposit with this hash already exists:", deposit.hash);
        return;
      }

      // For other errors, log the error and rethrow it
      console.error("Error storing deposit:", error);
      throw error;
    }
  }

  // Method to get the latest stored block number
  public async getLatestStoredBlock(): Promise<number | null> {
    // Query the database for the most recent deposit based on blockNumber
    const tx = await this.depositsModel
      .findOne()
      .sort({ blockNumber: -1 }) // Sort by blockNumber in descending order
      .limit(1) // Limit the result to one document
      .exec();

    // Return the block number of the latest deposit, or null if no deposits are found
    return tx ? tx.blockNumber : null;
  }

  // Method to get deposits based on specified parameters
  public async getDeposits(props: GetDepositsProps): Promise<Deposit[]> {
    console.log("Fetching deposits for this:", props);

    // Log the query parameters used for fetching deposits
    console.log("Querying with:", {
      blockchain: props.blockchain,
      network: props.network,
      token: props.token,
      blockTimestamp: props.blockTimestamp !== undefined
        ? { $gte: props.blockTimestamp } // Use $gte (greater than or equal) if blockTimestamp is defined
        : undefined
    });

    // Log the final query parameters for debugging
    console.log("Deposits model:", { $gte: props.blockTimestamp });
    console.log("Deposits model:", props.blockTimestamp !== undefined
      ? { $gte: props.blockTimestamp }
      : undefined);
    
    try {
      // Fetch deposits from the database based on provided parameters
      const deposits = await this.depositsModel
        .find({
          blockchain: props.blockchain,
          network: props.network,
          token: props.token,
          blockTimestamp: props.blockTimestamp !== undefined
            ? { $gte: props.blockTimestamp } // Query deposits with blockTimestamp greater than or equal to provided value
            : undefined,
        })
        .exec();
      
      // Log the deposits found for debugging
      console.log("Deposits found:", deposits);

      // Return the array of deposits
      return deposits;
    } catch (error) {
      // Log any errors that occur during the query
      console.error("Error fetching deposits:", error);
      // Return an empty array in case of an error
      return [];
    }
  }
}
