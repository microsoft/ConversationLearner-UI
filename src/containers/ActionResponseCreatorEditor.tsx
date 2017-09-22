import * as React from 'react';
import { returntypeof } from 'react-redux-typescript';
import { createActionAsync } from '../actions/createActions';
import { editActionAsync } from '../actions/updateActions';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Modal } from 'office-ui-fabric-react/lib/Modal';
import { CommandButton, Dropdown, TagPicker, Label, Checkbox, List } from 'office-ui-fabric-react';
import { TextFieldPlaceholder } from './TextFieldPlaceholder';
import { ActionBase, ActionMetaData, ActionTypes, EntityBase, EntitySuggestion, ModelUtils } from 'blis-models'
import { State } from '../types';
import EntityCreatorEditor from './EntityCreatorEditor';
import AutocompleteListItem from '../components/AutocompleteListItem';
import * as $ from 'jquery';

interface EntityPickerObject {
    key: string
    name: string
}

interface TextObject {
    key: string
    text: string
}

//$ENTITY is a SpecialIndex. Index is the position of the $ and entityPicker object is the entity it refers to. You can get the entity base from its name
interface SpecialIndex {
    index: number,
    entityPickerObject: EntityPickerObject
}

const initState = {
    actionTypeVal: 'TEXT',
    apiVal: null,
    payloadVal: '',
    reqEntitiesVal: [] as EntityPickerObject[],
    negEntitiesVal: [] as EntityPickerObject[],
    suggEntitiesVal: [] as EntityPickerObject[],
    waitVal: true,
    availableRequiredEntities: [] as EntityPickerObject[],
    availableNegativeEntities: [] as EntityPickerObject[],
    availableSuggestedEntities: [] as EntityPickerObject[],
    editing: false,
    defaultNegativeEntities: [] as EntityPickerObject[],
    defaultRequiredEntities: [] as EntityPickerObject[],
    defaultSuggestedEntities: [] as EntityPickerObject[],
    entityModalOpen: false,
    open: false,
    requiredTagPickerKey: 1000,
    negativeTagPickerKey: 2000,
    payloadFocused: false
};

