import WAWebJS, { Client } from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';
import logger from '../util/log'
import sqlite3 from 'sqlite3'
import { open } from 'sqlite'
import config from '../util/config'

export class WhatsAppClient {
    db: any;
    client: Client;
    isRunning: boolean;
    isLLMRunning: boolean;

    constructor() {
        this.isRunning = false;
        this.isLLMRunning = false;
        this.initializeDB();
        this.client = new Client({
            puppeteer: {
                args: ['--no-sandbox'],
            }
        });
        this.client.on('qr', (qr) => {
            // Generate and scan this code with your phone
            qrcode.generate(qr, { small: true });
            logger.info('QR received', qr);
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
                    msg.reply('WIP');
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

    async initializeDB(){
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