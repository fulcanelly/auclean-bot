
const { exec } = require('child_process');
const { extractUrls } = require('./utils');
const fs = require('fs');

const MAX_TIMEOUT = 10_000 //ms

function extractOutputFilePath(output) {
  const destinationPattern = /\[download\] Destination: (.+)/;
  const downloadedPattern = /\[download\] (.+) has already been downloaded/;

  const destinationMatch = destinationPattern.exec(output);
  const downloadedMatch = downloadedPattern.exec(output);

  if (destinationMatch) {
    return destinationMatch[1].trim();
  } else if (downloadedMatch) {
    return downloadedMatch[1].trim();
  }

  return undefined;
}

async function downloadVideo(url) {
  return new Promise((resolve, reject) => {
    const command = `yt-dlp ${url}`
    let cleaner = null

    const cmdProcess = exec(command, (error, stdout, stderr) => {
      const result = extractOutputFilePath(stdout)
      const currentPath = process.cwd()

      clearTimeout(cleaner)

      if (result) {
        return resolve(currentPath + '/' + result)
      }

      if (stderr) {
        return reject(stderr)
      }

      return reject(`something went wrong ${JSON.stringify({stderr, stdout, error})}`)
    })

    cleaner = setTimeout(() => {
      cmdProcess.kill()
      reject('timeout')
    }, MAX_TIMEOUT)
  })
}

async function convertToMp4(inputFile) {
  const outputFile = inputFile + '.mp4'
  return new Promise((resolve, reject) => {
    const command = `ffmpeg -i "${inputFile}" "${outputFile}"`;

    const cmdProcess = exec(command, (error, stdout, stderr) => {
      //TODO
      console.log({error, stdout, stderr})
      // if (error) {
      //   return reject(error);
      // }

      // if (stderr) {
      //   return reject(stderr);
      // }

      return resolve(outputFile);
    });
  });
}


async function handleUrlVideoMessage(bot, msg) {
  const urls = extractUrls(msg.text, msg.entities ?? [])
  console.log(`Got urls: ${JSON.stringify(urls)}`)

  try {
    for (const url of urls) {
      console.log("start loading")
      let outfile = await downloadVideo(url)
      console.log('start converting')
      let convertedFile = await convertToMp4(outfile)

      console.log(fs.readdirSync(process.cwd()))

      console.log(outfile)

      const fileBuffer = fs.readFileSync(convertedFile)

      console.log('sending file')
      await bot.sendVideo(msg.chat.id, fileBuffer, {
        reply_to_message_id: msg.message_id
      })

      console.log('deleting files')
      fs.unlinkSync(outfile)
      fs.unlinkSync(convertedFile)
    }
  } catch(e) {
    console.log(e)
  }
}


exports.extractOutputFilePath = extractOutputFilePath
exports.downloadVideo = downloadVideo
exports.handleUrlVideoMessage = handleUrlVideoMessage