class ActionResponseCreatorEditor extends React.Component<Props, any> {
    constructor(p: Props) {
        super(p);
        this.state = initState;
        this.checkForSpecialCharacters = this.checkForSpecialCharacters.bind(this);
        this.findWordFollowingSpecialCharacter = this.findWordFollowingSpecialCharacter.bind(this);
        this.entitySuggestionSelected = this.entitySuggestionSelected.bind(this)
    }
    componentDidMount() {
        this.initializeDropdown();
    }
    componentWillReceiveProps(p: Props) {
        if (p.open === true && this.state.open === true) {
            let entities = this.props.entities.map((e: EntityBase) => {
                return {
                    key: e.entityName,
                    name: e.entityName
                }
            })
            this.setState({
                availableRequiredEntities: entities,
                availableNegativeEntities: entities,
                availableSuggestedEntities: entities,
            })
        } else {
            if (p.blisAction === null) {
                this.setState({ ...initState, open: p.open });
            } else {
                // we are editing the action and need to load necessary properties
                let entities = this.props.entities.map((e: EntityBase) => {
                    return {
                        key: e.entityName,
                        name: e.entityName
                    }
                })
                let requiredEntities: EntityPickerObject[] = p.blisAction.requiredEntities.map((entityId: string) => {
                    let found: EntityBase = this.props.entities.find((e: EntityBase) => e.entityId == entityId);
                    return {
                        key: found.entityName,
                        name: found.entityName
                    }
                })
                let negativeEntities: EntityPickerObject[] = p.blisAction.negativeEntities.map((entityId: string) => {
                    let found: EntityBase = this.props.entities.find((e: EntityBase) => e.entityId == entityId);
                    return {
                        key: found.entityName,
                        name: found.entityName
                    }
                })
                let suggestedEntities: EntityPickerObject[] = []
                if (p.blisAction.metadata.entitySuggestion && p.blisAction.metadata.entitySuggestion.entityName) {
                    suggestedEntities.push({
                        key: p.blisAction.metadata.entitySuggestion.entityName,
                        name: p.blisAction.metadata.entitySuggestion.entityName,
                    })
                }

                let payload = null;
                let apiVal = null;
                if (p.blisAction.metadata.actionType == ActionTypes.API_LOCAL) {
                   payload = ModelUtils.GetArguments(p.blisAction);
                   apiVal = ModelUtils.GetPrimaryPayload(p.blisAction);
                }
                else {
                    payload = p.blisAction.payload;
                }
                this.setState({
                    actionTypeVal: p.blisAction.metadata.actionType,
                    apiVal: apiVal,
                    payloadVal: payload,
                    reqEntitiesVal: requiredEntities,
                    negEntitiesVal: negativeEntities,
                    suggEntitiesVal: suggestedEntities,
                    waitVal: p.blisAction.isTerminal,
                    availableRequiredEntities: entities,
                    availableNegativeEntities: entities,
                    availableSuggestedEntities: entities,
                    editing: true,
                    defaultNegativeEntities: negativeEntities,
                    defaultRequiredEntities: requiredEntities,
                    defaultSuggestedEntities: suggestedEntities,
                    entityModalOpen: false,
                    open: p.open
                })
            }
        }

    }
    componentDidUpdate() {
        //this will run successfully when a user has created an entity while creating/editing an action and has returned to the action creator modal 
        if (this.state.availableRequiredEntities.length != this.props.entities.length) {
            let entities = this.props.entities.map((e: EntityBase) => {
                return {
                    key: e.entityName,
                    name: e.entityName
                }
            })
            this.setState({
                availableRequiredEntities: entities
            })
        }
        if (this.state.availableNegativeEntities.length != this.props.entities.length) {
            let entities = this.props.entities.map((e: EntityBase) => {
                return {
                    key: e.entityName,
                    name: e.entityName
                }
            })
            this.setState({
                availableNegativeEntities: entities
            })
        }
        if (this.state.availableSuggestedEntities.length != this.props.entities.length) {
            let entities = this.props.entities.map((e: EntityBase) => {
                return {
                    key: e.entityName,
                    name: e.entityName
                }
            })
            this.setState({
                availableSuggestedEntities: entities
            })
        }
    }
    reInitializeDropdown() {
        //this is used while the modal is still being edited, so we dont want to edit the special chars
        this.setState({
            displayAutocomplete: false,
            dropdownIndex: null,
            entitySuggestFilterText: ""
        });
    }
    initializeDropdown() {
        //these properties exist separately from those in initState and should be initialized separately.
        this.setState({
            displayAutocomplete: false,
            dropdownIndex: null,
            entitySuggestFilterText: "",
            specialCharIndexesToDisregard: []
        });
    }
    handleClose() {
        this.setState({ ...initState });
        this.initializeDropdown();
        this.props.handleClose(null);
    }
    createAction() {
        let currentAppId: string = this.props.blisApps.current.appId;
        let requiredEntities = this.state.reqEntitiesVal.map((req: EntityPickerObject) => {
            let found: EntityBase = this.props.entities.find((e: EntityBase) => e.entityName == req.key)
            return found.entityId
        })
        let negativeEntities = this.state.negEntitiesVal.map((neg: EntityPickerObject) => {
            let found: EntityBase = this.props.entities.find((e: EntityBase) => e.entityName == neg.key)
            return found.entityId
        })
        let suggestedEntity: EntityBase = this.state.suggEntitiesVal[0] ? this.props.entities.find((e: EntityBase) => e.entityName == this.state.suggEntitiesVal[0].name) : null;

        let meta = new ActionMetaData({
            actionType: this.state.actionTypeVal,
            entitySuggestion: suggestedEntity ? new EntitySuggestion({ entityId: suggestedEntity.entityId, entityName: suggestedEntity.entityName }) : null
        })

        let payload = null;
        if (this.state.actionTypeVal == ActionTypes.API_LOCAL) {
            payload = `${this.state.apiVal} ${this.state.payloadVal}`;
        }
        else {
            payload = this.state.payloadVal
        }
        let actionToAdd = new ActionBase({
            payload: payload,
            negativeEntities: negativeEntities,
            requiredEntities: requiredEntities,
            isTerminal: this.state.waitVal,
            metadata: meta,
            version: null,
            packageCreationId: null,
            packageDeletionId: null
        })
        if (this.state.editing === false) {
            this.props.createAction(this.props.userKey, actionToAdd, currentAppId);
        } else {
            this.editAction(actionToAdd, currentAppId);
        }
        this.handleClose();
        this.props.handleClose(actionToAdd);
    }
    editAction(actionToAdd: ActionBase, currentAppId: string) {
        actionToAdd.actionId = this.props.blisAction.actionId;
        this.props.editAction(this.props.userKey, actionToAdd, currentAppId);
    }
    checkPayload(value: string): string {
        return value ? "" : "Payload is required";
    }
    waitChanged() {
        this.setState({
            waitVal: !this.state.waitVal,
        })
    }
    actionTypeChanged(obj: { text: string }) {
        this.setState({
            actionTypeVal: obj.text,
        })
    }
    apiChanged(obj: { text: string }) {
        this.setState({
            apiVal: obj.text,
        })
    }
    onFilterChanged(filterText: string, tagList: EntityPickerObject[]) {
        //required entites available should exclude all saved entities
        let entList = filterText ? this.state.availableRequiredEntities.filter((ent: EntityPickerObject) => ent.name.toLowerCase().indexOf(filterText.toLowerCase()) === 0).filter((item: EntityPickerObject) => !this.listContainsDocument(item, tagList)) : [];
        let usedEntities = this.state.reqEntitiesVal.concat(this.state.negEntitiesVal).concat(this.state.suggEntitiesVal)
        let entListToReturn = entList.filter((e: EntityPickerObject) => {
            let decision: boolean = true;
            usedEntities.map((u: EntityPickerObject) => {
                if (e.key == u.key) {
                    decision = false;
                }
            })
            return decision;
        })
        return entListToReturn;
    }
    onFilterChangedNegative(filterText: string, tagList: EntityPickerObject[]) {
        //negative entites available should exclude those in required entities, and its own saved entities, but not suggested ones
        let entList = filterText ? this.state.availableRequiredEntities.filter((ent: EntityPickerObject) => ent.name.toLowerCase().indexOf(filterText.toLowerCase()) === 0).filter((item: EntityPickerObject) => !this.listContainsDocument(item, tagList)) : [];
        let usedEntities = this.state.reqEntitiesVal.concat(this.state.negEntitiesVal)
        let entListToReturn = entList.filter((e: EntityPickerObject) => {
            let decision: boolean = true;
            usedEntities.map((u: EntityPickerObject) => {
                if (e.key == u.key) {
                    decision = false;
                }
            })
            return decision;
        })
        return entListToReturn;
    }
    onFilterChangedSuggestedEntity(filterText: string, tagList: EntityPickerObject[]) {
        //suggested entites available should exclude those in required entities, and its own saved entities, but not negative ones
        if (this.state.suggEntitiesVal.length > 0) {
            return [];
        }
        let entList = filterText ? this.state.availableRequiredEntities.filter((ent: EntityPickerObject) => ent.name.toLowerCase().indexOf(filterText.toLowerCase()) === 0).filter((item: EntityPickerObject) => !this.listContainsDocument(item, tagList)) : [];
        let usedEntities = this.state.reqEntitiesVal.concat(this.state.suggEntitiesVal)
        let entListToReturn = entList.filter((e: EntityPickerObject) => {
            let decision: boolean = true;
            usedEntities.map((u: EntityPickerObject) => {
                if (e.key == u.key) {
                    decision = false;
                }
            })
            return decision;
        })
        return entListToReturn;
    }

