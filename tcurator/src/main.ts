import { setupConstraints } from "./neo4j";
import { sentry } from "./sentry";
import "./data/relations";
import { setupRmq } from "./rmq";


async function main() {
    try {
        await setupConstraints()
        await setupRmq()
    } catch (e) {
        sentry.captureException(e)
    }
}

main()
