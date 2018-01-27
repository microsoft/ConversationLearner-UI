import * as React from 'react'
import { Editor } from 'slate-react'
import { Text } from 'slate'
import * as Fuse from 'fuse.js'
import { IOption, IPickerProps, NodeTypes } from './models'
import MentionPlugin, { defaultPickerProps } from './MentionPlugin'
import OptionalPlugin from './OptionalPlugin'
import Picker from './Picker'
import * as Utilities from './utilities'
// TODO: Need to not have dependency outside of the current folder
// Move these to shared location between the two editors
import { FuseResult, MatchedOption } from '../../ExtractorResponseEditor/models'
import { convertMatchedTextIntoMatchedOption } from '../../ExtractorResponseEditor/utilities'
import './PayloadEditor.css'

const fuseOptions: Fuse.FuseOptions = {
    shouldSort: true,
    includeMatches: true,
    threshold: 0.6,
    location: 0,
    distance: 100,
    maxPatternLength: 32,
    minMatchCharLength: 1,
    keys: [
        "name"
    ]
}

export type SlateValue = any

interface Props {
    options: IOption[]
    value: SlateValue
    disabled: boolean
    placeholder: string
    onChange: (value: SlateValue) => void
}

interface State {
    maxDisplayedOptions: number
    highlightIndex: number
    matchedOptions: MatchedOption<IOption>[]
    menuProps: IPickerProps
}

export default class MentionEditor extends React.Component<Props, State> {
    fuse: Fuse
    menu: HTMLElement
    plugins: any[]

    state = {
        highlightIndex: 0,
        matchedOptions: [] as MatchedOption<IOption>[],
        maxDisplayedOptions: 4,
        menuProps: defaultPickerProps,
    }

    constructor(props: Props) {
        super(props)

        this.fuse = new Fuse(this.props.options, fuseOptions)
        this.state.matchedOptions = this.getDefaultMatchedOptions()

        this.plugins = [
            OptionalPlugin(),
            MentionPlugin({
                onChangeMenuProps: this.onChangePickerProps
            })
        ]
    }

    getDefaultMatchedOptions() {
        return this.props.options
            .filter((_, i) => i < this.state.maxDisplayedOptions)
            .map<MatchedOption<IOption>>((option, i) => ({
                highlighted: this.state.highlightIndex === i,
                matchedStrings: [{ text: option.name, matched: false }],
                original: option
            }))
    }

    onChangeValue = (change: any) => {
        const { value } = change

        // Must always update the value to allow normal use of editor such as cursor movement and typing
        this.props.onChange(value)

        // If we've somehow executed before the menu onRef and don't have a reference to the menu element return
        // We need to menu to compute the position so there is no point to continue
        const menu = this.menu
        if (!menu) {
            return
        }

        // Note: When debugging styling of Picker it is best to comment out this so you can inspect
        // picker elements while selection is not focused
        if (!value.isFocused) {
            this.onChangePickerProps({
                isVisible: false
            })
            return
        }

        const relativeParent = Utilities.getRelativeParent(this.menu.parentElement)
        const relativeRect = relativeParent.getBoundingClientRect()

        const selection = window.getSelection()
        if (!selection) {
            this.onChangePickerProps({
                isVisible: false
            })
            return
        }

        // TODO: This logic is duplicated inside the MentionPlugin.  Since it's required to be here, we could collapse the plugin into this module
        // and perhaps that would actually reduce code complexity even though it's less modular
        const isWithinMentionNode = value.inlines.size > 0 && value.inlines.last().type === NodeTypes.Mention
        // If not within an inline node, hide menu
        if (!isWithinMentionNode) {
            this.onChangePickerProps({
                isVisible: false
            })
            return
        }

        const isNodeCompleted = change.value.inlines.last().data.get('completed')
        const range = selection.getRangeAt(0)
        const selectionBoundingRect = range.getBoundingClientRect()
        // TODO: Hack to get HTML element of current text node since findDOMNode is not working for custom nodes
        // The menu currently moves as the user types, but it should stay fixed to the left position of the current node
        // In order to do this we need to get the DOM node and call getBoundingClientRect

        // const textNode = value.texts.last()
        // const textDomNode = findDOMNode(textNode)
        // const textDomNodeRectd = textDomNode.getBoundingClientRect()

        // An alternative method:

        // const selectionParentElement = selection.focusNode!.parentElement!
        // const selectionParentBoundingRect = selectionParentElement.getBoundingClientRect()
        // console.log(`selectionParentElement: `, selectionParentElement, selectionParentBoundingRect)

        const top = (selectionBoundingRect.bottom - relativeRect.top)// - window.scrollY
        const left = (selectionBoundingRect.left - relativeRect.left) + window.scrollX // - menu.offsetWidth / 2 + selectionBoundingRect.width / 2
        const bottom = relativeRect.height - (selectionBoundingRect.top - relativeRect.top)
        const searchText = ((value.inlines.size > 0) ? (value.inlines.first().text as string).substr(1) : '')
        const menuProps: Partial<IPickerProps> = {
            isVisible: !isNodeCompleted,
            bottom,
            left,
            top,
            searchText,
        }

        this.onChangePickerProps(menuProps)
    }

    onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>, change: any) => {
        const fn = this[`on${event.key}`]
        if (typeof fn === "function") {
            return fn.call(this, event, change)
        }
    }

    onArrowUp(event: React.KeyboardEvent<HTMLInputElement>, change: any) {
        console.log(`onArrowUp`)
        if (!this.state.menuProps.isVisible) {
            return undefined
        }

        event.preventDefault()

        this.setState(prevState => {
            const nextIndex = prevState.highlightIndex - 1
            const minIndex = 0
            const maxIndex = Math.max(0, prevState.matchedOptions.length - 1)

            return {
                highlightIndex: nextIndex < minIndex ? maxIndex : nextIndex
            }
        })

        return true
    }

    onArrowDown(event: React.KeyboardEvent<HTMLInputElement>, change: any) {
        console.log('onArrowDown')
        if (!this.state.menuProps.isVisible) {
            return undefined
        }

        event.preventDefault()

        this.setState(prevState => {
            const nextIndex = prevState.highlightIndex + 1
            const minIndex = 0
            const maxIndex = Math.max(0, prevState.matchedOptions.length - 1)

            return {
                highlightIndex: nextIndex > maxIndex ? minIndex : nextIndex
            }
        })

        return true
    }

    onEnter(event: React.KeyboardEvent<HTMLInputElement>, change: any) {
        console.log(`onEnter`)
        event.preventDefault()
        const option = this.state.matchedOptions[this.state.highlightIndex].original
        this.onCompleteNode(event, change, option)
        return true
    }

    private onCompleteNode(event: React.KeyboardEvent<HTMLInputElement> | undefined, change: any, option: IOption) {
        if (!this.state.menuProps.isVisible || this.state.matchedOptions.length === 0) {
            return undefined
        }

        // It's a little odd to have optional event here, there might be better way to refactor
        // When invoked on key events we have an event; however, on click from the Picker menu we do not
        // The alternative is moving this event logic into the key handlers but that also moves the above logic
        // and consolidating here seemed better for consistent maitanance
        event && event.preventDefault()

        const textNode = change.value.texts.last()
        if (textNode) {
            change
                .replaceNodeByKey(textNode.key, Text.fromJSON({
                    "kind": "text",
                    "leaves": [
                        {
                            "kind": "leaf",
                            "text": `$${option.name}`,
                            "marks": [] as any[]
                        }
                    ]
                }))
                .collapseToStartOfNextText()
        }
        else {
            console.warn(`Current selection did not contain any text nodes to insert option name into`, change.value.texts)
        }

        // Mark inline node as completed meaning it is now immutable
        const inline = change.value.inlines.find((i: any) => i.type === NodeTypes.Mention)
        if (inline) {
            change
                .setNodeByKey(inline.key, {
                    data: {
                        ...inline.get('data').toJS(),
                        option,
                        completed: true
                    }
                })
        }
        else {
            console.warn(`Could not find any inlines matching Mention type`, change.value.inlines)
        }

        change
            .collapseToStartOfNextText()

        // Reset highlight index to be ready for next node
        this.setState({
            highlightIndex: 0
        })

        return true
    }

    onEscape(event: React.KeyboardEvent<HTMLInputElement>, change: any): boolean | void {
        console.log(`onEscape`)
        if (!this.state.menuProps.isVisible) {
            return
        }

        const inline = change.value.inlines.find((i: any) => i.type === NodeTypes.Mention)
        if (!inline) {
            return
        }

        change.removeNodeByKey(inline.key)

        return true
    }

    onTab(event: React.KeyboardEvent<HTMLInputElement>, change: any): boolean | void {
        console.log(`onTab`)
        if (!this.state.menuProps.isVisible) {
            return
        }

        if (this.state.matchedOptions.length === 0) {
            return
        }

        const matchedOption = this.state.matchedOptions[this.state.highlightIndex]
        if (matchedOption) {
            throw new Error(`You attempted to access matched option at index ${this.state.highlightIndex}, but there are only ${this.state.matchedOptions.length} items`)
        }

        return this.onCompleteNode(event, change, matchedOption.original)
    }

    onChangePickerProps = (menuProps: Partial<IPickerProps>) => {
        // Note: Helpful to debug menu behavior
        // console.log(`onChangePickerProps: `, menuProps)

        const matchedOptions = (typeof menuProps.searchText !== 'string' || menuProps.searchText === "")
            ? this.getDefaultMatchedOptions()
            : this.fuse.search<FuseResult<IOption>>(menuProps.searchText!)
                .filter((_, i) => i < this.state.maxDisplayedOptions)
                .map(result => convertMatchedTextIntoMatchedOption(result.item.name, result.matches[0].indices, result.item))

        this.setState(prevState => ({
            matchedOptions,
            menuProps: { ...prevState.menuProps, ...menuProps }
        }))

        return true
    }

    onMenuRef = (element: HTMLElement) => {
        this.menu = element
    }

    onClickOption = (option: IOption) => {
        console.log(`onClickOption: `, option)
        const change = this.props.value.change()
        this.onCompleteNode(undefined, change, option)

        this.setState(prevState => ({
            menuProps: { ...prevState.menuProps, isVisible: false }
        }))
    }

    render() {
        const matchedOptions = this.state.matchedOptions.map((o, i) => ({
            ...o,
            highlighted: i === this.state.highlightIndex
        }))

        return <div className="editor-container">
            <Picker
                menuRef={this.onMenuRef}
                {...this.state.menuProps}
                matchedOptions={matchedOptions}
                onClickOption={this.onClickOption}
            />
            <Editor
                className={`editor ${this.props.disabled ? 'editor--disabled' : ''} ${this.props.value.isFocused ? 'editor--active' : ''}`}
                placeholder={this.props.placeholder}
                value={this.props.value}
                onChange={this.onChangeValue}
                onKeyDown={this.onKeyDown}
                plugins={this.plugins}
                readOnly={this.props.disabled}
            />
        </div>
    }
}