    listContainsDocument(tag: EntityPickerObject, tagList: EntityPickerObject[]) {
        if (!tagList || !tagList.length || tagList.length === 0) {
            return false;
        }
        return tagList.filter(compareTag => compareTag.key === tag.key).length > 0;
    }
    handleChangeRequiredEntities(items: EntityPickerObject[]) {
        this.setState({
            reqEntitiesVal: items
        })
    }
    handleChangeNegativeEntities(items: EntityPickerObject[]) {
        if (items.length < this.state.negEntitiesVal.length) {
            //we deleted one, need to make sure it isnt a suggested entity;
            if (this.state.suggEntitiesVal.length == 1) {
                let suggestedEntity: EntityPickerObject = this.state.suggEntitiesVal[0];
                let deletedNegativeEntity: EntityPickerObject = this.findDeletedEntity(items, this.state.negEntitiesVal);
                if (suggestedEntity.name == deletedNegativeEntity.name) {
                    let negativeEntities: EntityPickerObject = this.state.negEntitiesVal;
                    //do nothing. Picker will internally update so we need to overwrite that
                    this.setState({
                        negEntitiesVal: negativeEntities,
                        defaultNegativeEntities: negativeEntities,
                        negativeTagPickerKey: this.state.negativeTagPickerKey + 1
                    })
                } else {
                    this.setState({
                        negEntitiesVal: items,
                        defaultNegativeEntities: items
                    })
                }
            } else {
                this.setState({
                    negEntitiesVal: items,
                    defaultNegativeEntities: items
                })
            }
        } else {
            this.setState({
                negEntitiesVal: items,
                defaultNegativeEntities: items
            })
        }
    }
    
