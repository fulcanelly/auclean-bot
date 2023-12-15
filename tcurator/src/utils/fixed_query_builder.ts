import { Transaction } from "neo4j-driver";
import { BindParam, QueryBuilder, QueryRunner } from "neogma";


// NEED it since nextjs seems to start everything in separate proccess
export class FixedQueryBuilder extends QueryBuilder {
    __relations : Promise<any>

    constructor(params?: BindParam) {
        super(params);
        this.__relations = import('@/models/__relations');
    }

    async run(a: QueryRunner | Transaction) {
        await this.__relations
        return await super.run(a)
    }
}

