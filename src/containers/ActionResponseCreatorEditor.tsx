import * as React from 'react';
import { createAction } from '../actions/create';
import { editAction } from '../actions/update';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Modal } from 'office-ui-fabric-react/lib/Modal';
import { CommandButton, Dialog, DialogFooter, DialogType, ChoiceGroup, TextField, DefaultButton, Dropdown, TagPicker, Label } from 'office-ui-fabric-react';
import { Action, ActionMetadata } from '../models/Action';
import { ActionTypes } from '../models/Constants';
import { Entity } from '../models/Entity';
import { State } from '../types'


interface EntityPickerObject {
    key: string
    name: string
}
interface Props {
    open: boolean,
    action: Action | null,
    handleClose: Function
}
class ActionResponseCreatorEditor extends React.Component<any, any> {
    constructor(p: any) {
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
        }
    }
    componentWillReceiveProps(p: Props) {
        if (p.action === null) {
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
            })
        } else {
            let initWaitKey: string;
            if (p.action.waitAction == false) {
                initWaitKey = 'waitFalse'
            } else {
                initWaitKey = 'waitTrue'
            }
            let entities = this.props.entities.map((e: Entity) => {
                return {
                    key: e.name,
                    name: e.name
                }
            })
            let requiredEntities = p.action.positiveEntities.map((e: Entity) => {
                return {
                    key: e.name,
                    name: e.name
                }
            })
            let negativeEntities = p.action.negativeEntities.map((e: Entity) => {
                return {
                    key: e.name,
                    name: e.name
                }
            })
            this.setState({
                actionTypeVal: p.action.actionType,
                contentVal: p.action.content,
                reqEntitiesVal: requiredEntities,
                negEntitiesVal: negativeEntities,
                waitVal: p.action.waitAction,
                waitKey: initWaitKey,
                availableRequiredEntities: entities,
                availableNegativeEntities: entities,
                editing: true,
                defaultNegativeEntities: negativeEntities,
                defaultRequiredEntities: requiredEntities,
            })
        }

    }
    componentWillUpdate() {
        if (this.state.availableRequiredEntities.length != this.props.entities.length) {
            let entities = this.props.entities.map((e: Entity) => {
                return {
                    key: e.name,
                    name: e.name
                }
            })
            this.setState({
                availableRequiredEntities: entities
            })
        }
        if (this.state.availableNegativeEntities.length != this.props.entities.length) {
            let entities = this.props.entities.map((e: Entity) => {
                return {
                    key: e.name,
                    name: e.name
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
            availableNegativeEntities: []
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
        let randomGUID = this.generateGUID();
        let requiredEntities = this.state.reqEntitiesVal.map((req: EntityPickerObject) => {
            return this.props.entities.find((e: Entity) => e.name == req.key);
        })
        let negativeEntities = this.state.negEntitiesVal.map((neg: EntityPickerObject) => {
            return this.props.entities.find((e: Entity) => e.name == neg.key);
        })
        let internal = this.state.actionTypeVal == 'TEXT' ? true : false;
        let meta = new ActionMetadata(internal, null)
        let actionToAdd = new Action(randomGUID, this.state.actionTypeVal, this.state.contentVal, negativeEntities, requiredEntities, this.state.waitVal, meta, this.props.blisApps.current.modelID);
        if (this.state.editing === false) {
            this.props.createAction(actionToAdd);
        } else {
            this.editAction(actionToAdd);
        }
        this.handleClose();
        this.props.handleClose();
    }
    editAction(actionToAdd: Action) {
        actionToAdd.id = this.props.action.id;
        this.props.editAction(actionToAdd);
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
    render() {
        let actionTypeVals = Object.values(ActionTypes);
        let actionTypeOptions = actionTypeVals.map(v => {
            return {
                key: v,
                text: v
            }
        })
        let title: string;
        if (this.state.editing == true) {
            title = "Edit Action"
        } else {
            title = "Create an Action"
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
                        />
                        <TextField
                            onChanged={this.contentChanged.bind(this)}
                            label="Content"
                            placeholder="Content..."
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
                        />
                    </div>
                    <div className='modalFooter'>
                        <CommandButton
                            data-automation-id='randomID6'
                            disabled={false}
                            onClick={this.createAction.bind(this)}
                            className='goldButton'
                            ariaDescription='Create'
                            text='Create'
                        />
                        <CommandButton
                            data-automation-id='randomID7'
                            className="grayButton"
                            disabled={false}
                            onClick={() => this.props.handleClose()}
                            ariaDescription='Cancel'
                            text='Cancel'
                        />
                    </div>
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
const mapStateToProps = (state: State) => {
    return {
        actions: state.actions,
        blisApps: state.apps,
        entities: state.entities
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(ActionResponseCreatorEditor);