    handleCloseEntityModal() {
        this.setState({
            entityModalOpen: false
        })
    }
    handleOpenEntityModal() {
        this.setState({
            entityModalOpen: true
        })
    }

    payloadChanged(text: string) {
        let specialIndexes: SpecialIndex[] = this.updateSpecialCharIndexesToDisregard(text);
        this.checkForSpecialCharacters(text, specialIndexes);
        this.setState({
            payloadVal: text
        })
    }
    updateSpecialCharIndexesToDisregard(newPayload: string): SpecialIndex[] {
        let indexesToSet: SpecialIndex[] = [];
        // let requiredEntities = [...this.state.reqEntitiesVal];
        let updatedIndex = this.findUpdatedIndex(newPayload);
        if (newPayload.length > this.state.payloadVal.length) {
            //we added a letter. Find which index was updated. Increment every index in the current special indexes array >= to the updated index
            indexesToSet = this.state.specialCharIndexesToDisregard.map((i: SpecialIndex) => {
                if (i.index >= updatedIndex) {
                    return { ...i, index: i.index + 1 }
                } else {
                    return i;
                }
            })
        } else {
            //we deleted a letter. Find which index was updated. Decrement every index in the current special indexes array <= to the updated index
            //If the character deleted was actually one of the special characters, remove it from the array.
            indexesToSet = this.state.specialCharIndexesToDisregard.filter((s: SpecialIndex) => {
                if (s.index == updatedIndex) {
                    //we have deleted a special character. Need to remove it from the array and remove its corresponding entity from the required entities picker
                    let newRequiredEntities = this.state.reqEntitiesVal.filter((re: EntityPickerObject) => re.name !== s.entityPickerObject.name);
                    this.setState({
                        reqEntitiesVal: newRequiredEntities,
                        defaultRequiredEntities: newRequiredEntities,
                        requiredTagPickerKey: this.state.requiredTagPickerKey + 1
                    })
                    return false;
                } else {
                    return true;
                }
            }).map((i: SpecialIndex) => {
                if (i.index > updatedIndex) {
                    return { ...i, index: i.index - 1 }
                } else {
                    return i
                }
            })
        }
        this.setState({
            specialCharIndexesToDisregard: indexesToSet
        })
        return indexesToSet;
    }
    findWordFollowingSpecialCharacter(text: string): string {
        let word: string = "";
        // let current: string = this.state.payloadVal;
        for (let i = this.state.dropdownIndex + 1; i < text.length; i++) {
            if (text[i] !== " " && text[i] !== "") {
                word += text[i]
            } else {
                break;
            }
        }
        return word;
    }
    checkForSpecialCharacters(text: string, specialIndexes: SpecialIndex[], dropdownRemoved?: boolean) {
        //this is the method that controls whether the dropdown displays, and sets the current dropdown index for later use
        let pixels: number = 0;
        if (this.state.displayAutocomplete === false || (dropdownRemoved && dropdownRemoved === true)) {
            //we only care about $ if dropdown isnt displayed yet
            for (let letter of text) {
                if (letter === "$") {
                    let indexFound: SpecialIndex = specialIndexes.find((i: SpecialIndex) => i.index == pixels);
                    if (!indexFound) {
                        //need to see if there is already text following the special character
                        let isLastCharacter: boolean = text.length == (pixels + 1);
                        let precedesSpace: boolean = text[pixels + 1] ? text[pixels + 1] == " " : false;
                        if (isLastCharacter || precedesSpace) {
                            this.setState({
                                displayAutocomplete: true,
                                dropdownIndex: pixels
                            })
                        } else {
                            //find the text following the special character and set it equal to the filter text so the dropdown doesnt have all options
                            let filterText: string = ""
                            for (let i = pixels + 1; i < text.length; i++) {
                                if (text[i] != " ") {
                                    filterText += text[i];
                                } else {
                                    break;
                                }
                            }
                            this.setState({
                                displayAutocomplete: true,
                                dropdownIndex: pixels,
                                entitySuggestFilterText: filterText
                            })
                        }
                    }
                }
                pixels++;
            }
        } else {
            if (this.state.payloadVal.length < text.length) {
                //the dropdown is displayed and we've added a letter. We need to see if the letter added was after the $ 
                //if it is, we need to add it to the filter text
                //if it isnt, do nothing
                let addedIndex = this.findUpdatedIndex(text);
                if (addedIndex > this.state.dropdownIndex) {
                    let filterText = this.findWordFollowingSpecialCharacter(text);
                    this.setState({
                        entitySuggestFilterText: filterText
                    })
                } else {
                    this.setState({
                        dropdownIndex: this.state.dropdownIndex + 1
                    })
                    //something was added before the dropdown index. it needs to be incremented by 1
                }
            } else {
                //we've deleted a letter and the dropdown is displayed. Need to determine if the letter was deleted from the entity string or not
                //if it is, we need to remove it from the filter text
                //if it isnt, do nothing
                let deletedIndex = this.findUpdatedIndex(text);
                if (deletedIndex > this.state.dropdownIndex) {
                    let filterText = this.findWordFollowingSpecialCharacter(text);
                    this.setState({
                        entitySuggestFilterText: filterText
                    })
                } else if (deletedIndex == this.state.dropdownIndex) {
                    //need to determine if there is another $ in front of the deleted one. Initialize if not, re run this if so.
                    this.reInitializeDropdown();
                } else {
                    this.setState({
                        dropdownIndex: this.state.dropdownIndex - 1
                    })
                    //something was deleted before the dropdown index. it needs to be decremented by 1
                }
            }
        }
    }

