const TelegramBot = require('node-telegram-bot-api')
const dateFormat = require('dateformat') 

const token = 'API_TOKEN'

const bot = new TelegramBot(token, {polling:true})


class Logger {
    
    getTimeString() {
        return dateFormat(new Date(), "[yyyy-mm-dd h:MM:ss]")
    }

    info(text) {
        text.split("\n").forEach(string => console.log(this.getTimeString() + ": " + string));
    }

}

const logger = new Logger()

class MessageCheker {

    constructor(msg) {
        this.msg = msg
    }

    isHaveCaption() {
        return this.msg.caption
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
        
        let caption = mcheker.isHaveCaption()

        if (caption) {
            logger.info("removing caption: " + caption)
        }

        let viaBot = mcheker.isSentViaBot()

        if (viaBot) {
            logger.info("removing bot refernce: " + msg.via_bot.username)
        }

        if (caption || viaBot) {
            return this.resendAudio(msg)
        }

	logger.info("it's clear audio, nothing to do")

    }

}

let acleaner = new AudioCleaner()

bot.on("channel_post", acleaner.handleMessage.bind(acleaner))

logger.info("started")
