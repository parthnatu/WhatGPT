export abstract class Backend{
    messageTemplate: any;

    constructor(messageTemplate: any){
        if(JSON.stringify(messageTemplate).indexOf('$MESSAGE') == -1){
            throw new Error("Message Template must contain $MESSAGE");
        }
        this.messageTemplate = messageTemplate;
    }

    abstract processMessageAsPrompt(msg: any): Promise<string>;

}