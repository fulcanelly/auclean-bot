const TelegramBot = require('node-telegram-bot-api')
const dateFormat = require('dateformat')
const amqplib = require('amqplib')

const token = process.env.TG_BOT_API_TOKEN

const bot = new TelegramBot(token, { polling: true })


class Logger {

    getTimeString() {
        return dateFormat(new Date(), "[yyyy-mm-dd h:MM:ss]")
    }

    info(text) {
        text.split("\n").forEach(string => console.log(`${this.getTimeString()}: ${string}`));
    }

}

const logger = new Logger()

class MessageCheker {

    constructor(msg) {
        this.msg = msg
    }

    isLinkInCaption() {
        return this.msg.caption_entities &&
            this.msg.caption_entities.some(obj => obj.type === 'text_link')
    }

    isSentViaBot() {
        return this.msg.via_bot
    }

}

class AudioCleaner {


    async resendAudio(msg) {
        logger.info("resending audio: " + msg.audio.title + ":" + msg.audio.performer)
        await bot.deleteMessage(msg.chat.id, msg.message_id)
            .catch(console.log)
        await bot.sendAudio(msg.chat.id, msg.audio.file_id)

    }

    handleMessage(msg) {
        logger.info("\n" + "got message in '" + msg.chat.title + "' from  " + msg.author_signature)

        if (!msg.audio) {
            return logger.info("it's not audio - skiping")
        }

        let mcheker = new MessageCheker(msg)
        console.debug(msg)

        let linkInCaption = mcheker.isLinkInCaption()

        if (linkInCaption) {
            logger.info("removing caption: " + msg.caption)
        }

        let viaBot = mcheker.isSentViaBot()

        if (viaBot) {
            logger.info("removing bot refernce: " + msg.via_bot.username)
        }

        if (linkInCaption || viaBot) {
            return this.resendAudio(msg)
        }

        logger.info("it's clear audio, nothing to do")

    }

}

function waitForText(user_id, match = msg => true) {
    return new Promise((res, rej) => {
        const callback = (msg) => {

            if (msg.from.id != user_id) {
                return
            }

            bot.removeListener('text', callback)
            clearTimeout(timeout)
            res(msg.text)
        }

        bot.on('text', callback)

        const timeout = setTimeout(async () => {
            await bot.sendMessage(user_id, 'Bie bie')

            console.log('remove callback')
            bot.removeListener('text', callback)
            rej('ended')
        }, 60_000)

    })
}


async function main() {
    console.log("connecting to rmq")
    const connection = await amqplib.connect({
        hostname: process.env.RMQ_HOST,
        username: process.env.RMQ_USERNAME,
        password: process.env.RMQ_PASSWORD,
    })

    console.log("setting up bot")

    let acleaner = new AudioCleaner()

    bot.on("channel_post", acleaner.handleMessage.bind(acleaner))
    bot.on("message", acleaner.handleMessage.bind(acleaner))

    const channel = await connection.createConfirmChannel()

    await channel.assertQueue('tg:login', { durable: true })
    await channel.assertQueue('tg:login:answer',  { durable: true })


    channel.consume('tg:login:answer', async (msg) => {

        const data = JSON.parse(msg.content.toString())


        const user_id = data.user_id
        try {
            if (data.request_password) {
                await bot.sendMessage(user_id, 'Enter 2 auth password:')
                const password = await waitForText(user_id)
                channel.sendToQueue('tg:login', Buffer.from(
                    JSON.stringify({
                        type: 'pass_password',
                        user_id, password
                    })
                ))
            }

            if (data.request_code) {
                console.log('request_code')
                await bot.sendMessage(user_id, 'Enter login code(separate by space some of numbers):')

                const code = await waitForText(user_id)

                channel.sendToQueue('tg:login', Buffer.from(
                    JSON.stringify({
                        type: 'pass_code',
                        user_id, code
                    })
                ))
            }

            if (data.wrong_number) {
                bot.sendMessage(user_id, 'You loh, (wrong number)')
            }

            if (data.request_number) {
                console.log('request_number')

                await bot.sendMessage(user_id, 'Enter your phone:')

                const phone = await waitForText(user_id)

                channel.sendToQueue('tg:login', Buffer.from(
                    JSON.stringify({
                        type: 'pass_phone',
                        user_id, phone
                    })
                ))
            }
        } catch(e) {
            bot.sendMessage(user_id, 'something went wrong')
        }

        channel.ack(msg)
    })

    bot.on('text', async (msg) => {
        if (msg.text == '/login' && msg.chat.type == 'private') {
            channel.sendToQueue('tg:login', Buffer.from(
                JSON.stringify({
                    type: 'login_init',
                    user_id: msg.from.id,
                    linked_to: null,
                })
            ))
        }
    })

    logger.info("started")

}

main()
