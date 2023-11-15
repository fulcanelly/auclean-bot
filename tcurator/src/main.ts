import { setupConstraints, setupIndexes } from "./neo4j";
import { sentry } from "./sentry";
import "./models/__relations"
import { setupRmq } from "./rmq";


async function main() {
    try {
        console.log('main')
        await setupConstraints()
        console.log('cstr')

        await setupIndexes()
        console.log('indexes')

        await setupRmq()
        console.log('rmq')

    } catch (e) {
        sentry.captureException(e)
    }
}

main()
