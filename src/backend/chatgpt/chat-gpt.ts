import logger from '../../util/log'
class ChatGPT extends Backend{
    organizationId: string;
    bearerToken: string;
    requestUrl: string;

    constructor(organizationId: string, bearerToken: string, requestUrl: string, messageTemplate: string) {
        logger.info("Starting ChatGPT backend");
        super(messageTemplate);
        this.organizationId = organizationId;
        this.bearerToken = bearerToken;
        this.requestUrl = requestUrl;
    }
}