    findUpdatedIndex(text: string): number {
        let current: string = this.state.payloadVal;
        let length = current.length > text.length ? current.length : text.length;
        for (let i = 0; i < length; i++) {
            if (current[i] !== text[i]) {
                return i;
            }
        }
    }
    
    findDeletedEntity(items: EntityPickerObject[], oldItems: EntityPickerObject[]): EntityPickerObject {
        let deletedEntity: EntityPickerObject;
        oldItems.map((o: EntityPickerObject) => {
            let found: boolean = false;
            items.map((i: EntityPickerObject) => {
                if (o.name === i.name) {
                    found = true
                }
            })
            if (found === false) {
                deletedEntity = o;
            }
        })
        return deletedEntity;
    }

    handleChangeSuggestedEntities(items: EntityPickerObject[]) {
        let negativeEntities: EntityPickerObject[] = [...this.state.negEntitiesVal]
        if (items.length > 0) {
            // we added one. Need to check if its already in negative entities. If it is not, add it to that as well.
            let suggestedEntity: EntityPickerObject = items[0];
            let found: EntityPickerObject = negativeEntities.find((n: EntityPickerObject) => n.name == suggestedEntity.name);
            if (!found) {
                negativeEntities.push(suggestedEntity)
                this.setState({
                    suggEntitiesVal: items,
                    negEntitiesVal: negativeEntities,
                    defaultNegativeEntities: negativeEntities,
                    negativeTagPickerKey: this.state.negativeTagPickerKey + 1
                })
            } else {
                this.setState({
                    suggEntitiesVal: items
                })
            }

        } else {
            // we deleted one. Need to check if its already in negative entities. If it is, delete it to that as well.
            let deletedSuggesedEntity: EntityPickerObject = this.findDeletedEntity(items, this.state.suggEntitiesVal);
            let found: EntityPickerObject = negativeEntities.find((n: EntityPickerObject) => n.name == deletedSuggesedEntity.name);
            if (found) {
                let filteredNegativeEntities = negativeEntities.filter((neg: EntityPickerObject) => neg.name !== deletedSuggesedEntity.name)
                this.setState({
                    suggEntitiesVal: items,
                    negEntitiesVal: filteredNegativeEntities,
                    defaultNegativeEntities: filteredNegativeEntities,
                    negativeTagPickerKey: this.state.negativeTagPickerKey + 1
                })
            } else {
                this.setState({
                    suggEntitiesVal: items
                })
            }
        }
    }
    findIndexOfLastCharacterFollowingSpecialCharacterPreSpace(): number {
        let text: string = this.state.payloadVal;
        let index: number = this.state.dropdownIndex;
        for (let i = this.state.dropdownIndex + 1; i < text.length + 1; i++) {
            if (text[i] !== " ") {
                index = i;
            } else {
                break;
            }
        }
        return index;
    }
    updatePayloadWithEntitySuggestion(entityName: string): string {
        let charsPreSpecialCharacter: string = this.state.payloadVal.slice(0, this.state.dropdownIndex);
        let newCharsWithSpecialChar: string = this.state.payloadVal[this.state.dropdownIndex] + entityName;
        let lastCharFilterTextIndex = this.findIndexOfLastCharacterFollowingSpecialCharacterPreSpace()
        let charsPostEntitySuggest: string = lastCharFilterTextIndex == (this.state.payloadVal.length - 1) ? "" : this.state.payloadVal.slice(lastCharFilterTextIndex + 1, this.state.payloadVal.length);
        let word: string = charsPreSpecialCharacter.concat(newCharsWithSpecialChar).concat(charsPostEntitySuggest)
        this.setState({
            payloadVal: word
        })
        return word;
    }
    entitySuggestionSelected(obj: { text: string }) {
        let specialIndexes: SpecialIndex[] = [];
        //dont add the entity if weve already manually entered it into the required picker
        let foundEntityPickerObj: EntityPickerObject = this.state.reqEntitiesVal.find((e: EntityPickerObject) => e.name == obj.text);
        let newRequiredEntities: EntityPickerObject[] = foundEntityPickerObj ? [...this.state.reqEntitiesVal] : [...this.state.reqEntitiesVal, { key: obj.text, name: obj.text }];
        let specialIndex: SpecialIndex = {
            index: this.state.dropdownIndex,
            entityPickerObject: { key: obj.text, name: obj.text }
        }
        let newPayload: string = this.updatePayloadWithEntitySuggestion(obj.text);
        let charsAdded: number = newPayload.length - this.state.payloadVal.length;
        specialIndexes = [...this.state.specialCharIndexesToDisregard, specialIndex].map((s: SpecialIndex) => {
            if (s.index > this.state.dropdownIndex) {
                return { ...s, index: s.index + charsAdded };
            } else {
                return s;
            }
        })
        //need to add to each special index.index the amount of characters added
        this.setState({
            specialCharIndexesToDisregard: specialIndexes,
            reqEntitiesVal: newRequiredEntities,
            defaultRequiredEntities: newRequiredEntities,
            entitySuggestFilterText: "",
            requiredTagPickerKey: this.state.requiredTagPickerKey + 1
        })
        this.reInitializeDropdown();
        this.checkForSpecialCharacters(newPayload, specialIndexes, true);
    }
    getAlphabetizedFilteredEntityOptions(): TextObject[] {
        let filteredEntities: EntityBase[] = this.props.entities.filter((e: EntityBase) => e.entityName.toLowerCase().includes(this.state.entitySuggestFilterText.toLowerCase()) && e.metadata.positiveId == null);
        let names: string[] = filteredEntities.map((e: EntityBase) => {
            return e.entityName;
        })
        names.sort();
        let options: TextObject[] = names.map((name: string) => {
            let ent: EntityBase = this.props.entities.find((e: EntityBase) => e.entityName == name);
            return {
                key: ent.entityName,
                text: ent.entityName
            }
        })
        let optionsNotSelected: TextObject[] = options.filter((t: TextObject) => {
            let found: boolean = true
            this.state.reqEntitiesVal.map((r: EntityPickerObject) => {
                if (r.name == t.text) {
                    found = false;
                }
            })
            return found;
        })
        return optionsNotSelected;
    }
    handleBlur() {
        this.setState({
            payloadFocused: false
        })
    }
    payloadIsFocused() {
        this.setState({
            payloadFocused: true
        })
    }
    payloadKeyDown(key: KeyboardEvent) {
        if (this.state.displayAutocomplete === true && this.state.payloadFocused === true) {
            let code = key.keyCode;
            if (code == 9) {
                let entityOptions = this.getAlphabetizedFilteredEntityOptions();
                let optionAtTopOfList = entityOptions[0];
                this.entitySuggestionSelected(optionAtTopOfList);
                $(document).ready(() => {
                    $('#actionPayload').focus();
                })
            }
        }
        else {
            // On enter attempt to create the action as long as payload is set
            if (key.keyCode == 13 && this.state.payloadVal) {
                this.createAction();
            }
        }
    }
    render() {
        let entitySuggestStyle: {};
        let entitySuggestOptions: {}[] = [];
        if (this.state.displayAutocomplete === true) {
            entitySuggestStyle = {
                marginTop: "-8px",
                borderBottom: "1px solid lightgrey",
                borderLeft: "1px solid lightgrey",
                borderRight: "1px solid lightgrey"
            }
            entitySuggestOptions = this.getAlphabetizedFilteredEntityOptions();
        } else {
            entitySuggestStyle = {
                display: "none"
            }
        }

        let apiVals = Object.values(this.props.botInfo.callbacks);
        let apiOptions = apiVals.map(v => {
            return {
                key: v,
                text: v
            }
        })

        let actionTypeVals = Object.values(ActionTypes);
        let actionTypeOptions = actionTypeVals.map(v => {
            return {
                key: v,
                text: v
            }
        })
        let title: string;
        let createButtonText: string;
        let deleteButton = null;
        if (this.state.editing == true) {
            title = "Edit Action"
            createButtonText = "Save"
            deleteButton =
                <CommandButton
                    data-automation-id='randomID9'
                    className="blis-button--gray"
                    disabled={false}
                    onClick={() => this.props.handleOpenDeleteModal(this.props.blisAction.actionId)}
                    ariaDescription='Delete'
                    text='Delete'
                />
        } else {
            title = "Create an Action"
            createButtonText = "Create"
        }

        let apiDropDown = null;
        let payloadTextField = null;
        if (this.state.actionTypeVal == ActionTypes.API_LOCAL) {
            apiDropDown = 
            (
                <Dropdown
                    label='API'
                    options={apiOptions}
                    onChanged={this.apiChanged.bind(this)}
                    selectedKey={this.state.apiVal}
                    disabled={this.state.editing}
                />
            )
            payloadTextField = (
                <TextFieldPlaceholder
                    id={"actionArguements"}
                    key="0"
                    onChanged={this.payloadChanged.bind(this)}
                    label="Arguments (Comma Separated)"
                    placeholder="Arguments..."
                    autoFocus={true}
                    onFocus={this.payloadIsFocused.bind(this)}
                    onKeyDown={this.payloadKeyDown.bind(this)}
                    onBlur={this.handleBlur.bind(this)}
                    value={this.state.payloadVal} />
                )
        } else {
            payloadTextField = (
                <TextFieldPlaceholder
                    id={"actionPayload"}
                    key='1'
                    onGetErrorMessage={this.checkPayload.bind(this)}
                    onChanged={this.payloadChanged.bind(this)}
                    label="Payload"
                    placeholder="Payload..."
                    autoFocus={true}
                    onFocus={this.payloadIsFocused.bind(this)}
                    onKeyDown={this.payloadKeyDown.bind(this)}
                    onBlur={this.handleBlur.bind(this)}
                    value={this.state.payloadVal} />
                )
        }

        return (
            <div>
                <Modal
                    isOpen={this.props.open}
                    onDismiss={this.handleClose.bind(this)}
                    isBlocking={false}
                    containerClassName='createModal'
                >
                    <div className='modalHeader'>
                        <span className='ms-font-xxl ms-fontWeight-semilight'>{title}</span>
                    </div>
                    <div>
                        <Dropdown
                            label='Action Type'
                            options={actionTypeOptions}
                            onChanged={this.actionTypeChanged.bind(this)}
                            selectedKey={this.state.actionTypeVal}
                            disabled={this.state.editing}
                        />
                        {apiDropDown}
                        {payloadTextField}
                        <List
                            items={entitySuggestOptions}
                            style={entitySuggestStyle}
                            renderCount={5}
                            onRenderCell={(item, index: number) => (
                                <AutocompleteListItem onClick={() => this.entitySuggestionSelected(item)} item={item} />
                            )}
                        />
                        <Label>Expected Entity in Response...</Label>
                        <TagPicker
                            onResolveSuggestions={this.onFilterChangedSuggestedEntity.bind(this)}
                            getTextFromItem={(item) => { return item.name; }}
                            onChange={this.handleChangeSuggestedEntities.bind(this)}
                            key={this.state.suggestedTagPickerKey}
                            pickerSuggestionsProps={
                                {
                                    suggestionsHeaderText: 'Entities',
                                    noResultsFoundText: 'No Entities Found'
                                }
                            }
                            defaultSelectedItems={this.state.defaultSuggestedEntities}
                        />
                        <Label>Disallow Action when Entities are <b>NOT</b> in Memory...</Label>
                        <TagPicker
                            onResolveSuggestions={this.onFilterChanged.bind(this)}
                            getTextFromItem={(item) => { return item.name; }}
                            onChange={this.handleChangeRequiredEntities.bind(this)}
                            key={this.state.requiredTagPickerKey}
                            pickerSuggestionsProps={
                                {
                                    suggestionsHeaderText: 'Entities',
                                    noResultsFoundText: 'No Entities Found'
                                }
                            }
                            defaultSelectedItems={this.state.defaultRequiredEntities}
                        />
                        <Label>Disallow Action when Entities <b>ARE</b> in Memory...</Label>
                        <TagPicker
                            key={this.state.negativeTagPickerKey}
                            onResolveSuggestions={this.onFilterChangedNegative.bind(this)}
                            getTextFromItem={(item) => { return item.name; }}
                            onChange={this.handleChangeNegativeEntities.bind(this)}
                            pickerSuggestionsProps={
                                {
                                    suggestionsHeaderText: 'Entities',
                                    noResultsFoundText: 'No Entities Found'
                                }
                            }
                            defaultSelectedItems={this.state.defaultNegativeEntities}
                        />
                        <Checkbox
                            label='Wait For Response?'
                            defaultChecked={true}
                            onChange={this.waitChanged.bind(this)}
                            style={{ marginTop: "1em", display: "inline-block" }}
                            disabled={this.state.editing}
                        />
                    </div>
                    <div className="modalFooter">
                        <CommandButton
                            data-automation-id='randomID6'
                            disabled={!this.state.payloadVal}
                            onClick={this.createAction.bind(this)}
                            className='blis-button--gold'
                            ariaDescription='Create'
                            text={createButtonText}
                        />
                        <CommandButton
                            data-automation-id='randomID7'
                            className="blis-button--gray"
                            disabled={false}
                            onClick={this.handleClose.bind(this)}
                            ariaDescription='Cancel'
                            text='Cancel'
                        />
                        <CommandButton
                            data-automation-id='randomID8'
                            className="blis-button--gold blis-button--right"
                            disabled={false}
                            onClick={this.handleOpenEntityModal.bind(this)}
                            ariaDescription='Entity'
                            text='Entity'
                            iconProps={{ iconName: 'CirclePlus' }}
                        />
                        {deleteButton}
                    </div>
                    <EntityCreatorEditor open={this.state.entityModalOpen} entity={null} handleClose={this.handleCloseEntityModal.bind(this)} />
                </Modal>
            </div>
        );
    }
}
const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
        createAction: createActionAsync,
        editAction: editActionAsync
    }, dispatch);
}
const mapStateToProps = (state: State, ownProps: any) => {
    return {
        userKey: state.user.key,
        actions: state.actions,
        blisApps: state.apps,
        entities: state.entities,
        botInfo: state.bot.botInfo
    }
}

interface ReceiveProps {
    open: boolean,
    blisAction: ActionBase | null,
    handleClose: Function,
    handleOpenDeleteModal: Function
}
// Props types inferred from mapStateToProps & dispatchToProps
const stateProps = returntypeof(mapStateToProps);
const dispatchProps = returntypeof(mapDispatchToProps);
type Props = typeof stateProps & typeof dispatchProps & ReceiveProps;

export default connect(mapStateToProps, mapDispatchToProps)(ActionResponseCreatorEditor as React.ComponentClass<any>)