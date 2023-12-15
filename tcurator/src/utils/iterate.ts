import { QueryBuilder } from "neogma"
import { neogma } from "../neo4j"

export async function *iterateQueryBuilder(qb: () => QueryBuilder, step = 10) {
    for (let i = 0;;i++) {
        const result = await qb()
            .skip(step * i)
            .limit(step)
            .run(neogma.queryRunner)

        if (!result.records.length) {
            return
        }

        yield result
    }
}
