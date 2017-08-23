import * as React from 'react';
import { returntypeof } from 'react-redux-typescript';
import { createActionAsync } from '../actions/createActions';
import { editActionAsync } from '../actions/updateActions';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Modal } from 'office-ui-fabric-react/lib/Modal';
import { CommandButton, Dialog, DialogFooter, DialogType, ChoiceGroup, DefaultButton, Dropdown, TagPicker, Label, Checkbox } from 'office-ui-fabric-react';
import { TextFieldPlaceholder } from './TextFieldPlaceholder';
import { ActionBase, ActionMetaData, ActionTypes, EntityBase, EntityMetaData } from 'blis-models'
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
    waitVal: true,
    availableRequiredEntities: [] as EntityPickerObject[],
    availableNegativeEntities: [] as EntityPickerObject[],
    editing: false,
    defaultNegativeEntities: [] as EntityPickerObject[],
    defaultRequiredEntities: [] as EntityPickerObject[],
    entityModalOpen: false,
    open: false,
};

class ActionResponseCreatorEditor extends React.Component<Props, any> {
    constructor(p: Props) {
        super(p);
        this.state = initState;
        this.checkForSpecialCharacters = this.checkForSpecialCharacters.bind(this);
    }
    componentDidMount() {
        this.reInitializeDropdown();
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
                this.setState({
                    actionTypeVal: p.blisAction.metadata.actionType,
                    payloadVal: p.blisAction.payload,
                    reqEntitiesVal: requiredEntities,
                    negEntitiesVal: negativeEntities,
                    waitVal: p.blisAction.isTerminal,
                    availableRequiredEntities: entities,
                    availableNegativeEntities: entities,
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
    }
    reInitializeDropdown() {
        this.setState({
            displayDropdown: false,
            dropdownIndex: null,
            requiredEntity: true
        });
    }
    handleClose() {
        this.setState({ ...initState });
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
        let meta = new ActionMetaData({
            actionType: this.state.actionTypeVal
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
        this.checkForSpecialCharacters(text)
        this.setState({
            payloadVal: text
        })
    }
    checkForSpecialCharacters(text: string) {
        let pixels: number = 0;
        if (this.state.displayDropdown === false) {
            for (let letter of text) {
                if (letter === "$") {
                    this.setState({
                        displayDropdown: true,
                        dropdownIndex: pixels,
                        requiredEntity: true
                    })
                } else if (letter === "*") {
                    this.setState({
                        displayDropdown: true,
                        dropdownIndex: pixels,
                        requiredEntity: false
                    })
                }
                pixels++;
            }
        }
    }
    onFilterChanged(filterText: string, tagList: EntityPickerObject[]) {
        let entList = filterText ? this.state.availableRequiredEntities.filter((ent: EntityPickerObject) => ent.name.toLowerCase().indexOf(filterText.toLowerCase()) === 0).filter((item: EntityPickerObject) => !this.listContainsDocument(item, tagList)) : [];
        let usedEntities = this.state.reqEntitiesVal.concat(this.state.negEntitiesVal);
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
    render() {
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
                            onGetErrorMessage={this.checkPayload.bind(this)}
                            onChanged={this.payloadChanged.bind(this)}
                            label="Payload"
                            placeholder="Payload..."
                            value={this.state.payloadVal} />
                        <Label>Required Entities</Label>
                        <TagPicker
                            onResolveSuggestions={this.onFilterChanged.bind(this)}
                            getTextFromItem={(item) => { return item.name; }}
                            onChange={this.handleChangeRequiredEntities.bind(this)}
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
                            className='goldButton'
                            ariaDescription='Create'
                            text={createButtonText}
                        />
                        <CommandButton
                            data-automation-id='randomID7'
                            className="grayButton"
                            disabled={false}
                            onClick={() => this.props.handleClose(null)}
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