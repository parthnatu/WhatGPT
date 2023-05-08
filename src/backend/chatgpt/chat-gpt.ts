import logger from '../../util/log'
import { Backend } from '../backend';
import { Headers, RequestInit } from 'node-fetch';
import fetch from 'node-fetch';

export class ChatGPT extends Backend{
    requestUrl: string;
    requestHeaders?: Headers;

    constructor(organizationId: string, bearerToken: string, requestUrl: string, messageTemplate: any) {
        logger.info("Starting ChatGPT backend");
        logger.info("Template: "+ JSON.stringify(messageTemplate));
        super(messageTemplate);
        this.requestUrl = requestUrl;
        this.requestHeaders = new Headers();
        this.requestHeaders.append("OpenAI-Organization", organizationId);
        this.requestHeaders.append("Authorization", "Bearer "+bearerToken);
        this.requestHeaders.append("Content-Type", "application/json");
    }

    async processMessageAsPrompt(msg: string): Promise<string> {
        var openaiMessage = JSON.parse(JSON.stringify(this.messageTemplate));
        openaiMessage.messages[0].content = msg;
        var requestOptions: RequestInit = {
            method: 'POST',
            headers: this.requestHeaders,
            body: JSON.stringify(openaiMessage),
        };
        const response  = await fetch("https://api.openai.com/v1/chat/completions", requestOptions);
        return JSON.parse(await response.text()).choices[0].message.content;
    }
}