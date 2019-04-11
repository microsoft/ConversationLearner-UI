/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as React from 'react'
import EntityPicker from './EntityPicker'
import * as Fuse from 'fuse.js'
import { IOption, IPosition, FuseResult, MatchedOption } from './models'
import { convertMatchedTextIntoMatchedOption } from './utilities'

/**
 * See http://fusejs.io/ for information about options meaning and configuration
 */
const fuseOptions: Fuse.FuseOptions = {
    shouldSort: true,
    includeMatches: true,
    threshold: 0.4,
    location: 0,
    distance: 10,
    maxPatternLength: 32,
    minMatchCharLength: 1,
    keys: [
        "name"
    ]
}

interface Props {
    /** 
     * This is kind of a one-off property for the scenario when we want the picker to show a warning message, although
     * it was easier than showing a completely different component
     */
    isOverlappingOtherEntities: boolean
    isVisible: boolean
    options: IOption[]
    maxDisplayedOptions: number
    menuRef: any
    position: IPosition | null
    value: any
    entityTypeFilter: string

    onClickNewEntity: (entityTypeFiler: string) => void
    onSelectOption: (o: IOption) => void

}

interface State {
    highlightIndex: number
    searchText: string
    matchedOptions: MatchedOption<IOption>[]
}

const initialState: Readonly<Pick<State, "highlightIndex" | "searchText">> = {
    highlightIndex: 0,
    searchText: ''
}

type IndexFunction = (x: number, limit?: number) => number
// TODO: Id function doesn't need limit but TS requires consistent arguments
const id = (x: number) => x
const increment = (x: number, limit: number) => (x + 1) > limit ? 0 : x + 1
const decrement = (x: number, limit: number) => (x - 1) < 0 ? limit : x - 1

export default class EntityPickerContainer extends React.Component<Props, State> {
    defaultMatchedOptions: MatchedOption<IOption>[]
    fuse: Fuse
    element: HTMLElement

    constructor(props: Props) {
        super(props)

        this.onChangeSearchText = this.onChangeSearchText.bind(this)
        this.fuse = new Fuse(this.props.options, fuseOptions)

        this.defaultMatchedOptions = props.options.filter((_, i) => i < props.maxDisplayedOptions)
            .map<MatchedOption<IOption>>(option => ({
                highlighted: false,
                matchedStrings: [{ text: option.name, matched: false }],
                original: option
            }))

        this.state = {
            ...initialState,
            matchedOptions: this.defaultMatchedOptions
        }
    }

    componentWillReceiveProps(nextProps: Props) {
        if ((this.props.isVisible === false
            && nextProps.isVisible === true)) {

            this.setState({
                ...initialState,
                matchedOptions: this.defaultMatchedOptions
            })
        }

        if (nextProps.options.length !== this.props.options.length) {
            this.fuse = new Fuse(nextProps.options, fuseOptions)

            // Recompute default options in case options list and max displayed props have changed
            this.defaultMatchedOptions = nextProps.options.filter((_, i) => i < nextProps.maxDisplayedOptions)
                .map<MatchedOption<IOption>>(option => ({
                    highlighted: false,
                    matchedStrings: [{ text: option.name, matched: false }],
                    original: option
                }))

            // We want to still show all options of the user has entered nothing or whitespace so trim and check for empty condition
            const normalizedSearchText = this.state.searchText.trim()
            const matchedOptions = (normalizedSearchText.length === 0)
                ? this.defaultMatchedOptions
                : this.fuse.search<FuseResult<IOption>>(normalizedSearchText)
                    .filter((_, i) => i < nextProps.maxDisplayedOptions)
                    .map(result => convertMatchedTextIntoMatchedOption(result.item.name, result.matches[0].indices, result.item))

            this.setState({
                matchedOptions
            })
        }
    }

    onKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
        let modifyFunction: IndexFunction = id

        switch (event.key) {
            case 'ArrowUp': {
                modifyFunction = decrement
                break;
            }
            case 'ArrowDown':
                modifyFunction = increment
                break;
            case 'Enter':
            case 'Tab':
                // Only simulate completion on 'forward' tab
                if (event.shiftKey) {
                    return
                }

                // It's possible to tab into the entity picker without their being a selection
                if (this.props.value.selection.isCollapsed) {
                    console.warn(`preventing action because entity picker is focused without selection`)
                    return
                }
                this.onSelectHighlightedOption()
                event.stopPropagation()
                event.preventDefault()
                break;
        }

        this.setState(prevState => ({
            highlightIndex: modifyFunction(prevState.highlightIndex, prevState.matchedOptions.length - 1)
        }))
    }

    onSelectHighlightedOption = () => {
        const matchedOption = this.state.matchedOptions[this.state.highlightIndex]
        // It's possible that highlight option is 0 even though there are no matched options because text doesn't match any
        // in this case matchedOption will be null and we must disregard it
        if (!matchedOption) {
            console.warn(`onSelectOption was skipped because matchedOption was null`)
            return
        }

        this.props.onSelectOption(matchedOption.original)
        this.setState({
            ...initialState
        })
    }

    onChangeSearchText(searchText: string) {
        const normalizedSearchText = searchText.trim()
        const matchedOptions = (normalizedSearchText.length === 0)
            ? this.defaultMatchedOptions
            : this.fuse.search<FuseResult<IOption>>(normalizedSearchText)
                .filter((_, i) => i < this.props.maxDisplayedOptions)
                .map(result => convertMatchedTextIntoMatchedOption(result.item.name, result.matches[0].indices, result.item))

        this.setState(prevState => ({
            searchText,
            matchedOptions,
            highlightIndex: prevState.highlightIndex > (matchedOptions.length - 1) ? 0 : prevState.highlightIndex
        }))
    }

    onClickResult = (option: IOption) => {
        // TODO: Look at invoking callbacks within setState callback to ensure it occurs after reset
        this.props.onSelectOption(option)
        this.setState({
            ...initialState
        })
    }

    onRef = (node: HTMLElement) => {
        this.element = node
    }

    render() {
        return (
            <EntityPicker
                highlightIndex={this.state.highlightIndex}
                isOverlappingOtherEntities={this.props.isOverlappingOtherEntities}
                isVisible={this.props.isVisible}
                matchedOptions={this.state.matchedOptions}
                maxDisplayedOptions={this.props.maxDisplayedOptions}
                position={this.props.position}
                menuRef={this.props.menuRef}
                searchText={this.state.searchText}
                value={this.props.value}

                onChangeSearchText={this.onChangeSearchText}
                onClickOption={this.onClickResult}
                onClickNewEntity={this.props.onClickNewEntity}
                onKeyDown={this.onKeyDown}
                entityTypeFilter={this.props.entityTypeFilter}
            />
        )
    }
}