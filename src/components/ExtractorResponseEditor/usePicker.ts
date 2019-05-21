/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as React from 'react'
import * as Fuse from 'fuse.js'
import { IOption, FuseResult, MatchedOption } from './models'
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

type IndexFunction = (x: number, limit?: number) => number
// TODO: Id function doesn't need limit but TS requires consistent arguments
const id = (x: number) => x
const increment = (x: number, limit: number) => (x + 1) > limit ? 0 : x + 1
const decrement = (x: number, limit: number) => (x - 1) < 0 ? limit : x - 1

const convertOptionToMatchedOption = (option: IOption): MatchedOption<IOption> => {
    return {
        highlighted: false,
        matchedStrings: [{ text: option.name, matched: false }],
        original: option
    }
}

const getMatchedOptions = (searchText: string, options: IOption[], fuse: Fuse, maxDisplayedOptions: number): MatchedOption<IOption>[] => {
    return searchText.trim().length === 0
        ? options
            .filter((_, i) => i < maxDisplayedOptions)
            .map(convertOptionToMatchedOption)
        : fuse.search<FuseResult<IOption>>(searchText)
            .filter((_, i) => i < maxDisplayedOptions)
            .map(result => convertMatchedTextIntoMatchedOption(result.item.name, result.matches[0].indices, result.item))
}

export const usePicker = (
    options: IOption[],
    maxDisplayedOptions: number,
    onSelectOption: (option: IOption) => void,
) => {
    const fuseRef = React.useRef(new Fuse(options, fuseOptions))
    const [searchText, setSearchText] = React.useState('')
    const [highlightIndex, setHighlighIndex] = React.useState(0)
    const [matchedOptions, setMatchedOptions] = React.useState<MatchedOption<IOption>[]>([])

    const resetHighlighIndex = () => setHighlighIndex(0)
    const onClickOption = (option: IOption) => onSelectOption(option)
    const onSelectHighlightedOption = () => {
        const option = matchedOptions[highlightIndex]
        if (option) {
            onSelectOption(option.original)
        }
    }
    
    React.useEffect(() => {
        fuseRef.current = new Fuse(options, fuseOptions)
        const computed = getMatchedOptions(searchText, options, fuseRef.current, maxDisplayedOptions)
        setMatchedOptions(computed)
    }, [options.length, searchText])

    // Ensure highlight index is within bounds
    React.useEffect(() => {
        // Decrease highlight index to last item when options list shrinks due to search filter
        let min = highlightIndex > (matchedOptions.length - 1)
            ? (matchedOptions.length - 1)
            : highlightIndex

        // Don't allow an index less than 0 (if options length is 0)
        min = Math.max(0, min)
        setHighlighIndex(min)
    }, [matchedOptions.length])

    const onKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
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

                onSelectHighlightedOption()
                event.stopPropagation()
                event.preventDefault()
                break;
            default:
        }

        setHighlighIndex(modifyFunction(highlightIndex, matchedOptions.length - 1))
    }

    return {
        searchText,
        setSearchText,
        onKeyDown,
        matchedOptions,
        onClickOption,
        highlightIndex,
        resetHighlighIndex,
    }
}