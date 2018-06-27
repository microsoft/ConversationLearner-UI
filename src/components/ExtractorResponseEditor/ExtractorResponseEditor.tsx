/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as React from 'react'
import { Editor } from 'slate-react'
import Plain from 'slate-plain-serializer'
import { IOption, IPosition, IEntityPickerProps, IGenericEntity, NodeType, IGenericEntityData } from './models'
import { convertEntitiesAndTextToTokenizedEditorValue, convertEntitiesAndTextToEditorValue, getRelativeParent, getEntitiesFromValueUsingTokenData, getSelectedText } from './utilities'
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
    preBuiltEditorValues: SlateValue[]
}

const disallowedOperations = ['insert_text', 'remove_text', 'merge_node']
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
        preBuiltEditorValues: [{}]
    }

    constructor(props: Props) {
        super(props)

        this.state.value = convertEntitiesAndTextToTokenizedEditorValue(props.text, props.customEntities, NodeType.CustomEntityNodeType)
        this.state.preBuiltEditorValues = props.preBuiltEntities.map<any[]>(preBuiltEntity => convertEntitiesAndTextToEditorValue(props.text, [preBuiltEntity], NodeType.PreBuiltEntityNodeType))
    }

    componentWillReceiveProps(nextProps: Props) {
        /**
         * This makes assumption that options that are added during the life-cycle of this component are likely
         * added via users clicking the New Entity item in the menu.  We can then simulate a change of custom entities
         * effectively auto-labeling the currently selected text with this new entity.
         */
        if (nextProps.options.length !== this.props.options.length) {
            const newOptions = nextProps.options.filter(newOption => this.props.options.every(oldOption => oldOption.id !== newOption.id))
            if (newOptions.length === 1) {
                const newOption = newOptions[0]
                const value = this.state.value
                const selectedNodes: any[] = value.inlines.toJS()
                if (selectedNodes.length > 0 && selectedNodes.every(n => n.type === NodeType.TokenNodeType)) {
                    const startIndex = selectedNodes[0].data.startIndex
                    const endIndex = selectedNodes[selectedNodes.length - 1].data.endIndex

                    const newCustomEntity: IGenericEntity<IGenericEntityData<any>> = {
                        startIndex,
                        endIndex,
                        data: {
                            text: getSelectedText(value),
                            displayName: newOption.name,
                            option: newOption,
                            // This should be the original entity, but we don't have it here
                            // This will be re-created on next setState from parents
                            original: null 
                        }
                    }

                    this.props.onChangeCustomEntities([...nextProps.customEntities, newCustomEntity])
                    return
                }
            }
        }

        // TODO: See if we can avoid all of these checks.  Currently the issue is that when we recompute a new Slate value
        // we lose the current selection that was existing in the old value and if the selection goes away this forces the EntityPicker menu to close
        // which disrupts the users interaction with menu.
        if (nextProps.text !== this.props.text
            || nextProps.customEntities.length !== this.props.customEntities.length
            || nextProps.preBuiltEntities.length !== this.props.preBuiltEntities.length) {
            this.setState({
                value: convertEntitiesAndTextToTokenizedEditorValue(nextProps.text, nextProps.customEntities, NodeType.CustomEntityNodeType),
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

        const selectionDoesNotContainTokens = value.isEmpty || value.selection.isCollapsed || (value.inlines.size === 0)
        if (!menu || selectionDoesNotContainTokens) {
            return hideMenu
        }

        const relativeParent = getRelativeParent(menu.parentElement)
        const relativeRect = relativeParent.getBoundingClientRect()
        const selection = window.getSelection()

        // Note: Slate value.selection can be different than the document window.getSelection()
        // From what I can tell slate's is always accurate to display.  If the selection was updated programmatically via slate API it will be reflected within Slates selection
        // and as soon as user interacts to change DOM selection, it will update both
        // Note: Cannot test for selection.isCollapsed here, because we need the menu to open when the user clicks a word
        if (!selection || selection.rangeCount === 0) {
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

        /**
         * If selection overlaps with existing custom entity nodes, or if it's has parent of custom entity node
         * then set special flag isOverlappingOtherEntities which prevents adding entities
         */
        let isOverlappingOtherEntities = false
        if (value.inlines.size > 0) {
            const customEntityNodesInSelection = value.inlines.filter((n: any) => n.type === NodeType.CustomEntityNodeType)
            if (customEntityNodesInSelection.size > 0) {
                isOverlappingOtherEntities = true
            }
            else {
                const parentOfFirstInline = value.document.getParent(value.inlines.first().key)
                if (parentOfFirstInline.type === NodeType.CustomEntityNodeType) {
                    isOverlappingOtherEntities = true
                }
            }
        }

        return {
            isOverlappingOtherEntities,
            isVisible: true,
            position: menuPosition
        }
    }

    onChange = (change: any) => {
        const { value, operations } = change
        const operationsJs = operations.toJS()
        console.log(`operationsJs: `, operationsJs)
        console.log(`disallowedOperations: `, disallowedOperations)
        const containsDisallowedOperations = operationsJs.some((o: any) => disallowedOperations.includes(o.type))

        if (containsDisallowedOperations) {
            return
        }
        
        const tokenNodes = value.inlines.filter((n: any) => n.type === NodeType.TokenNodeType)
        if (tokenNodes.size > 0) {
            let shouldExpandSelection = true
            const parentNodes = tokenNodes.map((n: any) => value.document.getParent(n.key))
            const firstParent = parentNodes.first()

            // If all parents nodes are the same node and the type of that node is CustomEntity then it means selection is all within a custom entity
            // In this case we assume the user wants to delete the entity and do not expand the selection to prevent the picker menu from showing
            if (firstParent.type === NodeType.CustomEntityNodeType && parentNodes.every((x: any) => x === firstParent)) {
                shouldExpandSelection = false
            }

            // Note: This is kind of hack to prevent selection from expanding when the cursor/selection is within
            // the button text of the custom entity node. This makes the Slate selection expanded and prevents
            // the entity picker from closing after user removes the node.
            const selection = window.getSelection()
            const selectionParentElement = selection && selection.anchorNode && selection.anchorNode.parentElement
            if (selectionParentElement == null) {
                console.warn(`selectionParentElement is null or undefined. Value: ${value.document.text}`)
            }
            else if (selectionParentElement.tagName ===  "BUTTON") {
                shouldExpandSelection = false
            }

            if (shouldExpandSelection) {
                const firstInline = value.inlines.first()
                const lastInline = value.inlines.last()
                change
                    .collapseToStartOf(firstInline)
                    .extendToEndOf(lastInline)
            }
        }

        this.setState({ value: change.value })
        
        const containsExternalChangeOperation = operationsJs.some((o: any) => externalChangeOperations.includes(o.type))
        if (containsExternalChangeOperation) {
            const customEntities = getEntitiesFromValueUsingTokenData(change)
            this.props.onChangeCustomEntities(customEntities)
        }

        const pickerProps = this.getNextPickerProps(change.value, this.menu)
        if (pickerProps) {
            this.setState({
                isSelectionOverlappingOtherEntities: pickerProps.isOverlappingOtherEntities,
                isMenuVisible: pickerProps.isVisible,
                menuPosition: pickerProps.position
            })
        }
    }

    /**
     * Note: This is only here to prevent an edge case bug but doesn't affect normal behavior.
     * Bug: The user has labeled the last word in the phrase as an entity, has the cursor at the
     * right most position of the input and presses the left arrow.
     */
    onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>, change: any) => {
        if (event.key === 'Enter') {
            event.preventDefault()
            return true
        }

        const blockNode = change.value.document.getBlocks().last()
        const lastTextNode = blockNode.getLastText()
        const isAtEnd = change.value.selection.isAtEndOf(lastTextNode)

        if (isAtEnd) {
            event.preventDefault()
            change.collapseToEndOfPreviousText()
            return true
        }

        return undefined
    }

    menuRef = (menu: any) => {
        this.menu = menu
    }

    renderNode = (props: any): React.ReactNode | void => {
        switch (props.node.type) {
            case NodeType.TokenNodeType: return <TokenNode {...props} />
            case NodeType.CustomEntityNodeType: return <CustomEntityNode {...props} />
            case NodeType.PreBuiltEntityNodeType: return <PreBuiltEntityNode {...props} />
            default: return
        }
    }

    onSelectOption = (option: IOption, value: SlateValue, onChange: (x: any) => void) => {
        const selectedText = getSelectedText(value)

        if (selectedText.length === 0) {
            console.warn(`onSelectOption was called but the value has an empty selection`)
            return
        }

        const change = value.change()
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
                            data-testid="extractorresponseeditor-editor-text"
                            className="slate-editor"
                            placeholder="Enter some text..."
                            value={this.state.value}
                            onChange={this.onChange}
                            onKeyDown={this.onKeyDown}
                            renderNode={this.renderNode}
                            readOnly={this.props.readOnly}
                        />
                        <EntityPicker
                            data-testid="extractorresponseeditor-entitypicker"
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
                                data-testid="extractorresponseeditor-editor-prebuilt-text"
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