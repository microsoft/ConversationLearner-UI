import * as React from 'react';
import { returntypeof } from 'react-redux-typescript';
import { createActionAsync } from '../actions/createActions';
import { editActionAsync } from '../actions/updateActions';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Modal } from 'office-ui-fabric-react/lib/Modal';
import { CommandButton, Dropdown, TagPicker, Label, Checkbox, List } from 'office-ui-fabric-react';
import { TextFieldPlaceholder } from './TextFieldPlaceholder';
import { ActionBase, ActionMetaData, ActionTypes, EntityBase, ModelUtils } from 'blis-models'
import { State } from '../types';
import EntityCreatorEditor from './EntityCreatorEditor';
import AutocompleteListItem from '../components/AutocompleteListItem';

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

const initState: ComponentState = {
    actionTypeVal: 'TEXT',
    apiVal: null,
    displayAutocomplete: false,
    dropdownIndex: null,
    entitySuggestFilterText: "",
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
    suggestedTagPickerKey: 3000,
    specialCharIndexesToDisregard: [],
    payloadFocused: false
};

interface ComponentState {
    actionTypeVal: string,
    apiVal: string,
    displayAutocomplete: boolean,
    dropdownIndex: number,
    entitySuggestFilterText: string,
    payloadVal: string,
    reqEntitiesVal: EntityPickerObject[],
    negEntitiesVal: EntityPickerObject[],
    suggEntitiesVal: EntityPickerObject[],
    waitVal: boolean,
    availableRequiredEntities: EntityPickerObject[],
    availableNegativeEntities: EntityPickerObject[],
    availableSuggestedEntities: EntityPickerObject[],
    editing: boolean,
    defaultNegativeEntities: EntityPickerObject[],
    defaultRequiredEntities: EntityPickerObject[],
    defaultSuggestedEntities: EntityPickerObject[],
    entityModalOpen: boolean,
    open: boolean,
    requiredTagPickerKey: number,
    negativeTagPickerKey: number,
    suggestedTagPickerKey: number,
    specialCharIndexesToDisregard: SpecialIndex[],
    payloadFocused: boolean
};

class ActionResponseCreatorEditor extends React.Component<Props, ComponentState> {

