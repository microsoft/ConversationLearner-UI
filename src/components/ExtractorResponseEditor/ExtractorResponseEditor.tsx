/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as React from 'react'
import { Editor } from 'slate-react'
import Plain from 'slate-plain-serializer'
import { IOption, IPosition, IEntityPickerProps, IGenericEntity, NodeType } from './models'
import { convertEntitiesAndTextToTokenizedEditorValue, convertEntitiesAndTextToEditorValue, getRelativeParent, getEntitiesFromValue, getSelectedText } from './utilities'
import CustomEntityNode from './CustomEntityNode'
import PreBuiltEntityNode from './PreBuiltEntityNode'
import EntityPicker from './EntityPickerContainer'
import './ExtractorResponseEditor.css'
import TokenNode from './TokenNode'

// Slate doesn't have type definitions but we still want type consistency and references so we make custom type
export type SlateValue = any

interface Props {
    readOnly: boolean
    isValid: boolean
    options: IOption[]
    text: string
    customEntities: IGenericEntity<any>[]
    onChangeCustomEntities: (customEntities: IGenericEntity<any>[]) => void
    preBuiltEntities: IGenericEntity<any>[]
    onClickNewEntity: () => void
}

interface State {
    isSelectionOverlappingOtherEntities: boolean
    isMenuVisible: boolean
    menuPosition: IPosition
    value: SlateValue
    isTokenMenuVisible: boolean
    tokenMenuPosition: IPosition
    tokenizedValue: SlateValue
    preBuiltEditorValues: SlateValue[]
}

const disallowedOperations = ['insert_text', 'remove_text']
const externalChangeOperations = ['insert_node', 'remove_node']

/**
 * The higher level goal behind this component is for consumers to think of it like a normal controlled <input value={value} onChange={this.onChangeValue} />
 * However, instead of editing a simple string of text we are editing an extractorResponse object. Then it becomes easy to understand the 
 * abstractions and encapsulation.  Example: for normal <input /> the user can change cursor position and selection, but only when characters are changed,
 * does the onChange get called.  For the ExtractorResponse allows certain operations to change and only exposes the changes externally
 * 
 * The other important concept is the translation of state from the external domain to internal domain.  Externally the consumers know extractorResponses / entities
 * however internally it stores as generic options list and a Slate.js value object.
 */
class ExtractorResponseEditor extends React.Component<Props, State> {
    tokenMenu: HTMLElement
    menu: HTMLElement

    state = {
        isSelectionOverlappingOtherEntities: false,
        isMenuVisible: false,
        menuPosition: {
            top: 0,
            left: 0,
            bottom: 0
        },
        value: Plain.deserialize(''),
        isTokenMenuVisible: false,
        tokenMenuPosition: {
            top: 0,
            left: 0,
            bottom: 0
        },
        tokenizedValue: Plain.deserialize(''),
        preBuiltEditorValues: [{}]
    }

    constructor(props: Props) {
        super(props)

        this.state.tokenizedValue = convertEntitiesAndTextToTokenizedEditorValue(props.text, props.customEntities, NodeType.CustomEntityNodeType)
        this.state.value = convertEntitiesAndTextToEditorValue(props.text, props.customEntities, NodeType.CustomEntityNodeType)
        this.state.preBuiltEditorValues = props.preBuiltEntities.map<any[]>(preBuiltEntity => convertEntitiesAndTextToEditorValue(props.text, [preBuiltEntity], NodeType.PreBuiltEntityNodeType))
    }

    componentWillReceiveProps(nextProps: Props) {
        // TODO: See if we can avoid all of these checks.  Currently the issue is that when we recompute a new Slate value
        // we lose the current selection that was existing in the old value and if the selection goes away this forces the EntityPicker menu to close
        // which disrupts the users interaction with menu.
        if (nextProps.text !== this.props.text
            || nextProps.customEntities.length !== this.props.customEntities.length
            || nextProps.preBuiltEntities.length !== this.props.preBuiltEntities.length) {
            this.setState({
                tokenizedValue: convertEntitiesAndTextToTokenizedEditorValue(nextProps.text, nextProps.customEntities, NodeType.CustomEntityNodeType),
                value: convertEntitiesAndTextToEditorValue(nextProps.text, nextProps.customEntities, NodeType.CustomEntityNodeType),
                preBuiltEditorValues: nextProps.preBuiltEntities.map<any[]>(preBuiltEntity => convertEntitiesAndTextToEditorValue(nextProps.text, [preBuiltEntity], NodeType.PreBuiltEntityNodeType))
            })
        }
    }

