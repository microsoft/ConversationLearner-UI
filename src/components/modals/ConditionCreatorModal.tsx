import * as React from 'react'
import * as OF from 'office-ui-fabric-react'
import * as Util from '../../Utils/util'
import * as CLM from '@conversationlearner/models'
import { injectIntl, InjectedIntlProps } from 'react-intl'
import { FM } from '../../react-intl-messages'
import './ConditionCreatorModal.css'
import { Position } from 'office-ui-fabric-react/lib/utilities/positioning'

enum Operator {
    GreaterThan = '>',
    GreaterThanEquals = '>=',
    LessThan = '<',
    LessThanEquals = '<=',
    Equals = '=',
    NotEquals = '!=',
}

console.log(Operator)

export type Condition = {
    entityId: string,
    operator: Operator,
    value: number | string
}

const convertEntityToDropdownOption = (entity: CLM.EntityBase): OF.IDropdownOption => {
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

// Enum here refers to TypeScript type enum not CL enum entity
// Need to do whole object instead of value map since this refers to whole object 'enumObject'
const convertEnumToDropdownOptions = (enumObject: object): OF.IDropdownOption[] => {
    return Object.keys(enumObject)
        .map((operatorString: string) =>
            ({
                key: operatorString,
                text: operatorString,
                data: enumObject[operatorString],
            }))
}

const operatorOptions = convertEnumToDropdownOptions(Operator)
const equalOperatorOption = operatorOptions.find(o => o.data == Operator.Equals)!

// Enum here refers to Enum values on Entities
const convertEnumValueToDropdownOption = (enumValue: CLM.EnumValue): OF.IDropdownOption => {
    // TODO: Fix types to avoid this. EnumValues on Entities should be guaranteed to exist.
    // Only don't exist during temporary creation
    if (!enumValue.enumValueId) {
        throw new Error(`Enum value must have id. When attempting to convert enum value to dropdown option, value did not have id. Perhaps it was not saved.`)
    }

    return {
        key: enumValue.enumValueId,
        text: enumValue.enumValue,
    }
}


type Props = InjectedIntlProps
    & {
        entities: CLM.EntityBase[],
        isOpen: boolean,
        conditions: Condition[],
        onClickCreate: (condition: Condition) => void,
        onClickCancel: () => void,
    }

const Component: React.FC<Props> = (props) => {
    // Entity Dropdown
    const entityOptions = props.entities.map(e => convertEntityToDropdownOption(e))
    const [selectedEntityOption, setSelectedEntityOptionKey] = React.useState<OF.IDropdownOption>(entityOptions[0])
    const onChangeEntity = (event: React.FormEvent<HTMLDivElement>, option?: OF.IDropdownOption | undefined, index?: number | undefined) => {
        if (!option) {
            return
        }

        const entity = option.data as CLM.EntityBase
        if (entity.entityType === CLM.EntityType.ENUM && entity.enumValues) {
            const enumValueOptions = entity.enumValues.map(ev => convertEnumValueToDropdownOption(ev))
            setEnumValueOptions(enumValueOptions)
            // Only allow equal operator when selecting enum
            setSelectedOperatorOption(equalOperatorOption)
            setShowNumberValue(false)
        }
        else {
            setShowNumberValue(true)
        }

        setSelectedEntityOptionKey(option)
    }

    // Operator Dropdown
    const [selectedOperatorOption, setSelectedOperatorOption] = React.useState<OF.IDropdownOption>(operatorOptions[0])
    const onChangeOperator = (event: React.FormEvent<HTMLDivElement>, option?: OF.IDropdownOption | undefined, index?: number | undefined) => {
        if (!option) {
            return
        }

        setSelectedOperatorOption(option)
    }

    // Value
    const [showNumberValue, setShowNumberValue] = React.useState(true)
    const [numberValue, setNumberValue] = React.useState(0)
    const [enumValueOptions, setEnumValueOptions] = React.useState<OF.IDropdownOption[]>([])
    React.useLayoutEffect(() => {
        setSelectedEnumValueOption(enumValueOptions[0])
    }, [enumValueOptions])

    const [selectedEnumValueOption, setSelectedEnumValueOption] = React.useState<OF.IDropdownOption>()
    const onChangeEnumValueOption = (event: React.FormEvent<HTMLDivElement>, option?: OF.IDropdownOption | undefined, index?: number | undefined) => {
        if (!option) {
            return
        }

        setSelectedEnumValueOption(option)
    }

    const [isCreateDisabled, setIsCreateDisabled] = React.useState(false)

    // If any of inputs change, recompute validity
    React.useEffect(() => {
        const isValid = Boolean(selectedEntityOption)
            && Boolean(selectedOperatorOption)
            && showNumberValue
            ? Boolean(numberValue)
            : Boolean(selectedEnumValueOption)

        setIsCreateDisabled(isValid)
    }, [selectedEntityOption, selectedOperatorOption, numberValue, selectedEnumValueOption])

    const onClickCreate = () => {
        const condition: Condition = {
            entityId: (selectedEntityOption.data as CLM.EntityBase).entityId,
            operator: selectedOperatorOption.data,
            // TODO: Fix types, if showNumber is false, we know enum value should be true
            value: showNumberValue || !selectedEnumValueOption
                ? numberValue
                : (selectedEnumValueOption.data as CLM.EnumValue).enumValueId!
        }

        props.onClickCreate(condition)
    }

    const onClickCancel = () => {
        props.onClickCancel()
    }

    return <OF.Modal
        isOpen={props.isOpen}
        containerClassName="cl-modal cl-modal--medium"
    >
        <div className="cl-modal_header" data-testid="codition-creator-title">
            <span className={OF.FontClassNames.xxLarge}>Create a Condition</span>
        </div>

        <div className="cl-modal_body">
            <div>
                <h2>Expression</h2>
                <div className="cl-condition-creator__expression">
                    <OF.Dropdown
                        label="Entity"
                        selectedKey={selectedEntityOption.key}
                        options={entityOptions}
                        onChange={onChangeEntity}
                    />
                    <OF.Dropdown
                        label="Operator"
                        selectedKey={selectedOperatorOption.key}
                        options={operatorOptions}
                        onChange={onChangeOperator}
                    />
                    {/* Little akward to checkEnumValueOption here, but do it for type safety */}
                    {(showNumberValue || !selectedEnumValueOption)
                        ? <div>
                            <OF.Label>Number</OF.Label>
                            <OF.SpinButton
                                value={numberValue.toString()}
                                onDecrement={v => setNumberValue(prevValue => prevValue - 1)}
                                onIncrement={v => setNumberValue(prevValue => prevValue + 1)}
                                labelPosition={Position.bottom}
                                step={1}
                            />
                        </div>
                        : <OF.Dropdown
                            label="Enum Value"
                            selectedKey={selectedEnumValueOption.key}
                            options={enumValueOptions}
                            onChange={onChangeEnumValueOption}
                        />}
                </div>
            </div>
        </div>

        <div className="cl-modal_footer cl-modal-buttons">
            <div className="cl-modal-buttons_secondary">
            </div>
            <div className="cl-modal-buttons_primary">
                <OF.PrimaryButton
                    data-testid="codition-creator-button-create"
                    disabled={isCreateDisabled}
                    onClick={onClickCreate}
                    ariaDescription={Util.formatMessageId(props.intl, FM.BUTTON_CREATE)}
                    text={Util.formatMessageId(props.intl, FM.BUTTON_CREATE)}
                    iconProps={{ iconName: 'Accept' }}
                />

                <OF.DefaultButton
                    data-testid="action-creator-cancel-button"
                    onClick={onClickCancel}
                    ariaDescription={Util.formatMessageId(props.intl, FM.ACTIONCREATOREDITOR_CANCELBUTTON_ARIADESCRIPTION)}
                    text={Util.formatMessageId(props.intl, FM.ACTIONCREATOREDITOR_CANCELBUTTON_TEXT)}
                    iconProps={{ iconName: 'Cancel' }}
                />
            </div>
        </div>
    </OF.Modal>
}

export default injectIntl(Component)