/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as React from 'react'
import * as OF from 'office-ui-fabric-react'
import * as CLM from '@conversationlearner/models'
import Plain from 'slate-plain-serializer'
import CustomEntityNode from './CustomEntityNode'
import PreBuiltEntityNode from './PreBuiltEntityNode'
import EntityPicker from './EntityPicker'
import TokenNode from './TokenNode'
import { Editor } from 'slate-react'
import { Expando } from '../modals'
import { IOption, IPosition, IEntityPickerProps, IGenericEntity, NodeType, IGenericEntityData, ExtractorStatus } from './models'
import { convertEntitiesAndTextToTokenizedEditorValue, convertEntitiesAndTextToEditorValue, getRelativeParent, getEntitiesFromValueUsingTokenData, getSelectedText } from './utilities'
import './ExtractorResponseEditor.css'

// Slate doesn't have type definitions but we still want type consistency and references so we make custom type
export type SlateValue = any

interface Props {
    readOnly: boolean
    status: ExtractorStatus,
    options: IOption[]
    text: string
    entities: CLM.EntityBase[]
    customEntities: IGenericEntity<any>[]
    onChangeCustomEntities: (customEntities: IGenericEntity<any>[], entities: CLM.EntityBase[]) => void
    preBuiltEntities: IGenericEntity<any>[]
    onClickNewEntity: (entityTypeFilter: string) => void
    isPickerVisible: boolean,
    onOpenPicker: () => void
    onClosePicker: (onlyCloseOthers?: boolean) => void
}

interface State {
    isSelectionOverlappingOtherEntities: boolean
    isDeleteButtonVisible: boolean
    isPreBuiltExpandoOpen: boolean
    menuPosition: IPosition | null
    value: SlateValue
    preBuiltEditorValues: SlateValue[],
    builtInTypeFilter: string | null
}