    getNextPickerProps = (value: SlateValue, menu: HTMLElement): IEntityPickerProps | void => {
        const hideMenu: IEntityPickerProps = {
            isOverlappingOtherEntities: false,
            isVisible: false,
            position: null
        }

        if (!menu) {
            return hideMenu
        }

        if (value.isEmpty || value.selection.isCollapsed) {
            return hideMenu
        }

        const relativeParent = getRelativeParent(menu.parentElement)
        const relativeRect = relativeParent.getBoundingClientRect()
        const selection = window.getSelection()

        // Note: Slate value.selection can be different than the document window.getSelection()
        // From what I can tell slate's is always accurate to display.  If the selection was updated programmatically via slate API it will be reflected within Slates selection
        // and as soon as user interacts to change DOM selection, it will update both
        if (!selection) {
            return hideMenu
        }

        const range = selection.getRangeAt(0)
        const selectionBoundingRect = range.getBoundingClientRect()

        const left = (selectionBoundingRect.left - relativeRect.left) + window.scrollX - menu.offsetWidth / 2 + selectionBoundingRect.width / 2
        const menuPosition: IPosition = {
            top: ((selectionBoundingRect.top - relativeRect.top) - menu.offsetHeight) + window.scrollY - 20,
            left: Math.max(0, left),
            bottom: relativeRect.height - (selectionBoundingRect.top - relativeRect.top) + 10
        }

        return {
            isOverlappingOtherEntities: ((value.inlines.toJS() as any[]).filter(n => n.type === NodeType.CustomEntityNodeType).length > 0),
            isVisible: true,
            position: menuPosition
        }
    }

    onChange = (change: any) => {
        const { value, operations } = change
        const operationsJs = operations.toJS()

        const containsDisallowedOperations = operationsJs.some((o: any) => disallowedOperations.includes(o.type))
        if (containsDisallowedOperations) {
            return
        }

        // This must always be called to allow normal interaction with editor such as text selection
        this.setState({ value })

        const containsExternalChangeOperation = operationsJs.some((o: any) => externalChangeOperations.includes(o.type))
        if (containsExternalChangeOperation) {
            const customEntities = getEntitiesFromValue(change)
            this.props.onChangeCustomEntities(customEntities)
        }

        const pickerProps = this.getNextPickerProps(value, this.menu)
        if (pickerProps) {
            console.log(`onChange.set pickerProps`, pickerProps.isVisible)
            this.setState({
                isSelectionOverlappingOtherEntities: pickerProps.isOverlappingOtherEntities,
                isMenuVisible: pickerProps.isVisible,
                menuPosition: pickerProps.position
            })
        }
    }

    onChangeToken = (change: any) => {
        const { value, operations } = change
        const operationsJs = operations.toJS()
        const containsDisallowedOperations = operationsJs.some((o: any) => disallowedOperations.includes(o.type))
        if (containsDisallowedOperations) {
            return
        }
        
        const tokenNodes = value.inlines.filter((n: any) => n.type === NodeType.TokenNodeType)
        if (tokenNodes.size > 0) {
            const firstInline = value.inlines.first()
            const lastInline = value.inlines.last()

            change
                .collapseToStartOf(firstInline)
                .extendToEndOf(lastInline)
        }

        this.setState({ tokenizedValue: change.value })
        
        const containsExternalChangeOperation = operationsJs.some((o: any) => externalChangeOperations.includes(o.type))
        if (containsExternalChangeOperation) {
            const customEntities = getEntitiesFromValue(change)
            this.props.onChangeCustomEntities(customEntities)
        }

        const pickerProps = this.getNextPickerProps(change.value, this.tokenMenu)
        if (pickerProps) {
            console.log(`onChangeToken.set pickerProps`, pickerProps.isVisible)
            this.setState({
                isSelectionOverlappingOtherEntities: pickerProps.isOverlappingOtherEntities,
                isTokenMenuVisible: pickerProps.isVisible,
                tokenMenuPosition: pickerProps.position
            })
        }
    }

