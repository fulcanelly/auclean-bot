import { Neogma } from "neogma";

import * as dotenv from 'dotenv';
import { neogen } from "neogen";


function neogmaConfig() {
    const parsed = dotenv.config()?.parsed

    if (process.env.NEO4J_HOST) {
        const conn = {
            url: 'bolt://' + process.env.NEO4J_HOST,
            username: process.env.NEO4J_USERNAME as string,
            password: process.env.NEO4J_PASSWORD as string,
        }
        console.log(conn)
        return conn
    } else {
        throw new Error('neo4j db not configured')
    }
}

export const neogma = new Neogma(
    neogmaConfig(),
    {
        logger: console.log,
    },
);

neogen.setInstance(neogma)

export async function setupConstraints() {
    let constraints = await neogma.queryRunner.run("SHOW CONSTRAINTS")

    if (!constraints.records.find(record => record.get('name') == 'uniq_user_id')) {
        await neogma.queryRunner.run( "CREATE CONSTRAINT uniq_user_id FOR (u:User) REQUIRE u.user_id IS UNIQUE")
    }

}

export async function setupIndexes() {

    const queries = [
        'CREATE TEXT INDEX online_log_uuid_index IF NOT EXISTS FOR (n:OnlineLog) ON (n.uuid)',
        'CREATE TEXT INDEX user_id_index IF NOT EXISTS FOR (n:User) ON (n.user_id)'
    ]

    for await (const query of queries) {
        await neogma.queryRunner.run(query)
    }
}