const initialState: Readonly<State> = {
    isSelectionOverlappingOtherEntities: false,
    isDeleteButtonVisible: false,
    isPreBuiltExpandoOpen: true,
    menuPosition: {
        top: 0,
        left: 0,
        bottom: 0
    },
    value: Plain.deserialize(''),
    preBuiltEditorValues: [{}],
    builtInTypeFilter: null
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
    menuRef = React.createRef<HTMLDivElement>()
    editor = React.createRef<any>();

    constructor(props: Props) {
        super(props)

        const preBuiltEditorValues = props.preBuiltEntities.map<any[]>(preBuiltEntity => convertEntitiesAndTextToEditorValue(props.text, [preBuiltEntity], NodeType.PreBuiltEntityNodeType))
        this.state = {
            ...initialState,
            value: convertEntitiesAndTextToTokenizedEditorValue(props.text, props.customEntities, NodeType.CustomEntityNodeType),
            preBuiltEditorValues,
            isPreBuiltExpandoOpen: preBuiltEditorValues.length <= 4
        }
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

                /**
                 * This is hack to prevent bug with negative entities which as assume have '-' prefix.
                 * When user creates a new Entity and checks negatable the options are updated twice.
                 * Once with the positive which correctly tags the text and another time with the negative which
                 */
                const negativeEntityPrefix = '-'
                if (!newOption.name.startsWith(negativeEntityPrefix)) {
                    const value = this.state.value
                    const selectedNodes: any[] = value.inlines.toJS()
                    if (selectedNodes.length > 0 && selectedNodes.every(n => n.type === NodeType.TokenNodeType)) {
                        const startIndex = selectedNodes[0].data.startIndex
                        const endIndex = selectedNodes[selectedNodes.length - 1].data.endIndex
                        const selectedText = getSelectedText(value)
                        if (selectedText.length === 0) {
                            console.warn(`Attempting to label the selected text as entity: ${newOption.name}; however, the selected text was empty. This should not be possible. Likely the first token is defaulted as selected.`)
                        }
                        else {
                            const newCustomEntity: IGenericEntity<IGenericEntityData<any>> = {
                                startIndex,
                                endIndex,
                                data: {
                                    text: selectedText,
                                    displayName: newOption.name,
                                    option: newOption,
                                    // This should be the original entity, but we don't have it here
                                    // This will be re-created on next setState from parents
                                    original: null
                                }
                            }

                            this.props.onChangeCustomEntities([...nextProps.customEntities, newCustomEntity], this.props.entities)
                            return
                        }
                    }
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
                preBuiltEditorValues: nextProps.preBuiltEntities.map<any[]>(preBuiltEntity => convertEntitiesAndTextToEditorValue(nextProps.text, [preBuiltEntity], NodeType.PreBuiltEntityNodeType)),
                isSelectionOverlappingOtherEntities: false
            })
            this.props.onClosePicker()
        }
    }

    getNextPickerProps = (value: SlateValue, menu: HTMLElement | null): IEntityPickerProps | void => {
        const hideMenu: IEntityPickerProps = {
            isOverlappingOtherEntities: false,
            isVisible: false,
            position: null,
            builtInTypeFilter: null
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
            top: ((selectionBoundingRect.top - relativeRect.top) + selectionBoundingRect.height) + window.scrollY + 10,
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

        /**
         * If the text you select has a prebuilt entity detected within same region
         * it opens the entity creator modal with that prebuilt type pre-selected to help prevent mismatches.
         * This means `entityTypeFilter` and `builtInTypeFilter` do need to remain a string since the pre-built types/names are not EntityTypes
         * 
         * TODO: In future look at adding explicit resolver preset parameter and remove casting
         */
        let builtInTypeFilter: string | null = null
        const selectedNodes: any[] = value.inlines.toJS()
        if (selectedNodes.length > 0 && selectedNodes.every(n => n.type === NodeType.TokenNodeType)) {
            const startIndex = selectedNodes[0].data.startIndex
            const endIndex = selectedNodes[selectedNodes.length - 1].data.endIndex
            // select the builtIn entity that has overlap with current selected tokens as the builtIn entity filter
            const builtInEntity = this.props.preBuiltEntities.find(entity => entity.startIndex >= startIndex && entity.endIndex <= endIndex)
            if (builtInEntity) {
                const builtInEntityId = builtInEntity.data.option.id
                const builtInEntityDef = this.props.entities.find(e => e.entityId === builtInEntityId)
                if (builtInEntityDef) {
                    builtInTypeFilter = builtInEntityDef.entityType
                }
            }
        }

        return {
            isOverlappingOtherEntities,
            isVisible: true,
            position: menuPosition,
            builtInTypeFilter: builtInTypeFilter
        }
    }

    // If user clicks on a single character, onChange gets called with empty item.  This changes the
    // selection to pick the character
    onSelectChar = () => {
        // Make selection
        const selection = window.getSelection();
        const parentNode = selection
            && selection.anchorNode
            && selection.anchorNode.parentElement
            && selection.anchorNode.parentElement.parentNode

        if (parentNode && selection) {
            const sibling = parentNode.nextSibling ? parentNode.nextSibling : parentNode.parentNode && parentNode.parentNode.nextSibling

            if (sibling && sibling.firstChild && sibling.firstChild.firstChild && sibling.firstChild.firstChild.firstChild) {
                const newSelection = sibling.firstChild.firstChild.firstChild
                const range = document.createRange();
                range.selectNode(newSelection)
                selection.removeAllRanges()
                selection.addRange(range)
            }
        }
    }

    @OF.autobind
    onChange(change: any) {
        const { value, operations } = change

        const operationsJs = operations.toJS()
        // console.log(`operationsJs: `, operationsJs.map((o:any) => o.type))
        // console.log(`disallowedOperations: `, disallowedOperations)

        const ignoreOperations = [...disallowedOperations]

        // If delete button is up, disallow any new selection
        if (this.state.isDeleteButtonVisible) {
            ignoreOperations.push("set_selection")
        }

        if (operationsJs.some((o: any) => ignoreOperations.includes(o.type))) {
            return
        }

        const tokenNodes = value.inlines.filter((n: any) => n.type === NodeType.TokenNodeType)

        // User clicked next to a single character.  Go ahead and autoselect it
        if (tokenNodes.size === 0 && operationsJs.length === 1) {
            this.onSelectChar()
            this.props.onClosePicker(true)
            return
        }
        if (tokenNodes.size > 0) {
            let shouldExpandSelection = true
            const parentNodes = tokenNodes.map((n: any) => value.document.getParent(n.key))
            const firstParent = parentNodes.first()

            // If all parents nodes are the same node and the type of that node is CustomEntity then it means selection is all within a custom entity
            // In this case we assume the user wants to delete the entity and do not expand the selection to prevent the picker menu from showing
            if (firstParent && firstParent.type === NodeType.CustomEntityNodeType && parentNodes.every((x: any) => x === firstParent)) {
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
            else if (["BUTTON", "I"].includes(selectionParentElement.tagName)) {
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
            this.props.onChangeCustomEntities(customEntities, this.props.entities)
        }

        const pickerProps = this.getNextPickerProps(change.value, this.menuRef.current)
        if (pickerProps) {
            this.setState({
                isSelectionOverlappingOtherEntities: pickerProps.isOverlappingOtherEntities,
                menuPosition: pickerProps.position,
                builtInTypeFilter: pickerProps.builtInTypeFilter
            })
            if (this.props.isPickerVisible && !pickerProps.isVisible) {
                this.props.onClosePicker()
            }
            else if (!this.props.isPickerVisible && pickerProps.isVisible) {
                this.props.onOpenPicker()
            }
        }
    }

    /**
     * Note: This is only here to prevent an edge case bug but doesn't affect normal behavior.
     * Bug: The user has labeled the last word in the phrase as an entity, has the cursor at the
     * right most position of the input and presses the left arrow.
     */
    onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>, change: any) => {
        if (['Enter', 'Backspace'].includes(event.key)) {
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

    @OF.autobind
    onDeleteButtonVisible(isDeleteButtonVisible: boolean): void {
        this.setState({ isDeleteButtonVisible })
    }

    renderNode = (props: any): React.ReactNode | void => {
        switch (props.node.type) {
            case NodeType.TokenNodeType:
                return <TokenNode {...props} />
            case NodeType.CustomEntityNodeType:
                const cenProps = { ...props, onDeleteButtonVisible: this.onDeleteButtonVisible }
                return <CustomEntityNode {...cenProps} />
            case NodeType.PreBuiltEntityNodeType:
                return <PreBuiltEntityNode {...props} />
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

    @OF.autobind
    onClickNewEntity(entityTypeFilter: string) {
        if (this.props.isPickerVisible) {
            this.props.onClosePicker()
        }
        this.props.onClickNewEntity(entityTypeFilter)
    }

    componentDidMount() {
        // For end 2 end unit testing.
        document.addEventListener("Test_SelectWord", this.onTestSelectWord)
    }

    componentWillUnmount() {
        // For end 2 end unit testing.
        document.removeEventListener("Test_SelectWord", this.onTestSelectWord)
    }

    // For end 2 end unit testing.
    @OF.autobind
    onTestSelectWord(val: any) {
        const phrase: string = val.detail
        const words = phrase.split(" ")
        const firstWord = words[0]
        const lastWord = words[words.length - 1]

        // Get start div
        const tokens = Array.from(document.querySelectorAll(".cl-token-node"))
        const firstWordToken = tokens.filter(element => element.children[0].textContent === firstWord)[0]
        const lastWordToken = tokens.filter(element => element.children[0].textContent === lastWord)[0]

        if (!firstWordToken || !lastWordToken) {
            const extractionTextElement = document.querySelector('[data-slate-editor="true"]')
            const input = extractionTextElement ? extractionTextElement.textContent : ''
            throw new Error(`You attempted to select the phrase: '${phrase}', but it was not found in the input: '${input}'`)
        }

        const firstDiv = firstWordToken.children[0].children[0]
        const lastDiv = lastWordToken.children[0].children[0]
        const slateEditor = firstDiv!.parentElement!.parentElement!.parentElement!.parentElement
        const currentTarget = 'currentTarget'
        const typeKey = 'type'
        // Events are special, can't use spread or Object.keys
        const selectEvent: any = {}
        for (const key in val) {
            if (key === currentTarget) {
                selectEvent[currentTarget] = slateEditor
            }
            else if (key === typeKey) {
                selectEvent[typeKey] = "select"
            }
            else {
                selectEvent[key] = val[key]
            }
        }

        // Make selection
        const selection = window.getSelection();
        const range = document.createRange();

        if (selection) {
            range.setStartBefore(firstDiv)
            range.setEndAfter(lastDiv)

            if (selection) {
                selection.removeAllRanges();
                selection.addRange(range)
            }

            // Fire select event
            this.editor.current.onEvent("onSelect", selectEvent)
        }
    }

    borderStyle(): string {
        switch (this.props.status) {
            case ExtractorStatus.ERROR:
                return 'entity-labeler__custom-editor--error'
            case ExtractorStatus.WARNING:
                return 'entity-labeler__custom-editor--warning'
            default:
                return ''
        }
    }

    render() {
        const filteredOptions = this.props.options
            .filter(option => option.type === CLM.EntityType.LUIS)
            .sort((a, b) => {
                const nameCompare = (x: IOption, y: IOption) => x.name > y.name ? 1 : (x.name < y.name ? -1 : 0)
                if (a.resolverType === this.state.builtInTypeFilter) {
                    if (b.resolverType === this.state.builtInTypeFilter) {
                        return nameCompare(a, b)
                    }
                    return -1
                } else if (b.resolverType === this.state.builtInTypeFilter) {
                    return -1
                } else {
                    return nameCompare(a, b)
                }
            })

        return (
            <div className="entity-labeler">
                {(this.props.isPickerVisible || this.state.isDeleteButtonVisible) &&
                    <div
                        className="entity-labeler-overlay"
                        onClick={() => this.props.onClosePicker()}
                        role="button"
                    />
                }
                <div className={`entity-labeler__custom-editor ${this.props.readOnly ? 'entity-labeler__custom-editor--read-only' : ''} ${this.borderStyle()}`}>
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
                            ref={this.editor}
                        />
                        <EntityPicker
                            data-testid="extractorresponseeditor-entitypicker"
                            isOverlappingOtherEntities={this.state.isSelectionOverlappingOtherEntities}
                            isVisible={this.props.isPickerVisible}
                            options={filteredOptions}
                            maxDisplayedOptions={500}
                            ref={this.menuRef}
                            position={this.state.menuPosition}
                            value={this.state.value}

                            onClickNewEntity={this.onClickNewEntity}
                            onSelectOption={o => this.onSelectOption(o, this.state.value, this.onChange)}
                            entityTypeFilter={this.state.builtInTypeFilter !== null ? this.state.builtInTypeFilter as any : CLM.EntityType.LUIS}
                        />
                    </div>
                </div>
                {this.state.preBuiltEditorValues.length > 0
                    && <div className="entity-labeler__prebuilt-editors">
                        <Expando
                            className={'entity-labeler__title'}
                            isOpen={this.state.isPreBuiltExpandoOpen}
                            text="Extracted Pre-Trained Entities:"
                            onToggle={() => this.setState({ isPreBuiltExpandoOpen: !this.state.isPreBuiltExpandoOpen })}
                        />

                        {this.state.isPreBuiltExpandoOpen &&
                            <div className="entity-labeler__editor entity-labeler__editor--prebuilt">
                                {this.state.preBuiltEditorValues.map((preBuiltEditorValue, i) =>
                                    <Editor
                                        data-testid="extractorresponseeditor-editor-prebuilt-text"
                                        key={i}
                                        className="slate-editor"
                                        placeholder="Enter some text..."
                                        value={preBuiltEditorValue}
                                        renderNode={this.renderNode}
                                        readOnly={true}
                                    />)}
                            </div>}
                    </div>}
            </div>
        )
    }
}

export default ExtractorResponseEditor