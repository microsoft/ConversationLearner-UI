/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import * as React from 'react'
import * as OF from 'office-ui-fabric-react'
import * as Util from '../../Utils/util'
import * as CLM from '@conversationlearner/models'
import { injectIntl, InjectedIntlProps } from 'react-intl'
import { FM } from '../../react-intl-messages'
import { Position } from 'office-ui-fabric-react/lib/utilities/positioning'
import { PreBuilts } from 'src/types'
import { conditionDisplay, convertConditionToConditionalTag, isConditionEqual } from '../../Utils/actionCondition'
import './ConditionModal.css'

const entityIsAllowedInCondition = (entity: CLM.EntityBase): boolean => {
    if (entity.entityType === CLM.EntityType.ENUM) {
        return true
    }

    if (entity.entityType === CLM.EntityType.LUIS
        && entity.resolverType === PreBuilts.Number
        && entity.isResolutionRequired === true) {
        return true
    }

    if (entity.isMultivalue === true) {
        return true
    }

    return false
}

interface EntityOption extends OF.IDropdownOption {
    data: CLM.EntityBase
}

const convertEntityToDropdownOption = (entity: CLM.EntityBase): EntityOption => {
    let secondaryInfo = entity.entityType === CLM.EntityType.ENUM
        ? `enum`
        : entity.isMultivalue
            ? 'multi'
            : 'single'

    return {
        key: entity.entityId,
        text: `${entity.entityName} - ${secondaryInfo}`,
        data: entity,
    }
}

interface OperatorOption extends OF.IDropdownOption {
    data: CLM.ConditionType
}

const convertConditionTypesToDropdownOptions = (conditionTypes: object): OperatorOption[] => {
    return Object.keys(conditionTypes)
        .map((conditionType: string) => {
            let conditionText = `unknown`
            if (conditionDisplay?.[conditionType]) {
                conditionText = conditionDisplay[conditionType]
            }

            return {
                key: conditionType,
                text: conditionText,
                data: conditionTypes[conditionType],
            }
        })
}

const operatorOptions = convertConditionTypesToDropdownOptions(CLM.ConditionType)
// We know EQUAL will be found since it was created from enum type in line above
const equalOperatorOption = operatorOptions.find(o => o.data === CLM.ConditionType.EQUAL)!

interface EnumOption extends OF.IDropdownOption {
    data: CLM.EnumValue
}

// Enum here refers to Enum values on Entities
const convertEnumValueToDropdownOption = (enumValue: CLM.EnumValue): EnumOption => {
    // TODO: Fix types to avoid this. EnumValues on Entities should be guaranteed to exist.
    // Only don't exist during temporary creation
    if (!enumValue.enumValueId) {
        throw new Error(`Enum value must have id. When attempting to convert enum value to dropdown option, value did not have id. Perhaps it was not saved.`)
    }

    return {
        key: enumValue.enumValueId,
        text: enumValue.enumValue,
        data: enumValue,
    }
}

type Props = InjectedIntlProps
    & {
        condition?: CLM.Condition,
        entities: CLM.EntityBase[],
        isOpen: boolean,
        conditions: CLM.Condition[],
        onClickCreate: (condition: CLM.Condition) => void,
        onClickCancel: () => void,
    }

