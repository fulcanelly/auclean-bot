import { sentry } from "../sentry";

export async function timeout(timeMs: number) {
	return new Promise(resolve => setTimeout(resolve, timeMs));
}

export async function retry<T>(func: () => Promise<T>, times: number) {
	let lastError: any;

	for (let i = 0; i < times; i++) {
		try {
			return await func();  // Attempt to execute the function
		} catch (error) {
			lastError = error;
			console.error(error)
			console.log("retrying")
			await timeout(1000) // Store the error in case we need to throw it later
			// Optionally wait for a bit here before retrying
		}
	}

	if (lastError?.data?.errors) {
		sentry.captureMessage(lastError?.data?.errors)
	}

	console.error(lastError)
	sentry.captureException(lastError)  // Throw the last error after all retries have failed
}
