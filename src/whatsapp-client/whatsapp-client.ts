import WAWebJS, { Client } from 'whatsapp-web.js';
import logger from '../util/log'
import sqlite3 from 'sqlite3'
import { open } from 'sqlite'
import config from '../util/config'
import { ChatGPT } from '../backend/chatgpt/chat-gpt'
import { Backend } from '../backend/backend';

export class WhatsAppClient {
    db: any;
    client: Client;
    isRunning: boolean;
    isLLMRunning: boolean;
    backend?: Backend;

    constructor() {
        this.isRunning = false;
        this.isLLMRunning = false;
        this.initializeDB();
        if (config.chatgpt.enabled) {
            this.backend = new ChatGPT(config.chatgpt.openaiOrganizationID,
                config.chatgpt.chatgptBearerToken,
                config.chatgpt.requestURL,
                config.chatgpt.messageTemplate);
        }
        this.client = new Client({
            puppeteer: {
                args: ['--no-sandbox'],
            }
        });
        this.client.on('qr', (qr) => {
            logger.info('QR received ' + qr);
        });

        this.client.on('ready', () => {
            logger.info('Client is ready!');
        });

        this.client.on('message', async (msg) => this.processMessage(msg));

        this.client.initialize();
    }

    async processMessage(msg: WAWebJS.Message) {
        logger.debug("Message Received: " + msg.body);
        let isRunningSql = 'SELECT value FROM Configuration WHERE var_name = ?';
        let LLMRunningSql = 'SELECT value FROM Configuration WHERE var_name = ?';
        const isRunningResult = await this.db.get(isRunningSql, ['IS_RUNNING']);
        const isLLMRunningResult = await this.db.get(LLMRunningSql, ['IS_LLM_RUNNING']);
        this.isRunning = isRunningResult.value === 'YES';
        this.isLLMRunning = isLLMRunningResult.value === 'YES';
        if (this.isRunning) {
            if (await this.isMentioned(msg)) {
                if (this.isLLMRunning) {
                    msg.reply('Working on it...');
                    if (this.backend) {
                        try {
                            const llmResponse = await this.backend.processMessageAsPrompt(msg.body.replace('@' + config.whatsapp.selfId, ''));
                            msg.reply(llmResponse);
                        } catch (error) {
                            logger.error(error);
                            msg.reply('Oops! Something went wrong.');
                        }

                    }
                    else
                        msg.reply('LLM error');
                }
                else {
                    msg.reply('No LLMs running. Please wait till I am hooked up to an AI model.')
                }
            }
        }
    }

    async isMentioned(msg: WAWebJS.Message) {
        const mentions = await msg.getMentions();
        for (let contact of mentions) {
            if (contact.id.user == config.whatsapp.selfId.toString())
                return true;
        }
        return false;
    }

    async initializeDB() {
        // open the database
        this.db = await open({
            filename: 'db.sqlite',
            driver: sqlite3.Database
        })
        this.db.exec('CREATE TABLE IF NOT EXISTS Configuration (var_name VARCHAR(1000) UNIQUE,  value VARCHAR(1000));');
        this.db.exec('INSERT OR REPLACE INTO Configuration (var_name, value) VALUES (\'IS_RUNNING\',\'' + (config.isRunning ? 'YES' : 'NO') + '\');');
        this.db.exec('INSERT OR REPLACE INTO Configuration (var_name, value) VALUES (\'IS_LLM_RUNNING\',\''
            + ((config.chatgpt.enabled || config.customGGML.enabled) ? 'YES' : 'NO') +
            '\');');
    }

}