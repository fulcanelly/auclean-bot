
export async function timeout(timeMs: number) {
	return new Promise(resolve => setTimeout(resolve, timeMs));
}