    tokenMenuRef = (menu: any) => {
        this.tokenMenu = menu
    }

    menuRef = (menu: any) => {
        this.menu = menu
    }

    renderNode = (props: any): React.ReactNode | void => {
        switch (props.node.type) {
            case NodeType.TokenNodeType: return <TokenNode {...props} />
            case NodeType.CustomEntityNodeType: return <CustomEntityNode {...props} />
            case NodeType.PreBuiltEntityNodeType: return <PreBuiltEntityNode {...props} />
        }
    }

    onSelectOption = (option: IOption, value: SlateValue, onChange: (x: any) => void) => {
        const selectedText = getSelectedText(value)

        if (selectedText.length === 0) {
            console.warn(`onSelectOption was called but the value has an empty selection`)
            return
        }

        const change = value.change()

        if (value.inlines.size > 0) {
            const parentOfFirstInline = value.document.getParent(value.inlines.first().key)

            if (parentOfFirstInline.type === NodeType.CustomEntityNodeType) {
                console.log(`parentOfFirstInline.type === NodeType.CustomEntityNodeType`)
                change
                    .unwrapInlineByKey(parentOfFirstInline.key)
            }
        }

        change
            .wrapInline({
                type: NodeType.CustomEntityNodeType,
                data: {
                    option,
                    text: selectedText
                }
            })
            .collapseToEnd()

        onChange(change)
    }

    render() {
        return (
            <div className="entity-labeler">
                <div className={`entity-labeler__custom-editor ${this.props.readOnly ? 'entity-labeler__custom-editor--read-only' : ''} ${this.props.isValid ? '' : 'entity-labeler__custom-editor--error'}`}>
                    <div className="entity-labeler__editor">
                        <Editor
                            className="slate-editor"
                            placeholder="Enter some text..."
                            value={this.state.tokenizedValue}
                            onChange={this.onChangeToken}
                            renderNode={this.renderNode}
                            readOnly={this.props.readOnly}
                        />
                        <Editor
                            className="slate-editor"
                            placeholder="Enter some text..."
                            value={this.state.value}
                            onChange={this.onChange}
                            renderNode={this.renderNode}
                            readOnly={this.props.readOnly}
                        />
                        <EntityPicker
                            isOverlappingOtherEntities={this.state.isSelectionOverlappingOtherEntities}
                            isVisible={this.state.isTokenMenuVisible}
                            options={this.props.options}
                            maxDisplayedOptions={4}
                            menuRef={this.tokenMenuRef}
                            position={this.state.tokenMenuPosition}
                            value={this.state.tokenizedValue}

                            onClickNewEntity={this.props.onClickNewEntity}
                            onSelectOption={o => this.onSelectOption(o, this.state.tokenizedValue, this.onChangeToken)}
                        />
                        <EntityPicker
                            isOverlappingOtherEntities={this.state.isSelectionOverlappingOtherEntities}
                            isVisible={this.state.isMenuVisible}
                            options={this.props.options}
                            maxDisplayedOptions={4}
                            menuRef={this.menuRef}
                            position={this.state.menuPosition}
                            value={this.state.value}

                            onClickNewEntity={this.props.onClickNewEntity}
                            onSelectOption={o => this.onSelectOption(o, this.state.value, this.onChange)}
                        />
                    </div>
                </div>
                {this.state.preBuiltEditorValues.length > 0
                    && <div className="entity-labeler__prebuilt-editors">
                        <div className="entity-labeler__title">Pre-Built Entities:</div>
                        <div className="entity-labeler__editor entity-labeler__editor--prebuilt">
                            {this.state.preBuiltEditorValues.map((preBuiltEditorValue, i) =>
                                <Editor
                                    key={i}
                                    className="slate-editor"
                                    placeholder="Enter pre-built some text..."
                                    value={preBuiltEditorValue}
                                    renderNode={this.renderNode}
                                    readOnly={true}
                                />)}
                        </div>
                    </div>}
            </div>
        )
    }
}

export default ExtractorResponseEditor