const Component: React.FC<Props> = (props) => {
    // Entity Dropdown
    const entityOptions = props.entities
        .filter(entityIsAllowedInCondition)
        .map(e => convertEntityToDropdownOption(e))
        .sort((a, b) => a.text.localeCompare(b.text))

    const [selectedEntityOption, setSelectedEntityOption] = React.useState(entityOptions[0])
    React.useEffect(() => {
        if (entityOptions.length > 0) {
            setSelectedEntityOption(entityOptions[0])
        }
    }, [props.entities])

    const onChangeEntity = (event: React.FormEvent<HTMLDivElement>, option?: EntityOption | undefined, index?: number | undefined) => {
        if (!option) {
            return
        }

        setSelectedEntityOption(option)
    }

    // Operator Dropdown
    const [selectedOperatorOption, setSelectedOperatorOption] = React.useState(equalOperatorOption)
    const onChangeOperator = (event: React.FormEvent<HTMLDivElement>, option?: OperatorOption) => {
        if (!option) {
            return
        }

        setSelectedOperatorOption(option)
    }

    // Value
    const [showNumberValue, setShowNumberValue] = React.useState(true)
    const [numberValue, setNumberValue] = React.useState(0)
    const [enumValueOptions, setEnumValueOptions] = React.useState<EnumOption[]>([])
    const [selectedEnumValueOption, setSelectedEnumValueOption] = React.useState<EnumOption>()
    React.useLayoutEffect(() => {
        if (enumValueOptions.length > 0) {
            setSelectedEnumValueOption(enumValueOptions[0])
        }
    }, [enumValueOptions])

    const onChangeEnumValueOption = (event: React.FormEvent<HTMLDivElement>, option?: EnumOption) => {
        if (!option) {
            return
        }

        setSelectedEnumValueOption(option)
    }

    const [isCreateDisabled, setIsCreateDisabled] = React.useState(false)

    // If entity selected is ENUM show possible values in dropdown
    // Otherwise, show number input
    React.useEffect(() => {
        if (!selectedEntityOption) {
            return
        }

        const entity = selectedEntityOption.data
        if (entity.entityType === CLM.EntityType.ENUM && entity.enumValues) {
            const valueOptions = entity.enumValues.map(ev => convertEnumValueToDropdownOption(ev))
            setEnumValueOptions(valueOptions)
            // Only allow equal operator when selecting enum
            setSelectedOperatorOption(equalOperatorOption)
            setShowNumberValue(false)
        }
        else {
            setShowNumberValue(true)
        }
    }, [selectedEntityOption])

    // If any of inputs change, recompute validity
    React.useEffect(() => {
        const isValid = Boolean(selectedEntityOption)
            && Boolean(selectedOperatorOption)
            && (showNumberValue
                || Boolean(selectedEnumValueOption))

        setIsCreateDisabled(!isValid)
    }, [selectedEntityOption, selectedOperatorOption, numberValue, selectedEnumValueOption])

    // If condition is present we must be editing
    // Set all options to those on condition
    const condition = props.condition
    React.useEffect(() => {
        if (!condition) {
            return
        }

        const matchingEntityOption = entityOptions.find(eo => eo.data.entityId === condition.entityId)
        if (matchingEntityOption) {
            setSelectedEntityOption(matchingEntityOption)
        }

        // TODO: Fix weird naming, why do conditions objects have condition property?! same with enum value objects
        const matchOperatorOption = operatorOptions.find(o => o.data === condition.condition)
        if (matchOperatorOption) {
            setSelectedOperatorOption(matchOperatorOption)
        }

        if (condition.valueId) {
            const matchingEnumOption = enumValueOptions.find(o => o.data.enumValueId === condition.valueId)
            if (matchingEnumOption) {
                setSelectedEnumValueOption(matchingEnumOption)
            }
        }

        if (condition.value) {
            setNumberValue(condition.value)
        }
    }, [props.condition])

    // If modal has opened (from false to true)
    React.useLayoutEffect(() => {
        if (props.isOpen) {
            // Reset operator and value
            setSelectedOperatorOption(equalOperatorOption)
            setNumberValue(0)
        }
    }, [props.isOpen])

    const createConditionFromState = () => {
        if (!selectedEntityOption
            || !selectedOperatorOption) {
            return
        }

        const conditionFromState: CLM.Condition = {
            entityId: selectedEntityOption.data.entityId,
            condition: selectedOperatorOption.data
        }

        if (showNumberValue) {
            conditionFromState.value = numberValue
        }
        else if (selectedEnumValueOption) {
            // TODO: Fix enum types
            conditionFromState.valueId = selectedEnumValueOption.data.enumValueId!
        }

        return conditionFromState
    }

    const onClickCreate = () => {
        const conditionFromState = createConditionFromState()
        if (conditionFromState) {
            props.onClickCreate(conditionFromState)
        }
        else {
            console.warn(`User attempted to create condition but condition did not exist. Usually means there is bad state calculation in modal.`)
        }
    }

    const onClickCancel = () => {
        props.onClickCancel()
    }

    const onClickExistingCondition = (theCondition: CLM.Condition) => {
        props.onClickCreate(theCondition)
    }

    const isOperatorDisabled = selectedEntityOption?.data.entityType === CLM.EntityType.ENUM
    const conditionsUsingEntity = props.conditions.filter(c => c.entityId === selectedEntityOption.key)
    const currentCondition = createConditionFromState()

    return <OF.Modal
        isOpen={props.isOpen}
        containerClassName="cl-modal cl-modal--medium"
    >
        <div className="cl-modal_header" data-testid="condition-creator-modal-title">
            <span className={OF.FontClassNames.xxLarge}>
                {props.condition
                    ? 'Edit Condition'
                    : 'Create a Condition'}
            </span>
        </div>

        <div className="cl-modal_body">
            <div>
                {entityOptions.length === 0
                    ? <p data-testid="condition-creator-modal-warning" className="cl-text--warning"><OF.Icon iconName='Warning' /> You may only create conditions on enum entities or those with resolver type number which is required. Your model does not have either type available. Please create either of these types of entities to create a condition.</p>
                    : <>
                        <h2 style={{ fontWeight: OF.FontWeights.semibold as number }} className={OF.FontClassNames.large}>Current Condition:</h2>
                        <div className="cl-condition-creator__expression">
                            <OF.Dropdown
                                label="Entity"
                                data-testid="condition-creator-modal-dropdown-entity"
                                selectedKey={selectedEntityOption?.key}
                                disabled={props.condition !== undefined}
                                options={entityOptions}
                                onChange={onChangeEntity}
                            />
                            <OF.Dropdown
                                label="Operator"
                                data-testid="condition-creator-modal-dropdown-operator"
                                selectedKey={selectedOperatorOption.key}
                                disabled={isOperatorDisabled}
                                options={operatorOptions}
                                onChange={onChangeOperator}
                            />
                            {/* Little awkward to checkEnumValueOption here, but do it for type safety */}
                            {(showNumberValue || !selectedEnumValueOption)
                                ? <div data-testid="condition-creator-modal-dropdown-numbervalue">
                                    <OF.Label>Number</OF.Label>
                                    <OF.SpinButton
                                        max={Number.MAX_SAFE_INTEGER}
                                        min={Number.MIN_SAFE_INTEGER}
                                        value={numberValue.toString()}
                                        onBlur={(event: React.FocusEvent<HTMLInputElement>) => {
                                            const value = parseInt(event.target.value, 10)
                                            if (!Number.isNaN(value)) {
                                                setNumberValue(value)
                                            }
                                        }}
                                        onDecrement={v => setNumberValue(prevValue => prevValue - 1)}
                                        onIncrement={v => setNumberValue(prevValue => prevValue + 1)}
                                        labelPosition={Position.bottom}
                                        step={1}
                                    />
                                </div>
                                : <OF.Dropdown
                                    label="Enum Value"
                                    data-testid="condition-creator-modal-dropdown-enumvalue"
                                    selectedKey={selectedEnumValueOption.key}
                                    options={enumValueOptions}
                                    onChange={onChangeEnumValueOption}
                                />}
                        </div>

                        <h2 style={{ fontWeight: OF.FontWeights.semibold as number }} className={OF.FontClassNames.large}>Existing Conditions:</h2>
                        <div className="cl-condition-creator__existing-conditions" data-testid="condition-creator-existing-conditions">
                            {conditionsUsingEntity.map(cond => {
                                const conditionalTag = convertConditionToConditionalTag(cond, props.entities)
                                const isActive = currentCondition
                                    ? isConditionEqual(cond, currentCondition)
                                    : false

                                return <React.Fragment key={conditionalTag.key}>
                                    <div
                                        className="cl-condition-creator__existing-condition"
                                        data-testid="condition-creator-modal-existing-condition"
                                    >
                                        {conditionalTag.name}
                                    </div>

                                    <OF.DefaultButton
                                        data-testid="condition-creator-modal-button-use-condition"
                                        onClick={() => onClickExistingCondition(conditionalTag.condition!)}
                                    >
                                        Use Condition
                                    </OF.DefaultButton>

                                    <div>
                                        {isActive
                                            && <OF.Icon
                                                className="cl-text--success"
                                                data-testid="condition-creator-modal-existing-condition-match"
                                                iconName="Accept"
                                            />}
                                    </div>
                                </React.Fragment>
                            })}
                        </div>
                    </>
                }
            </div>
        </div>

        <div className="cl-modal_footer cl-modal-buttons">
            <div className="cl-modal-buttons_secondary" />
            <div className="cl-modal-buttons_primary">
                <OF.PrimaryButton
                    data-testid="condition-creator-button-create"
                    disabled={isCreateDisabled}
                    onClick={onClickCreate}
                    ariaDescription={props.condition
                        ? Util.formatMessageId(props.intl, FM.BUTTON_SAVE_EDIT)
                        : Util.formatMessageId(props.intl, FM.BUTTON_CREATE)}
                    text={props.condition
                        ? Util.formatMessageId(props.intl, FM.BUTTON_SAVE_EDIT)
                        : Util.formatMessageId(props.intl, FM.BUTTON_CREATE)}
                    iconProps={{ iconName: 'Accept' }}
                />

                <OF.DefaultButton
                    data-testid="condition-creator-button-cancel"
                    onClick={onClickCancel}
                    ariaDescription={Util.formatMessageId(props.intl, FM.BUTTON_CANCEL)}
                    text={Util.formatMessageId(props.intl, FM.BUTTON_CANCEL)}
                    iconProps={{ iconName: 'Cancel' }}
                />
            </div>
        </div>
    </OF.Modal>
}

export default injectIntl(Component)