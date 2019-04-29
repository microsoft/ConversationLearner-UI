/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as React from 'react';
import * as CLM from '@conversationlearner/models'
import * as OF from 'office-ui-fabric-react';
import { returntypeof } from 'react-redux-typescript';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { State } from '../../types';
import FormattedMessageId from '../FormattedMessageId'
import { injectIntl, InjectedIntlProps } from 'react-intl'
import { Modal } from 'office-ui-fabric-react/lib/Modal'
import { FM } from '../../react-intl-messages'
import './TeachSessionInitState.css'

interface ComponentState {
    filledEntityMap: CLM.FilledEntityMap
}

class TeachSessionInitState extends React.Component<Props, ComponentState> {

    constructor(props: Props) {
        super(props)
        this.state = { 
            filledEntityMap: new CLM.FilledEntityMap() 
        }
    }

    componentWillReceiveProps(newProps: Props) {
        if (this.props.isOpen !== newProps.isOpen) {
            this.setState({filledEntityMap: this.props.initMemories || new CLM.FilledEntityMap()})
        }
    }

    @OF.autobind
    onClickCancel() {
        this.props.handleClose()
    }

    @OF.autobind
    onClickSubmit() {
        // Remove any empty items
        for (const entityName of Object.keys(this.state.filledEntityMap.map)) {
            const filledEntity = this.state.filledEntityMap.map[entityName]
            filledEntity.values = filledEntity.values.filter(entityValue => entityValue.userText !== '' || entityValue.enumValueId)
            if (filledEntity.values.length === 0) {
                delete this.state.filledEntityMap.map[entityName]
            }
        }

        this.props.handleClose(this.state.filledEntityMap)
    }

    @OF.autobind
    onClickAdd(entity: CLM.EntityBase) {
        const memoryValue: CLM.MemoryValue = {
            userText: '',
            displayText: null,
            builtinType: null,
            resolution: {}
        }
        const map = this.state.filledEntityMap.map

        if (!map[entity.entityName]) {
            map[entity.entityName] = {
                entityId: entity.entityId,
                values: [memoryValue]
            }
        }
        else {
            map[entity.entityName].values.push(memoryValue);
        }
        this.setState({ filledEntityMap: this.state.filledEntityMap })
    }

    @OF.autobind
    onClickRemove(index: number, entity: CLM.EntityBase) {
        const map = this.state.filledEntityMap.map
        map[entity.entityName].values.splice(index, 1)
        if (map[entity.entityName].values.length === 0) {
            delete map[entity.entityName]
        }
        this.setState({ filledEntityMap: this.state.filledEntityMap })
    }
 
    onEnumChanged(item: OF.IDropdownOption, entity: CLM.EntityBase) {
        this.state.filledEntityMap.map[entity.entityName].values[0].displayText = item.text
        this.state.filledEntityMap.map[entity.entityName].values[0].userText = item.text
        this.state.filledEntityMap.map[entity.entityName].values[0].enumValueId = item.key as string
        this.setState({filledEntityMap: this.state.filledEntityMap})
    }

    onChanged(index: number, text: string, entity: CLM.EntityBase) {  
        this.state.filledEntityMap.map[entity.entityName].values[index].userText = text
        this.setState({ filledEntityMap: this.state.filledEntityMap })
    }

