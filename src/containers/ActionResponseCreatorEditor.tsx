import * as React from 'react';
import { returntypeof } from 'react-redux-typescript';
import { createActionAsync } from '../actions/createActions';
import { editActionAsync } from '../actions/updateActions';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Modal } from 'office-ui-fabric-react/lib/Modal';
import { CommandButton, Dialog, DialogFooter, DialogType, ChoiceGroup, DefaultButton, Dropdown, TagPicker, Label, Checkbox } from 'office-ui-fabric-react';
import { TextFieldPlaceholder } from './TextFieldPlaceholder';
import { ActionBase, ActionMetaData, ActionTypes, EntityBase, EntityMetaData, EntitySuggestion } from 'blis-models'
import { State } from '../types';
import EntityCreatorEditor from './EntityCreatorEditor'

interface EntityPickerObject {
    key: string
    name: string
}

const initState = {
    actionTypeVal: 'TEXT',
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
    entityModalOpen: false,
    open: false,
    requiredTagPickerKey: 1,
    negativeTagPickerKey: 100,
    suggestedTagPickerKey: 200,
    focusedOnPayload: false
};

class ActionResponseCreatorEditor extends React.Component<Props, any> {
    constructor(p: Props) {
        super(p);
        this.state = initState;
        this.checkForSpecialCharacters = this.checkForSpecialCharacters.bind(this);
        this.findWordFollowingSpecialCharacter = this.findWordFollowingSpecialCharacter.bind(this)
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
                let suggestedEntity = { 
                    key: p.blisAction.metadata.entitySuggestion.entityName,
                    name: p.blisAction.metadata.entitySuggestion.entityName,
                }
                this.setState({
                    actionTypeVal: p.blisAction.metadata.actionType,
                    suggEntitiesVal: [suggestedEntity],
                    payloadVal: p.blisAction.payload,
                    reqEntitiesVal: requiredEntities,
                    negEntitiesVal: negativeEntities,
                    waitVal: p.blisAction.isTerminal,
                    availableRequiredEntities: entities,
                    availableNegativeEntities: entities,
                    availableSuggestedEntities: entities,
                    editing: true,
                    defaultNegativeEntities: negativeEntities,
                    defaultRequiredEntities: requiredEntities,
                    entityModalOpen: false,
                    open: p.open
                })
            }
        }

    }
    componentDidUpdate() {
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
            displayDropdown: false,
            dropdownIndex: null,
            entitySuggestFilterText: ""
        });
    }
    initializeDropdown() {
        this.setState({
            displayDropdown: false,
            dropdownIndex: null,
            entitySuggestFilterText: "",
            specialCharIndexesToDisregard: [],
            numStars: 0
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
        let suggestedEntity = this.props.entities.find((e: EntityBase) => e.entityName == this.state.suggEntitiesVal[0].name);

        let meta = new ActionMetaData({
            actionType: this.state.actionTypeVal,
            entitySuggestion: new EntitySuggestion({entityId: suggestedEntity.entityId, entityName: suggestedEntity.entityName})
        })
        let actionToAdd = new ActionBase({
            payload: this.state.payloadVal,
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
    payloadChanged(text: string) {
        let specialIndexes = this.updateSpecialCharIndexesToDisregard(text);
        this.checkForSpecialCharacters(text, specialIndexes);
        this.setState({
            payloadVal: text
        })
    }
    updateSpecialCharIndexesToDisregard(newPayload: string): number[] {
        let indexesToSet: number[];
        let updatedIndex = this.findUpdatedIndex(newPayload);
        if (newPayload.length > this.state.payloadVal.length) {
            //we added a letter. Find which index was updated. Increment every index in the current special indexes array >= to the updated index
            indexesToSet = this.state.specialCharIndexesToDisregard.map((i: number) => {
                if (i >= updatedIndex) {
                    return i + 1;
                } else {
                    return i;
                }
            })
        } else {
            //we deleted a letter. Find which index was updated. Decrement every index in the current special indexes array <= to the updated index
            //If the character deleted was actually one of the special characters, remove it from the array.
            indexesToSet = this.state.specialCharIndexesToDisregard.map((i: number) => {
                if (i >= updatedIndex) {
                    return i - 1;
                } else if (i == updatedIndex) {
                    //do nothing. We dont want this number anymore
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
        let current: string = this.state.payloadVal;
        for (let i = this.state.dropdownIndex + 1; i < text.length; i++) {
            if (text[i] !== " " && text[i] !== "") {
                word += text[i]
            } else {
                break;
            }
        }
        return word;
    }
    checkForSpecialCharacters(text: string, specialIndexes: number[], dropdownRemoved?: boolean) {
        let pixels: number = 0;
        if (this.state.displayDropdown === false || (dropdownRemoved && dropdownRemoved === true)) {
            //we only care about $ if dropdown isnt displayed yet
            for (let letter of text) {
                if (letter === "$") {
                    let indexFound: number = specialIndexes.find(i => i == pixels);
                    if (!indexFound) {
                        this.setState({
                            displayDropdown: true,
                            dropdownIndex: pixels
                        })
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

    onFilterChanged(filterText: string, tagList: EntityPickerObject[]) {
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
        this.setState({
            negEntitiesVal: items
        })
    }
    handleChangeSuggestedEntities(items: EntityPickerObject[]) {
        this.setState({
            suggEntitiesVal: items
        })
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
    findIndexOfLastCharacterFollowingSpecialCharacterPreSpace(): number {
        let word: string = "";
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
        let specialIndexes: number[] = [];
        //dont add the entity if weve already manually entered it into the required picker
        let foundEntityPickerObj: EntityPickerObject = this.state.reqEntitiesVal.find((e: EntityPickerObject) => e.name == obj.text);
        let newRequiredEntities: EntityPickerObject[] = foundEntityPickerObj ? this.state.reqEntitiesVal : [...this.state.reqEntitiesVal, { key: obj.text, name: obj.text }];
        specialIndexes = [...this.state.specialCharIndexesToDisregard, this.state.dropdownIndex]
        this.setState({
            specialCharIndexesToDisregard: specialIndexes,
            reqEntitiesVal: newRequiredEntities,
            defaultRequiredEntities: newRequiredEntities,
            entitySuggestFilterText: "",
            requiredTagPickerKey: this.state.requiredTagPickerKey + 1,
            defaultNegativeEntities: this.state.negEntitiesVal,
            negativeTagPickerKey: this.state.negativeTagPickerKey + 1
        })
        let newPayload = this.updatePayloadWithEntitySuggestion(obj.text);
        this.reInitializeDropdown();
        this.checkForSpecialCharacters(newPayload, specialIndexes, true);
    }
    render() {
        let entitySuggestStyle: {};
        let entitySuggestOptions: {}[] = [];
        if (this.state.displayDropdown === true) {
            let index = this.state.dropdownIndex * 0;
            //we need to write some method that dynamically sets index depending on the letters before $ and the pixels each letter takes up
            let pixels: string = index.toString().concat("px");
            entitySuggestStyle = {
                marginLeft: pixels,
                marginTop: "-7px",
                maxWidth: "12em"
            }
            let entities: EntityBase[] = this.props.entities.filter((e: EntityBase) => e.entityName.toLowerCase().includes(this.state.entitySuggestFilterText.toLowerCase()));
            entitySuggestOptions = entities.map((e: EntityBase) => {
                return {
                    key: e.entityName,
                    text: e.entityName
                }
            })
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
                    data-automation-id='randomID9'
                    className="grayButton"
                    disabled={false}
                    onClick={() => this.props.handleOpenDeleteModal(this.props.blisAction.actionId)}
                    ariaDescription='Delete'
                    text='Delete'
                />
        } else {
            title = "Create an Action"
            createButtonText = "Create"
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
                        <TextFieldPlaceholder
                            id={"actionPayload"}
                            onGetErrorMessage={this.checkPayload.bind(this)}
                            onChanged={this.payloadChanged.bind(this)}
                            label="Payload"
                            placeholder="Payload..."
                            value={this.state.payloadVal} />
                        <Dropdown
                            options={entitySuggestOptions}
                            selectedKey={this.state.actionTypeVal}
                            style={entitySuggestStyle}
                            onChanged={this.entitySuggestionSelected.bind(this)}
                        />
                        <Label>Required Entities</Label>
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
                        <Label>Negative Entities</Label>
                        <TagPicker
                            onResolveSuggestions={this.onFilterChanged.bind(this)}
                            getTextFromItem={(item) => { return item.name; }}
                            onChange={this.handleChangeNegativeEntities.bind(this)}
                            key={this.state.negativeTagPickerKey}
                            pickerSuggestionsProps={
                                {
                                    suggestionsHeaderText: 'Entities',
                                    noResultsFoundText: 'No Entities Found'
                                }
                            }
                            defaultSelectedItems={this.state.defaultNegativeEntities}
                        />
                        <Label>Suggested Entities</Label>
                        <TagPicker
                            onResolveSuggestions={this.onFilterChanged.bind(this)}
                            getTextFromItem={(item) => { return item.name; }}
                            onChange={this.handleChangeSuggestedEntities.bind(this)}
                            key={this.state.suggestedTagPickerKey}
                            pickerSuggestionsProps={
                                {
                                    suggestionsHeaderText: 'Entities',
                                    noResultsFoundText: 'No Entities Found'
                                }
                            }
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
                            className='goldButton'
                            ariaDescription='Create'
                            text={createButtonText}
                        />
                        <CommandButton
                            data-automation-id='randomID7'
                            className="grayButton"
                            disabled={false}
                            onClick={this.handleClose.bind(this)}
                            ariaDescription='Cancel'
                            text='Cancel'
                        />
                        <CommandButton
                            data-automation-id='randomID8'
                            className="goldButton actionCreatorCreateEntityButton"
                            disabled={false}
                            onClick={this.handleOpenEntityModal.bind(this)}
                            ariaDescription='Cancel'
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
        entities: state.entities
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