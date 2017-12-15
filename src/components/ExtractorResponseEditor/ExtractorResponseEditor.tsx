import * as React from 'react'
import { Editor } from 'slate-react'
import { Value } from 'slate'
import initialValue from './value'
import { IOption, IPosition, IGenericEntity, NodeType } from './models'
import { valueToJSON, convertEntitiesAndTextToEditorValue, getRelativeParent, getEntitiesFromValue, getSelectedText } from './utilities'
import CustomEntityNode from './CustomEntityNode'
import PreBuiltEntityNode from './PreBuiltEntityNode'
import EntityPicker from './EntityPickerContainer'
import './ExtractorResponseEditor.css'

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
    isMenuVisible: boolean
    menuPosition: IPosition
    value: SlateValue
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
    menu: HTMLElement

    state = {
        isMenuVisible: false,
        menuPosition: {
            top: 0,
            left: 0,
            bottom: 0
        },
        value: Value.fromJSON(initialValue),
        preBuiltEditorValues: [{}]
    }

    constructor(props: Props) {
        super(props)

        this.state.value = convertEntitiesAndTextToEditorValue(props.text, props.customEntities, NodeType.CustomEntityNodeType)
        this.state.preBuiltEditorValues = props.preBuiltEntities.map<any[]>(preBuiltEntity => convertEntitiesAndTextToEditorValue(props.text, [preBuiltEntity], NodeType.PreBuiltEntityNodeType))
    }

    componentWillReceiveProps(nextProps: Props) {
        console.log(`ExtractorResponseEditor.componentWillReceiveProps: nextProps `, nextProps)
        // TODO: See if we can avoid all of these checks.  Currently the issue is that when we recompute a new Slate value
        // we lose the current selection that was existing in the old value and if the selection goes away this forces the EntityPicker menu to close
        // which disrupts the users interaction with menu.
        if (nextProps.text !== this.props.text
            || nextProps.customEntities.length !== this.props.customEntities.length
            || nextProps.preBuiltEntities.length !== this.props.preBuiltEntities.length) {
            this.setState({
                value: convertEntitiesAndTextToEditorValue(nextProps.text, nextProps.customEntities, NodeType.CustomEntityNodeType),
                preBuiltEditorValues: nextProps.preBuiltEntities.map<any[]>(preBuiltEntity => convertEntitiesAndTextToEditorValue(nextProps.text, [preBuiltEntity], NodeType.PreBuiltEntityNodeType))
            })
        }
    }

    // TODO: Is this necessary?
    // componentDidMount() {
    //     this.updateMenu()
    // }

    componentDidUpdate() {
        this.updateMenu()
    }

    updateMenu = () => {
        console.log(`ExtractorResponseEditor.updateMenu`)
        const menu = this.menu
        if (!menu) return

        const { value } = this.state
        if (value.isEmpty) {
            console.log(`value.isEmpty: `, value.isEmpty)
            console.log(`value: `, valueToJSON(value))
            if (this.state.isMenuVisible !== false) {
                // this.setState({
                //     isMenuVisible: false
                // })
            }
            console.log(`ExtractorResponseEditor.updateMenu.removeAttribute`)
            menu.removeAttribute('style')
            return
        }

        const relativeParent = getRelativeParent(this.menu.parentElement)
        const relativeRect = relativeParent.getBoundingClientRect()

        const selection = window.getSelection()
        if (!selection || selection.isCollapsed) {
            console.log(`ExtractorResponseEditor.updateMenu.selection.collapsed`)
            return
        }
        const range = selection.getRangeAt(0)
        const selectionBoundingRect = range.getBoundingClientRect()

        const left = (selectionBoundingRect.left - relativeRect.left) + window.scrollX - menu.offsetWidth / 2 + selectionBoundingRect.width / 2
        const menuPosition: IPosition = {
            top: ((selectionBoundingRect.top - relativeRect.top) - menu.offsetHeight) + window.scrollY - 20,
            left: Math.max(0, left),
            bottom: relativeRect.height - (selectionBoundingRect.top - relativeRect.top) + 10
        }

        // this.setState({
        //     isMenuVisible: true,
        //     menuPosition
        // })

        const style: any = {
            visibility: 'visible',
            opacity: '1',
            // top: `${menuPosition.top}px`,
            left: `${menuPosition.left}px`,
            bottom: `${menuPosition.bottom}px`,
            transform: 'scale(1)'
        }

        console.log(`ExtractorResponseEditor.updateMenu.Object.assign`)
        Object.assign(menu.style, style)
    }

    onChange = (change: any) => {
        const { value, operations } = change
        const operationsJs = operations.toJS()

        const containsDisallowedOperations = operationsJs.some((o: any) => disallowedOperations.includes(o.type))
        if (containsDisallowedOperations) {
            // console.log(`containsDisallowedOperations `, operationsJs.map((o: any) => o.type).join(', '))
            return
        }

        // This must alwasy be called to allow normal interaction with editor such as text selection
        this.setState({ value })

        const containsExternalChangeOperation = operationsJs.some((o: any) => externalChangeOperations.includes(o.type))
        if (containsExternalChangeOperation) {
            // console.log(`containsExternalChangeOperation `, operationsJs.map((o: any) => o.type).join(', '))
            const customEntities = getEntitiesFromValue(change)
            console.log(`customEntities: `, customEntities)
            this.props.onChangeCustomEntities(customEntities)
        }
    }

    menuRef = (menu: any) => {
        this.menu = menu
    }

    renderNode = (props: any): React.ReactNode | void => {
        switch (props.node.type) {
            case NodeType.CustomEntityNodeType: return <CustomEntityNode {...props} />
            case NodeType.PreBuiltEntityNodeType: return <PreBuiltEntityNode {...props} />
        }
    }

    onSelectOption = (option: IOption) => {
        const value = this.state.value
        const selectedText = getSelectedText(value)
        const change = value.change()
            .wrapInline({
                type: NodeType.CustomEntityNodeType,
                data: {
                    option,
                    text: selectedText
                }
            })
            .collapseToEnd()

        this.onChange(change)
    }

    render() {
        return (
            <div className="entity-labeler">
                <div className={`entity-labeler__custom-editor ${this.props.readOnly ? 'entity-labeler__custom-editor--read-only' : ''} ${this.props.isValid ? '' : 'entity-labeler__custom-editor--error'}`}>
                    <div className="entity-labeler__editor">
                        <Editor
                            className="slate-editor"
                            placeholder="Enter some text..."
                            value={this.state.value}
                            onChange={this.onChange}
                            renderNode={this.renderNode}
                            readOnly={this.props.readOnly}
                        />
                        <EntityPicker
                            isVisible={this.state.isMenuVisible}
                            options={this.props.options}
                            maxDisplayedOptions={4}
                            menuRef={this.menuRef}
                            position={this.state.menuPosition}
                            value={this.state.value}

                            onChange={this.onChange}
                            onClickNewEntity={this.props.onClickNewEntity}
                            onSelectOption={this.onSelectOption}
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