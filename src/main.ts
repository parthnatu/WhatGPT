import { Client } from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';
import pino from 'pino';

const logger = pino({ timestamp: pino.stdTimeFunctions.isoTime })

logger.info('hello world')

const client = new Client({
    puppeteer: {
        args: ['--no-sandbox'],
    }
});

client.on('qr', (qr) => {
    // Generate and scan this code with your phone
    qrcode.generate(qr, { small: true });
    logger.info('QR RECEIVED', qr);
});

client.on('ready', () => {
    logger.info('Client is ready!');
});

client.initialize();
