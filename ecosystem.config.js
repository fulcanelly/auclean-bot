module.exports = {
    apps: [
        // {
        //     name: "site",
        //     script: "cd tcurator && yarn next dev",
        //     env: {
        //         NODE_ENV: "development",
        //     },
        //     env_production: {
        //         NODE_ENV: "production",
        //     }
        // },
        {
            name: 'worker',
            script: 'cd tcurator && ts-node -r tsconfig-paths/register src/main.ts'
        },
        {
            name: 'bot',
            script: 'cd tbot && dotenv node src/main.js'
        },
        {
            name: 'python',
            script: 'cd python && dotenv nodemon --exec .venv/bin/python3 src/main.py'
        }
    ]
}
