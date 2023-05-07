class Backend{
    messageTemplate: string;

    constructor(messageTemplate: string){
        if(messageTemplate.indexOf('$MESSAGE') == -1){
            throw new Error("Message Template must contain $MESSAGE");
        }
        this.messageTemplate = messageTemplate;
    }
}