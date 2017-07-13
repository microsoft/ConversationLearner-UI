import * as React from 'react';
import { createAction } from '../actions/createActions';
import { editAction } from '../actions/updateActions';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Modal } from 'office-ui-fabric-react/lib/Modal';
import { CommandButton, Dialog, DialogFooter, DialogType, ChoiceGroup, TextField, DefaultButton, Dropdown, TagPicker, Label } from 'office-ui-fabric-react';
import { ActionBase, ActionMetaData, ActionTypes, EntityBase, EntityMetaData } from 'blis-models'
import { State } from '../types';
import EntityCreatorEditor from './EntityCreatorEditor'

interface EntityPickerObject {
    key: string
    name: string
}
interface Props {
    open: boolean,
    blisAction: ActionBase | null,
    handleClose: Function
}
class ActionResponseCreatorEditor extends React.Component<any, any> {
    constructor(p: Props) {
        super(p);
        this.state = {
            actionTypeVal: 'TEXT',
            contentVal: '',
            reqEntitiesVal: [],
            negEntitiesVal: [],
            waitVal: false,
            waitKey: 'waitFalse',
            availableRequiredEntities: [],
            availableNegativeEntities: [],
            editing: false,
            defaultNegativeEntities: [],
            defaultRequiredEntities: [],
            entityModalOpen: false,
            open: false
        }
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
                this.setState({
                    actionTypeVal: 'TEXT',
                    contentVal: '',
                    reqEntitiesVal: [],
                    negEntitiesVal: [],
                    waitVal: false,
                    waitKey: 'waitFalse',
                    availableRequiredEntities: [],
                    availableNegativeEntities: [],
                    editing: false,
                    defaultNegativeEntities: [],
                    defaultRequiredEntities: [],
                    entityModalOpen: false,
                    open: p.open
                })
            } else {
                let initWaitKey: string;
                if (p.blisAction.isTerminal == true) {
                    initWaitKey = 'waitTrue'
                } else {
                    initWaitKey = 'waitFalse'
                }
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
                    contentVal: p.blisAction.payload,
                    reqEntitiesVal: requiredEntities,
                    negEntitiesVal: negativeEntities,
                    waitVal: p.blisAction.isTerminal,
                    waitKey: initWaitKey,
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
    handleClose() {
        this.setState({
            open: false,
            actionTypeVal: 'TEXT',
            contentVal: '',
            reqEntitiesVal: [],
            negEntitiesVal: [],
            waitVal: false,
            waitKey: 'waitFalse',
            availableRequiredEntities: [],
            availableNegativeEntities: [],
            entityModalOpen: false
        })
    }
    generateGUID(): string {
        let d = new Date().getTime();
        let guid: string = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
            let r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (char == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
        return guid;
    }
    createAction() {
        let currentAppId: string = this.props.blisApps.current.appId;
        let randomGUID = this.generateGUID();
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
            actionId: randomGUID,
            payload: this.state.contentVal,
            negativeEntities: negativeEntities,
            requiredEntities: requiredEntities,
            isTerminal: this.state.waitVal,
            metadata: meta,
            version: null,
            packageCreationId: null,
            packageDeletionId: null
        })
        if (this.state.editing === false) {
            this.props.createAction(actionToAdd, currentAppId);
        } else {
            this.editAction(actionToAdd, currentAppId);
        }
        this.handleClose();
        this.props.handleClose();
    }
    editAction(actionToAdd: ActionBase, currentAppId: string) {
        actionToAdd.actionId = this.props.blisAction.actionId;
        this.props.editAction(actionToAdd, currentAppId);
    }
    waitChanged(event: any, option: { text: string }) {
        if (option.text == 'False') {
            this.setState({
                waitVal: false,
                waitKey: 'waitFalse'
            })
        } else {
            this.setState({
                waitVal: true,
                waitKey: 'waitTrue'
            })
        }
    }
    actionTypeChanged(obj: { text: string }) {
        this.setState({
            actionTypeVal: obj.text,
        })
    }
    contentChanged(text: string) {
        this.setState({
            contentVal: text
        })
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
        let createButtonText: string
        if (this.state.editing == true) {
            title = "Edit Action"
            createButtonText = "Save"
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
                        <TextField
                            onChanged={this.contentChanged.bind(this)}
                            label="Payload"
                            placeholder="Payload..."
                            value={this.state.contentVal} />
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
                        <ChoiceGroup
                            options={[
                                {
                                    key: 'waitTrue',
                                    text: 'True',
                                },
                                {
                                    key: 'waitFalse',
                                    text: 'False',
                                }
                            ]}
                            label='Wait For Response?'
                            onChange={this.waitChanged.bind(this)}
                            selectedKey={this.state.waitKey}
                            disabled={this.state.editing}
                        />
                    </div>
                    <div className="modalFooter">
                        <CommandButton
                            data-automation-id='randomID6'
                            disabled={false}
                            onClick={this.createAction.bind(this)}
                            className='goldButton'
                            ariaDescription='Create'
                            text={createButtonText}
                        />
                        <CommandButton
                            data-automation-id='randomID7'
                            className="grayButton"
                            disabled={false}
                            onClick={() => this.props.handleClose()}
                            ariaDescription='Cancel'
                            text='Cancel'
                        />
                        <CommandButton
                            data-automation-id='randomID7'
                            className="goldButton actionCreatorCreateEntityButton"
                            disabled={false}
                            onClick={this.handleOpenEntityModal.bind(this)}
                            ariaDescription='Cancel'
                            text='Entity'
                            iconProps={{ iconName: 'CirclePlus' }}
                        />
                    </div>
                    <EntityCreatorEditor open={this.state.entityModalOpen} entity={null} handleClose={this.handleCloseEntityModal.bind(this)} />
                </Modal>
            </div>
        );
    }
}
const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
        createAction: createAction,
        editAction: editAction
    }, dispatch);
}
const mapStateToProps = (state: State, ownProps: any) => {
    return {
        actions: state.actions,
        blisApps: state.apps,
        entities: state.entities
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(ActionResponseCreatorEditor as React.ComponentClass<any>)