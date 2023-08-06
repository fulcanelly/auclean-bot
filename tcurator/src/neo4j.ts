import { Neogma } from "neogma";

export const neogma = new Neogma(
    {
        url: 'bolt://' + process.env.NEO4J_HOST,
        username: process.env.NEO4J_USERNAME as string,
        password: process.env.NEO4J_PASSWORD as string,
    },
    {
        logger: console.log,
    },
);

