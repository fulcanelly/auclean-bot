import { setupConstraints, setupIndexes } from "./neo4j";
import { sentry } from "./sentry";
import "./models/__relations"
import { setupRmq } from "./rmq";
import { setupScheduledJobs } from "./jobs";
import { setupNextJs } from "./next";


async function main() {
    try {
        console.log('main')
        await setupConstraints()
        console.log('cstr')

        await setupIndexes()
        console.log('indexes')

        const rmq = await setupRmq()
        console.log('rmq')

        await setupScheduledJobs(rmq)
        console.log('jobs')

        await setupNextJs()

    } catch (e) {
        sentry.captureException(e)
    }
}

main()
