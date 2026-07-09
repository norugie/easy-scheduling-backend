import { AppError } from "./api-response.js";

export async function runDatabaseOperation<T>(operation: () => Promise<T>) {
  try {
    return await operation();
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(
      500,
      "DATABASE_OPERATION_FAILED",
      "The database operation failed.",
    );
  }
}
