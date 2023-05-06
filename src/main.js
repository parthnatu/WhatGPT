"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const whatsapp_web_js_1 = require("whatsapp-web.js");
const qrcode_terminal_1 = __importDefault(require("qrcode-terminal"));
const client = new whatsapp_web_js_1.Client({
    puppeteer: {
        args: ['--no-sandbox'],
    }
});
client.on('qr', (qr) => {
    // Generate and scan this code with your phone
    qrcode_terminal_1.default.generate(qr, { small: true });
    console.log('QR RECEIVED', qr);
});
client.on('ready', () => {
    console.log('Client is ready!');
});
client.initialize();
