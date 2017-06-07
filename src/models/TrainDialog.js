export class TrainDialog {
    constructor(id, dialog){
        this.id = id;
        this.dialog = dialog;
    }
}
export class Dialog {
    constructor(turns){
        this.turns = turns;
    }
}
export class Turn {
    constructor(input, output){
        this.input = input;
        this.output = output;
        //output is an action's id
    }
}
export class Input {
    constructor(context, entityIDs, maskedActionIDs, text, textAlts, textEntities){
        this.context = context;
        this.entityIDs = entityIDs;
        this.maskedActionIDs = maskedActionIDs;
        this.text = text;
        this.textAlts = textAlts;
        this.textEntities = textEntities;
    }
}