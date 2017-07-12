import { EntityBase } from 'blis-models';
export class TrainDialog {
    constructor(public id: string, public dialog: Dialog, public appID: string){
    }
}
export class Dialog {
    constructor(public turns: Turn[]){
        this.turns = turns;
    }
}
export class Turn {
    constructor(public input: Input, public output: any){
        this.input = input;
        this.output = output;
        //output is an action's id
    }
}
export class Input {
    constructor(public context: any, public entityIDs: number[], public maskedActionIDs: number[], public text: string, public textAlts: string[], public textEntities: EntityBase[]){
        this.context = context;
        this.entityIDs = entityIDs;
        this.maskedActionIDs = maskedActionIDs;
        this.text = text;
        this.textAlts = textAlts;
        this.textEntities = textEntities;
    }
}