    render() {
        const { intl } = this.props

        return (
            <Modal
                isOpen={this.props.isOpen}
                isBlocking={true}
                containerClassName="cl-modal cl-modal--medium"
            >
                <div className="cl-modal_header">
                    <span className={OF.FontClassNames.xxLarge}>
                        <FormattedMessageId id={this.props.initMemories ? FM.TEACHSESSIONSTUB_TITLE : FM.TEACHSESSIONINIT_TITLE} />
                    </span>
                </div>
                <div>
                    {
                        this.props.entities
                            // Filter out negative entities and entities that should not be memorized                            
                            .filter(entity => !entity.positiveId && !entity.doNotMemorize)
                            .map(entity => {
                                return (
                                    <div className="teachInitBlock" key={entity.entityId}>
                                        <OF.IconButton
                                            className="cl-icon-plain"
                                            data-testid="teach-session-add-initial-value"
                                            disabled={!entity.isMultivalue && this.state.filledEntityMap.map[entity.entityName] !== undefined}
                                            onClick={() => this.onClickAdd(entity)}
                                            ariaDescription="Add Initial Value"
                                            iconProps={{ iconName: 'AddTo' }}
                                        />
                                        <OF.Label className="cl-label cl-font--emphasis" data-testid="teach-session-entity-name">{entity.entityName}</OF.Label>
                                        {this.state.filledEntityMap.map[entity.entityName] &&
                                            this.state.filledEntityMap.map[entity.entityName].values.map((memoryValue, index) => {
                                                const key = `${entity.entityId}+${index}`
                                                return (
                                                <div key={key}>
                                                    <OF.IconButton
                                                        className="cl-float-left"
                                                        data-testid="teach-session-delete-button"
                                                        onClick={() => this.onClickRemove(index, entity)}
                                                        ariaDescription="Remove Value"
                                                        iconProps={{ iconName: 'Delete' }}
                                                    />
                                                    {entity.entityType === CLM.EntityType.ENUM ?
                                                        <OF.Dropdown
                                                            className="cl-input--inline"
                                                            selectedKey={memoryValue.enumValueId || undefined}
                                                            onChanged={item => this.onEnumChanged(item, entity)}
                                                            options={entity.enumValues!.map<OF.IDropdownOption>(ev => {
                                                                return {
                                                                    key: ev.enumValueId!,
                                                                    text: ev.enumValue!
                                                                }
                                                            })}
                                                        />
                                                    :
                                                        <OF.TextField
                                                            data-testid="teach-session-initial-value"
                                                            className="cl-input--inline"
                                                            key={key}
                                                            onChanged={text => this.onChanged(index, text, entity)}
                                                            placeholder={intl.formatMessage({
                                                                id: FM.TEACHSESSIONINIT_INPUT_PLACEHOLDER,
                                                                defaultMessage: "Initial Value..."
                                                            })}
                                                            value={memoryValue.userText || ''}
                                                        />
                                                    }
                                                </div>
                                                )
                                            })
                                        }
                                    </div>
                                )
                            }
                            )
                    }
                </div>
                <div className="cl-modal_footer cl-modal_footer--border">
                    <div className="cl-modal-buttons">
                        <div className="cl-modal-buttons_primary">
                            <OF.PrimaryButton
                                data-testid="teach-session-ok-button"
                                onClick={this.onClickSubmit}
                                ariaDescription={intl.formatMessage({
                                    id: FM.BUTTON_OK,
                                    defaultMessage: 'Ok'
                                })}
                                text={intl.formatMessage({
                                    id: FM.BUTTON_OK,
                                    defaultMessage: 'Ok'
                                })}
                                iconProps={{ iconName: 'Accept' }}
                            />
                            <OF.DefaultButton
                                data-testid="teach-session-cancel-button"
                                onClick={this.onClickCancel}
                                ariaDescription={intl.formatMessage({
                                    id: FM.BUTTON_CANCEL,
                                    defaultMessage: 'Cancel'
                                })}
                                text={intl.formatMessage({
                                    id: FM.BUTTON_CANCEL,
                                    defaultMessage: 'Cancel'
                                })}
                                iconProps={{ iconName: 'Cancel' }}
                            />
                        </div>
                    </div>
                </div>
            </Modal>
        );
    }
}

const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
    }, dispatch);
}
const mapStateToProps = (state: State) => {
    return {
        entities: state.entities
    }
}

export interface ReceivedProps {
    isOpen: boolean,
    initMemories: CLM.FilledEntityMap | null
    handleClose: (filledEntityMap?: CLM.FilledEntityMap) => void
}

// Props types inferred from mapStateToProps & dispatchToProps
const stateProps = returntypeof(mapStateToProps);
const dispatchProps = returntypeof(mapDispatchToProps);
type Props = typeof stateProps & typeof dispatchProps & ReceivedProps & InjectedIntlProps

export default connect<typeof stateProps, typeof dispatchProps, ReceivedProps>(mapStateToProps, mapDispatchToProps)(injectIntl(TeachSessionInitState))
