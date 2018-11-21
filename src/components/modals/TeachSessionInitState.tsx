/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as React from 'react';
import { returntypeof } from 'react-redux-typescript';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { State } from '../../types';
import FormattedMessageId from '../FormattedMessageId'
import { injectIntl, InjectedIntlProps } from 'react-intl'
import { Modal } from 'office-ui-fabric-react/lib/Modal';
import { autobind } from 'office-ui-fabric-react/lib/Utilities'
import * as OF from 'office-ui-fabric-react';
import { FM } from '../../react-intl-messages'
import { FilledEntityMap, EntityBase, MemoryValue } from '@conversationlearner/models'
import './TeachSessionInitState.css';

interface ComponentState {
    filledEntityMap: FilledEntityMap
}

class TeachSessionInitState extends React.Component<Props, ComponentState> {

    constructor(props: Props) {
        super(props)
        this.state = { filledEntityMap: new FilledEntityMap() }
    }

    componentWillReceiveProps(newProps: Props) {
        if (this.props.isOpen !== newProps.isOpen) {
            this.setState({filledEntityMap: new FilledEntityMap()})
        }
    }

    @autobind
    onClickCancel() {
        this.props.handleClose()
    }

    @autobind
    onClickSubmit() {
        // Remove any empty items
        for (let entityName of Object.keys(this.state.filledEntityMap.map)) {
            let filledEntity = this.state.filledEntityMap.map[entityName]
            filledEntity.values = filledEntity.values.filter(entityValue => entityValue.userText !== '')
            if (filledEntity.values.length === 0) {
                delete this.state.filledEntityMap.map[entityName]
            }
        }

        this.props.handleClose(this.state.filledEntityMap)
    }

    @autobind
    onClickAdd(entity: EntityBase) {
        let memoryValue: MemoryValue = {
            userText: '',
            displayText: null,
            builtinType: null,
            resolution: {}
        }
        let map = this.state.filledEntityMap.map

        if (!map[entity.entityName]) {
            map[entity.entityName] = { 
                entityId: entity.entityId,
                values: [memoryValue]
            } 
        }
        else {
            map[entity.entityName].values.push(memoryValue);
        }
        this.setState({filledEntityMap: this.state.filledEntityMap})
    }

    @autobind
    onClickRemove(index: number, entity: EntityBase) {
        let map = this.state.filledEntityMap.map
        map[entity.entityName].values.splice(index, 1)
        if (map[entity.entityName].values.length === 0) {
            delete map[entity.entityName]
        }
        this.setState({filledEntityMap: this.state.filledEntityMap})
    }

    onChanged(index: number, text: string, entity: EntityBase) {  
        this.state.filledEntityMap.map[entity.entityName].values[index].userText = text
        this.setState({filledEntityMap: this.state.filledEntityMap})
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
                        <FormattedMessageId id={FM.TEACHSESSIONINIT_TITLE} />
                        </span>
                    </div>
                <div>
                    {
                        this.props.entities
                            // Filter out negative entities and entities that should not be memorized                            
                            .filter(entity => entity.positiveId === undefined && !entity.doNotMemorize)
                            .map(entity => {
                                return (
                                    <div className="teachInitBlock" key={entity.entityId}>
                                        <OF.IconButton
                                            data-testid="teach-session-add-initial-value"
                                            disabled={!entity.isMultivalue && this.state.filledEntityMap.map[entity.entityName] !== undefined}
                                            onClick={() => this.onClickAdd(entity)}
                                            ariaDescription="Add Initial Value"
                                            iconProps={{ iconName: 'CirclePlus' }}
                                        />
                                        <OF.Label className="cl-label cl-font--emphasis" data-testid="teach-session-entity-name">{entity.entityName}</OF.Label>
                                        {this.state.filledEntityMap.map[entity.entityName] &&
                                            this.state.filledEntityMap.map[entity.entityName].values.map((memoryValue, index) => {
                                                let key = `${entity.entityId}+${index}`
                                                return (
                                                <div key={key}>
                                                    <OF.IconButton
                                                        data-testid="teach-session-delete-button"
                                                        onClick={() => this.onClickRemove(index, entity)}
                                                        ariaDescription="Remove Value"
                                                        iconProps={{ iconName: 'Delete' }}
                                                    />
                                                    <OF.TextField
                                                        data-testid="teach-session-initial-value"
                                                        className="cl-textfield--inline"
                                                        key={key}
                                                        onChanged={text => this.onChanged(index, text, entity)}
                                                        placeholder={intl.formatMessage({
                                                            id: FM.TEACHSESSIONINIT_INPUT_PLACEHOLDER,
                                                            defaultMessage: "Initial Value..."
                                                        })}
                                                        value={memoryValue.userText || ''}
                                                    />
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
    handleClose: (filledEntityMap?: FilledEntityMap) => void
}

// Props types inferred from mapStateToProps & dispatchToProps
const stateProps = returntypeof(mapStateToProps);
const dispatchProps = returntypeof(mapDispatchToProps);
type Props = typeof stateProps & typeof dispatchProps & ReceivedProps & InjectedIntlProps

export default connect<typeof stateProps, typeof dispatchProps, ReceivedProps>(mapStateToProps, mapDispatchToProps)(injectIntl(TeachSessionInitState))
