/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as React from 'react'
import * as CLM from '@conversationlearner/models'
import * as OF from 'office-ui-fabric-react'
import * as Util from '../../Utils/util'
import { returntypeof } from 'react-redux-typescript'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { State } from '../../types'
import { injectIntl, InjectedIntlProps } from 'react-intl'
import { FM } from '../../react-intl-messages'
import './TeachSessionInitState.css'

class MemorySetter extends React.Component<Props> {

    constructor(props: Props) {
        super(props)
    }

    @OF.autobind
    onClickAdd(entity: CLM.EntityBase) {
        const map = Util.deepCopy(this.props.map)
        this.addEntity(map, entity)
        this.props.onUpdate(map)
    }

    @OF.autobind
    onClickRemove(index: number, entity: CLM.EntityBase) {
        const map = Util.deepCopy(this.props.map)
        map[entity.entityName].values.splice(index, 1)
        if (map[entity.entityName].values.length === 0) {
            delete map[entity.entityName]
        }
        this.props.onUpdate(map)
    }

    @OF.autobind
    onClickNext(index: number, entity: CLM.EntityBase) {
        const editableEntities = this.getEditableEntities()
        const map = Util.deepCopy(this.props.map)

        // Remove value from entity
        const removedValue = map[entity.entityName].values.splice(index, 1)
        if (map[entity.entityName].values.length === 0) {
            delete map[entity.entityName]
        }

        // Insert on previous entity
        const removeIndex = editableEntities.findIndex(e => e.entityId === entity.entityId)
        let insertIndex = removeIndex + 1
        if (insertIndex === editableEntities.length) {
            insertIndex = 0
        }
        const insertEntity = editableEntities[insertIndex]
        this.insertValue(map, insertEntity, removedValue[0])
    }

    @OF.autobind
    onClickPrev(index: number, entity: CLM.EntityBase) {
        const editableEntities = this.getEditableEntities()
        const map = Util.deepCopy(this.props.map)

        // Remove value from entity
        const removedValue = map[entity.entityName].values.splice(index, 1)
        if (map[entity.entityName].values.length === 0) {
            delete map[entity.entityName]
        }

        // Insert on previous entity
        const removeIndex = editableEntities.findIndex(e => e.entityId === entity.entityId)
        let insertIndex = removeIndex - 1
        if (insertIndex < 0) {
            insertIndex = editableEntities.length - 1
        }
        const insertEntity = editableEntities[insertIndex]
        this.insertValue(map, insertEntity, removedValue[0])
    }

    insertValue(map: { [key: string]: CLM.FilledEntity }, entity: CLM.EntityBase, value: CLM.MemoryValue) {

        if (!map[entity.entityName]) {
            this.addEntity(map, entity)
            map[entity.entityName].values = [value]
        }
        else {
            map[entity.entityName].values.push(value)
        }
        this.props.onUpdate(map)
    }

    addEntity(map: { [key: string]: CLM.FilledEntity }, entity: CLM.EntityBase) {
        const memoryValue: CLM.MemoryValue = {
            userText: '',
            displayText: null,
            builtinType: null,
            resolution: {}
        }

        if (!map[entity.entityName]) {
            map[entity.entityName] = {
                entityId: entity.entityId,
                values: [memoryValue]
            }
        }
        else {
            map[entity.entityName].values.push(memoryValue);
        }
    }

    onEnumChanged(item: OF.IDropdownOption, entity: CLM.EntityBase) {
        const map = Util.deepCopy(this.props.map)
        map[entity.entityName].values[0].displayText = item.text
        map[entity.entityName].values[0].userText = item.text
        map[entity.entityName].values[0].enumValueId = item.key as string
        this.props.onUpdate(map)
    }

    onChanged(index: number, text: string, entity: CLM.EntityBase) {  
        const map = Util.deepCopy(this.props.map)
        map[entity.entityName].values[index].userText = text
        this.props.onUpdate(map)
    }

    // Filter out negative entities and entities that should not be memorized   
    getEditableEntities(): CLM.EntityBase[] {
        return this.props.entities.filter(entity => !entity.positiveId && !entity.doNotMemorize)
    }

    render() {
        const { intl } = this.props
        const editableEntities = this.getEditableEntities()
        return (
            <div>
                {editableEntities.map(entity => {
                    return (
                        <div className="cl-init-state-block" key={entity.entityId}>
                            <OF.Label className="cl-label cl-font--emphasis" data-testid="teach-session-entity-name">{entity.entityName}</OF.Label>
                            <OF.IconButton
                                className="cl-icon-plain"
                                data-testid="teach-session-add-initial-value"
                                disabled={!entity.isMultivalue && this.props.map[entity.entityName] !== undefined}
                                onClick={() => this.onClickAdd(entity)}
                                ariaDescription="Add Initial Value"
                                iconProps={{ iconName: 'AddTo' }}
                            />
                            {this.props.map[entity.entityName] &&
                                this.props.map[entity.entityName].values.map((memoryValue, index) => {
                                    const key = `${entity.entityId}+${index}`
                                    return (
                                    <div 
                                        className="cl-modal-buttons_primary" 
                                        key={key}
                                    >
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
                                                    defaultMessage: "Value..."
                                                })}
                                                value={memoryValue.userText || ''}
                                            />
                                        }
                                        {(editableEntities.length > 1) &&
                                            <OF.IconButton
                                                className="cl-icon-plain"
                                                onClick={() => this.onClickNext(index, entity)}
                                                ariaDescription="Move to next Entity"
                                                text=""
                                                iconProps={{ iconName: 'Down' }}
                                            /> 
                                        }
                                        {(editableEntities.length > 1) &&  
                                            <OF.IconButton
                                                className="cl-icon-plain"
                                                onClick={() => this.onClickPrev(index, entity)}
                                                ariaDescription="Move to previous Entity"
                                                text=""
                                                iconProps={{ iconName: 'Up' }}
                                            />
                                        }
                                        <OF.IconButton
                                            className="cl-icon-warning"
                                            onClick={() => this.onClickRemove(index, entity)}
                                            ariaDescription="Remove Value"
                                            iconProps={{ iconName: 'Delete' }}
                                        />
                                    </div>
                                    )
                                })
                            }
                        </div>
                    )}
                )}
            </div>
        )
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
    map: { [key: string]: CLM.FilledEntity }
    onUpdate: (filledEntityMap: { [key: string]: CLM.FilledEntity }) => void
}

// Props types inferred from mapStateToProps & dispatchToProps
const stateProps = returntypeof(mapStateToProps);
const dispatchProps = returntypeof(mapDispatchToProps);
type Props = typeof stateProps & typeof dispatchProps & ReceivedProps & InjectedIntlProps

export default connect<typeof stateProps, typeof dispatchProps, ReceivedProps>(mapStateToProps, mapDispatchToProps)(injectIntl(MemorySetter))
