import { Client } from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';
import logger from '../util/log'
export class WhatsAppClient{
    
    constructor(){
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
        
        client.on('message', async (msg) => this.processMessage);
        
        client.initialize();    
    }
    
    processMessage(msg: string) {
        
    }
    
}