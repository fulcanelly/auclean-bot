import * as Sentry from '@sentry/node';


Sentry.init({
    environment: process.env.ENV,
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 1.0,
})

export async function processTransaction(customQuery: string) {
    const transaction = Sentry.startTransaction({
      op: "transaction",
      name: "CHYPER",
    });

    // Example of custom transaction data
    const transactionData = {
      query: customQuery,
      // Simulate a duration or obtain it from your transaction logic
      duration: 1000, // Duration in milliseconds
    };

    // This is where you'd actually process your custom language transaction
    // ...

    if (false) { //isTransactionSlow(transactionData.duration, 5000)) { // 5000 ms threshold
      Sentry.captureMessage(`Slow transaction detected: ${JSON.stringify(transactionData)}`, "warning");
      transaction.setStatus("failure"); // Mark the transaction as a failure
    } else {
      transaction.setStatus("ok");
    }
    
    transaction.finish(); // Finish the transaction
  }


export const sentry = Sentry