    constructor(p: Props) {
        super(p);
        this.state = initState;
        this.actionTypeChanged = this.actionTypeChanged.bind(this);
        this.apiChanged = this.apiChanged.bind(this);
        this.checkForSpecialCharacters = this.checkForSpecialCharacters.bind(this);
        this.findWordFollowingSpecialCharacter = this.findWordFollowingSpecialCharacter.bind(this);
        this.entitySuggestionSelected = this.entitySuggestionSelected.bind(this);
        this.payloadChanged = this.payloadChanged.bind(this);
        this.payloadIsFocused = this.payloadIsFocused.bind(this);
        this.payloadKeyDown = this.payloadKeyDown.bind(this);
        this.payloadBlur = this.payloadBlur.bind(this);
        this.payloadCheck = this.payloadCheck.bind(this);
        this.suggestedEntityOnResolve = this.suggestedEntityOnResolve.bind(this);
        this.suggestedEntityOnChange = this.suggestedEntityOnChange.bind(this);
        this.requiredEntityOnResolve = this.requiredEntityOnResolve.bind(this);
        this.requiredEntityOnChange = this.requiredEntityOnChange.bind(this);
        this.negativeEntityOnResolve = this.negativeEntityOnResolve.bind(this);
        this.negativeEntityOnChange = this.negativeEntityOnChange.bind(this);
        this.createOnClick = this.createOnClick.bind(this);
        this.cancelOnClick = this.cancelOnClick.bind(this);
        this.entityOnClick = this.entityOnClick.bind(this);
        this.waitOnChange = this.waitOnChange.bind(this);
        this.entityCreatorHandleClose = this.entityCreatorHandleClose.bind(this);
    }
    componentDidMount() {
        this.initializeDropdown();
    }
    componentWillReceiveProps(p: Props) {
        if (p.open === true && this.state.open === true) {
            let entities = this.props.entities.map(e => {
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
                let entities = this.props.entities.map<EntityPickerObject>(e =>
                    ({
                        key: e.entityName,
                        name: e.entityName
                    }))
                let requiredEntities = p.blisAction.requiredEntities.map<EntityPickerObject>(entityId => {
                    let found = this.props.entities.find(e => e.entityId == entityId);
                    return {
                        key: found.entityName,
                        name: found.entityName
                    }
                })
                let negativeEntities: EntityPickerObject[] = p.blisAction.negativeEntities.map(entityId => {
                    let found = this.props.entities.find(e => e.entityId == entityId);
                    return {
                        key: found.entityName,
                        name: found.entityName
                    }
                })
                let suggestedEntities: EntityPickerObject[] = []
                if (p.blisAction.suggestedEntity) {
                    let found = this.props.entities.find(e => e.entityId == p.blisAction.suggestedEntity);
                    suggestedEntities.push({
                        key: found.entityName,
                        name: found.entityName,
                    })
                }

                let payload = null;
                let apiVal = null;
                if (p.blisAction.metadata.actionType == ActionTypes.API_LOCAL) {
                    payload = ModelUtils.GetArguments(p.blisAction).join(' ');
                    apiVal = ModelUtils.GetPrimaryPayload(p.blisAction);

                    // Default to first api if none selected
                    if (!apiVal && this.props.botInfo.callbacks && this.props.botInfo.callbacks.length > 0) {
                        apiVal = this.props.botInfo.callbacks[0];
                    }
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
    cancelOnClick() {
        this.setState({ ...initState });
        this.initializeDropdown();
        this.props.handleClose(null);
    }
    createOnClick() {
        let currentAppId: string = this.props.blisApps.current.appId;
        let requiredEntities = this.state.reqEntitiesVal.map(req => {
            let found = this.props.entities.find(e => e.entityName == req.key)
            return found.entityId
        })
        let negativeEntities = this.state.negEntitiesVal.map(neg => {
            let found = this.props.entities.find(e => e.entityName == neg.key)
            return found.entityId
        })
        let suggestedEntity = this.state.suggEntitiesVal[0] ? this.props.entities.find(e => e.entityName == this.state.suggEntitiesVal[0].key) : null;
        let suggestedId = suggestedEntity ? suggestedEntity.entityId : null;

        let meta = new ActionMetaData({
            actionType: this.state.actionTypeVal,
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
            suggestedEntity: suggestedId,
            isTerminal: this.state.waitVal,
            metadata: meta,
            version: null,
            packageCreationId: null,
            packageDeletionId: null
        })
        if (this.state.editing === false) {
            this.props.createActionAsync(this.props.userKey, actionToAdd, currentAppId);
        } else {
            this.editAction(actionToAdd, currentAppId);
        }
        this.cancelOnClick();
        this.props.handleClose(actionToAdd);
    }
    editAction(actionToAdd: ActionBase, currentAppId: string) {
        actionToAdd.actionId = this.props.blisAction.actionId;
        this.props.editActionAsync(this.props.userKey, actionToAdd, currentAppId);
    }
    payloadCheck(value: string): string {
        return value ? "" : "Payload is required";
    }
    waitOnChange() {
        this.setState({
            waitVal: !this.state.waitVal,
        })
    }
    actionTypeChanged(obj: TextObject) {
        this.setState({
            actionTypeVal: obj.text,
        })
    }
    apiChanged(obj: TextObject) {
        this.setState({
            apiVal: obj.text,
        })
    }
    requiredEntityOnResolve(filterText: string, tagList: EntityPickerObject[]): EntityPickerObject[] {
        //required entites available should exclude all saved entities
        let entList = filterText ? this.state.availableRequiredEntities.filter(ent => ent.name.toLowerCase().indexOf(filterText.toLowerCase()) === 0).filter(item => !this.listContainsDocument(item, tagList)) : [];
        let usedEntities = this.state.reqEntitiesVal.concat(this.state.negEntitiesVal).concat(this.state.suggEntitiesVal)
        return entList.filter(e => !usedEntities.some(u => e.key === u.key))
    }
    negativeEntityOnResolve(filterText: string, tagList: EntityPickerObject[]): EntityPickerObject[] {
        //negative entites available should exclude those in required entities, and its own saved entities, but not suggested ones
        let entList = filterText ? this.state.availableRequiredEntities.filter(ent => ent.name.toLowerCase().indexOf(filterText.toLowerCase()) === 0).filter(item => !this.listContainsDocument(item, tagList)) : [];
        let usedEntities = this.state.reqEntitiesVal.concat(this.state.negEntitiesVal)
        return entList.filter(e => !usedEntities.some(u => e.key === u.key))
    }
    suggestedEntityOnResolve(filterText: string, tagList: EntityPickerObject[]): EntityPickerObject[] {
        //suggested entites available should exclude those in required entities, and its own saved entities, but not negative ones
        if (this.state.suggEntitiesVal.length > 0) {
            return [];
        }
        let entList = filterText ? this.state.availableRequiredEntities.filter((ent: EntityPickerObject) => ent.name.toLowerCase().indexOf(filterText.toLowerCase()) === 0).filter((item: EntityPickerObject) => !this.listContainsDocument(item, tagList)) : [];
        let usedEntities = this.state.reqEntitiesVal.concat(this.state.suggEntitiesVal)
        return entList.filter(e => !usedEntities.some(u => e.key === u.key))
    }

    listContainsDocument(tag: EntityPickerObject, tagList: EntityPickerObject[]) {
        if (!tagList || !tagList.length || tagList.length === 0) {
            return false;
        }
        return tagList.filter(compareTag => compareTag.key === tag.key).length > 0;
    }
    requiredEntityOnChange(items: EntityPickerObject[]) {
        this.setState({
            reqEntitiesVal: items
        })
    }
    negativeEntityOnChange(items: EntityPickerObject[]) {
        if (items.length < this.state.negEntitiesVal.length) {
            //we deleted one, need to make sure it isnt a suggested entity;
            if (this.state.suggEntitiesVal.length == 1) {
                let suggestedEntity = this.state.suggEntitiesVal[0];
                let deletedNegativeEntity = this.findDeletedEntity(items, this.state.negEntitiesVal);
                if (suggestedEntity.name == deletedNegativeEntity.name) {
                    let negativeEntities = this.state.negEntitiesVal;
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

    entityCreatorHandleClose() {
        this.setState({
            entityModalOpen: false
        })
    }
    entityOnClick() {
        this.setState({
            entityModalOpen: true
        })
    }

    payloadChanged(text: string) {
        let specialIndexes = this.updateSpecialCharIndexesToDisregard(text);
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
            indexesToSet = this.state.specialCharIndexesToDisregard.map(i => {
                if (i.index >= updatedIndex) {
                    return { ...i, index: i.index + 1 }
                } else {
                    return i;
                }
            })
        } else {
            //we deleted a letter. Find which index was updated. Decrement every index in the current special indexes array <= to the updated index
            //If the character deleted was actually one of the special characters, remove it from the array.
            indexesToSet = this.state.specialCharIndexesToDisregard.filter(specialCharIndex => {
                if (specialCharIndex.index == updatedIndex) {
                    //we have deleted a special character. Need to remove it from the array and remove its corresponding entity from the required entities picker
                    let newRequiredEntities = this.state.reqEntitiesVal.filter(re => re.name !== specialCharIndex.entityPickerObject.name);
                    this.setState({
                        reqEntitiesVal: newRequiredEntities,
                        defaultRequiredEntities: newRequiredEntities,
                        requiredTagPickerKey: this.state.requiredTagPickerKey + 1
                    })
                    return false;
                } else {
                    return true;
                }
            }).map(specialCharIndex => {
                if (specialCharIndex.index > updatedIndex) {
                    return { ...specialCharIndex, index: specialCharIndex.index - 1 }
                } else {
                    return specialCharIndex
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
                    let indexFound = specialIndexes.find(specialIndex => specialIndex.index == pixels);
                    if (!indexFound) {
                        //need to see if there is already text following the special character
                        let isLastCharacter = text.length == (pixels + 1);
                        let precedesSpace = text[pixels + 1] ? text[pixels + 1] === " " : false;
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

    findUpdatedIndex(text: string): number | undefined {
        let current = this.state.payloadVal;
        let length = current.length > text.length ? current.length : text.length;
        for (let i = 0; i < length; i++) {
            if (current[i] !== text[i]) {
                return i;
            }
        }

        return undefined
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

    suggestedEntityOnChange(items: EntityPickerObject[]) {
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
    payloadBlur() {
        this.setState({
            payloadFocused: false
        })
    }
    payloadIsFocused() {
        this.setState({
            payloadFocused: true
        })
    }
    payloadKeyDown(event: any) {
        let key = event as KeyboardEvent;
        if (this.state.displayAutocomplete === true && this.state.payloadFocused === true) {
            let code = key.keyCode;
            if (code == 9) {
                let entityOptions = this.getAlphabetizedFilteredEntityOptions();
                let optionAtTopOfList = entityOptions[0];
                this.entitySuggestionSelected(optionAtTopOfList);
                key.preventDefault();
            }
        }
        else {
            // On enter attempt to create the action as long as payload is set
            if (key.keyCode == 13 && this.state.payloadVal) {
                this.createOnClick();
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
                    className="blis-button--gray"
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

            let placeholder = "API name...";
            let disabled = this.state.editing;
            let apiOptions: TextObject[] = [];
            let haveCallbacks = this.props.botInfo.callbacks && this.props.botInfo.callbacks.length > 0;
            if (haveCallbacks) {
                let apiVals = Object.values(this.props.botInfo.callbacks);
                apiOptions = apiVals.map<TextObject>(v => {
                    return {
                        key: v,
                        text: v
                    }
                })

            } else {
                disabled = true;
                placeholder = "NONE DEFINED";
            }

            apiDropDown =
                (
                    <Dropdown
                        label='API'
                        options={apiOptions}
                        onChanged={this.apiChanged}
                        selectedKey={this.state.apiVal}
                        disabled={disabled}
                        placeHolder={placeholder}
                    />
                )
            payloadTextField = (
                <TextFieldPlaceholder
                    id={"actionArguements"}
                    key="0"
                    onChanged={this.payloadChanged}
                    label="Arguments (Comma Separated)"
                    placeholder="Arguments..."
                    autoFocus={true}
                    onFocus={this.payloadIsFocused}
                    onKeyDown={this.payloadKeyDown}
                    onBlur={this.payloadBlur}
                    value={this.state.payloadVal}
                    disabled={disabled}
                />)
        } else {
            payloadTextField = (
                <TextFieldPlaceholder
                    id={"actionPayload"}
                    key='1'
                    onGetErrorMessage={this.payloadCheck}
                    onChanged={this.payloadChanged}
                    label="Payload"
                    placeholder="Payload..."
                    autoFocus={true}
                    onFocus={this.payloadIsFocused}
                    onKeyDown={this.payloadKeyDown}
                    onBlur={this.payloadBlur}
                    value={this.state.payloadVal}
                />
            )
        }
        let createDisabled =
            (this.state.actionTypeVal == ActionTypes.API_LOCAL) ?
                !this.state.apiVal : !this.state.payloadVal;
        return (
            <div>
                <Modal
                    isOpen={this.props.open}
                    onDismiss={this.cancelOnClick}
                    isBlocking={false}
                    containerClassName='blis-modal blis-modal--small blis-modal--border'
                >
                    <div className='blis-modal_header'>
                        <span className='ms-font-xxl ms-fontWeight-semilight'>{title}</span>
                    </div>
                    <div>
                        <Dropdown
                            label='Action Type'
                            options={actionTypeOptions}
                            onChanged={this.actionTypeChanged}
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
                            onResolveSuggestions={this.suggestedEntityOnResolve}
                            getTextFromItem={(item) => { return item.name; }}
                            onChange={this.suggestedEntityOnChange}
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
                            onResolveSuggestions={this.requiredEntityOnResolve}
                            getTextFromItem={(item) => { return item.name; }}
                            onChange={this.requiredEntityOnChange}
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
                            onResolveSuggestions={this.negativeEntityOnResolve}
                            getTextFromItem={(item) => { return item.name; }}
                            onChange={this.negativeEntityOnChange}
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
                            onChange={this.waitOnChange}
                            style={{ marginTop: "1em", display: "inline-block" }}
                            disabled={this.state.editing}
                        />
                    </div>
                    <div className="blis-modal_footer">
                        <CommandButton
                            disabled={createDisabled}
                            onClick={this.createOnClick}
                            className='blis-button--gold'
                            ariaDescription='Create'
                            text={createButtonText}
                        />
                        <CommandButton
                            className="blis-button--gray"
                            onClick={this.cancelOnClick}
                            ariaDescription='Cancel'
                            text='Cancel'
                        />
                        <CommandButton
                            className="blis-button--gold blis-button--right"
                            onClick={this.entityOnClick}
                            ariaDescription='Entity'
                            text='Entity'
                            iconProps={{ iconName: 'CirclePlus' }}
                        />
                        {deleteButton}
                    </div>
                    <EntityCreatorEditor
                        open={this.state.entityModalOpen}
                        entity={null}
                        handleClose={this.entityCreatorHandleClose} />
                </Modal>
            </div>
        );
    }
}
const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
        createActionAsync,
        editActionAsync
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

export interface ReceiveProps {
    open: boolean,
    blisAction: ActionBase | null,
    handleClose: (action: ActionBase) => void,
    handleOpenDeleteModal: (actionId: string) => void
}

// Props types inferred from mapStateToProps & dispatchToProps
const stateProps = returntypeof(mapStateToProps);
const dispatchProps = returntypeof(mapDispatchToProps);
type Props = typeof stateProps & typeof dispatchProps & ReceiveProps;

export default connect<typeof stateProps, typeof dispatchProps, ReceiveProps>(mapStateToProps, mapDispatchToProps)(ActionResponseCreatorEditor)