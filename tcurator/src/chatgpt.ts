import { neogma, setupConstraints, setupIndexes } from "./neo4j";
import { sentry } from "./sentry";
import { setupRmq } from "./rmq";
import { setupScheduledJobs } from "./jobs";
import { setupNextJs } from "./next";
import './neo4j'

import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';

import { OpenAI } from 'openai'
import { ChatgptDialogue, ChatgptDialogueProps } from "./models/chatgpt_dialogue";
import path from 'path';
import readline from 'readline';
import { BindParam, QueryBuilder, QueryRunner } from "neogma";
import { recordToObject } from "./utils/record_to_object";
import { Integer } from "neo4j-driver";
import fs from 'fs/promises';

const apiKey = ''

const argv = yargs(hideBin(process.argv))
  .usage('Usage: $0 [options]')
  .help('help')
  .alias('help', 'h')
  .option('value', {
    alias: 'v',
    describe: 'Set the value',
    type: 'number',
  })
  .argv;

console.log(argv)


const currentLocation = path.resolve('.');
//DONT ALLOWED TO GO DEEPER
const root = argv['root']

console.log(root)

// Function to read a file's contents and convert it to an array of messages

async function listFiles(dir, recursive = false) {
  let fileList: { path: string, type: 'd' | 'f' }[] = [];
  console.log({
    listFiles: dir
  })
  try {
    const files = await fs.readdir(dir, { withFileTypes: true });

    for (const file of files) {
      const filePath = path.join(dir, file.name);

      if (file.isDirectory()) {
        fileList.push({
          path: filePath,
          type: 'd'
        })
        if (recursive) {
          fileList.push(...await listFiles(filePath, recursive));
        }
      } else if (file.isFile()) {
        // If it's a file, add it to the fileList
        fileList.push({
          path: filePath,
          type: 'f'
        });
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${dir}:`, error);
    throw error;
  }

  return fileList;
}


type message = OpenAI.Chat.Completions.ChatCompletionMessageParam


async function readFileToMessages(filePath, chunkSizeCharacters = 1023) {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const messages: message[] = [];

    for (let start = 0; start < content.length; start += chunkSizeCharacters) {
      const chunk = content.slice(start, start + chunkSizeCharacters);
      messages.push({
        role: 'system', // You can decide the role based on your logic
        content: chunk,
      });
    }

    return messages;
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    throw error;
  }
}

async function initSession(): Promise<message[]> {
  return [
    { role: 'system', content: 'you are welcome, here is what you can do, deduce it from this code: ' },
    ...await readFileToMessages(__filename),
    { role: 'system', content: JSON.stringify({ root, currentLocation }) },
    { role: 'system', content: 'so you use commands like #READ <path> #LIST <path or none> and nothing to return prompt to me(user), read files of project, dont read binary ones'},
    { role: 'system', content: 'explanation: I cant use commands, this commands is for you, you can use them by starting message with them, by my request, so my request is - list all files, find important ones and explore project'},
    { role: 'system', content: 'ALSO you can use command like #ASK,cto give prompt to user'}

  ]
}
//>this file is 0.1% of project, i want you to explore project by using commands

async function getLastSessionId(): Promise<number> {
  const it = await new QueryBuilder()
    .match({
      model: ChatgptDialogue,
      identifier: 'c'
    })
    .return('c.session_id as session_id')
    .orderBy('c.session_id DESC')
    .limit(1)
    .run(neogma.queryRunner)

  const result = it.records.map(recordToObject)[0]
  console.log(result)
  if (result) {
    return Integer.toNumber(result.session_id)
  } else {
    return 1
  }
}


async function loadSession(session_id: number): Promise<message[]> {
  const bindParam = new BindParam({
    session_id
  })
  const it = await new QueryBuilder(bindParam)
    .match({
      model: ChatgptDialogue,
      identifier: 'c'
    })
    .where('c.session_id = $session_id')
    .return('c')
    .orderBy('c.id ASC')
    .run(neogma.queryRunner)
  console.log("SSSS")
  //

  return QueryRunner.getResultProperties<ChatgptDialogueProps>(it, 'c').map( it => ({ role: it.role, content: it.text })) as message[];
}

// throw 1
async function persistElements(session_id: number, elements: message[]) {
  const result = elements.map(it => ChatgptDialogue.createOne(
    {
      id: Date.now(),
      session_id,
      text: it.content as string,
      role: it.role,
      date: Date.now()
    }
  ))
  await Promise.all(result)
}


// import say from 'say';

// Use default system voice to speak the text
// say.speak('Hello World. how are you feeling today? че дел пидар');

async function start() {
  let lastId = await getLastSessionId() ?? 0
  if (argv['start']) {
    lastId += 1
  }
  let messages = await loadSession(lastId)

  if (messages.length == 0) {
    messages.push(...await initSession())
  }

  console.log(messages)
  const ai = new OpenAI({
    apiKey
  })

  while (true) {
    let res: OpenAI.Chat.Completions.ChatCompletion | undefined

    if (messages.slice(-1)[0].role != 'assistant') {
      res = await ai.chat.completions.create({
        messages,
        model: 'gpt-3.5-turbo',
      })
      await persistElements(lastId, [res.choices[0].message])

      console.log(res)
      console.log(res.choices[0].message)
    }

    const answer = res?.choices[0].message.content as string ?? messages.slice(-1)[0].content as string

    const [cmd, ...rest] = answer.split(/\s/)


    if (cmd.startsWith('#READ')) {
      const file = await readFileToMessages(rest[0])
      messages.push(...file)
      await persistElements(lastId, file)

    } else if (cmd.startsWith("#LIST")) {
      const pathToList = rest[0] ?? currentLocation
      const result: message = {
        content: JSON.stringify(await listFiles(pathToList)),
        role: 'user'
      }
      messages.push(result)
      await persistElements(lastId, [result])
    } else if(cmd.startsWith('#ASK')) {
      const content = await readLineAsync()
      const msg: message = { role: 'user', content }
      messages.push(msg)
      await persistElements(lastId, [msg])
    } else {
      const msg: message = { role: 'user', content:
        'you can interact with me: uSE command #LIST (path | none | .),' +
        ' #READ path. or #ASK - to ask user about something, start message with that to execute command.' +
        ' if you see this message - there is not such command:' + cmd +
        '\n.you should start message only with that commands: #READ,#LIST, #ASK., just write #ASK' }

      messages.push(msg)
      await persistElements(lastId, [msg])
    }
  }
}


start()
// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to read a line from the console
function readLineAsync(prompt = '>'): Promise<string> {
  return new Promise((resolve) => {
    rl.question(prompt, (line) => {
      resolve(line);
    });
  });
}

// Usage

//IMPORTANT: i dont want you to explaint that code, i want you to use it, it interacts with me and a system try to use it: start message with #LIST path
//begining means writing nothing before command, but you did Apologies, dont waste my money on conversation, just use commands
