/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as React from 'react'
import { IOption, IPosition } from './models'
import FuseMatch from './FuseMatch'
import './EntityPicker.css'
import * as OF from 'office-ui-fabric-react'
import { usePicker } from './EntityPickerContainerFc'

interface Props {
    /** 
     * This is kind of a one-off property for the scenario when we want the picker to show a warning message, although
     * it was easier than showing a completely different component
     */
    isVisible: boolean
    options: IOption[]
    maxDisplayedOptions: number
    value: any
    entityTypeFilter: string

    onClickNewEntity: (entityTypeFiler: string) => void
    onSelectOption: (o: IOption) => void

    isOverlappingOtherEntities: boolean
    position: IPosition | null
    menuRef: React.RefObject<HTMLDivElement>
}

const scrollHighlightedElementIntoView = (resultsElement: HTMLDivElement) => {
    const selectedElement = resultsElement
        ? resultsElement.querySelector('.custom-toolbar__result--highlight') as HTMLUListElement
        : null

    if (selectedElement) {
        setTimeout(() => {
            selectedElement.scrollIntoView({
                behavior: "smooth",
                block: "nearest"
            })
        }, 0)
    }
}

export const EntityPicker: React.FC<Props> = (props) => {
    const resultsRef = React.useRef<HTMLDivElement>(null)
    const { searchText, setSearchText, onKeyDown, matchedOptions, onClickOption, highlightIndex } = usePicker(
        props.options,
        props.maxDisplayedOptions,
        props.onSelectOption,
    )

    React.useEffect(() => {
        if (resultsRef.current) {
            scrollHighlightedElementIntoView(resultsRef.current)
        }
    }, [highlightIndex, resultsRef.current])

    const style = {
        left: (props.position && props.isVisible) ? `${props.position.left}px` : undefined,
        top: (props.position && props.isVisible) ? `${props.position.top}px` : undefined,
        height: !props.isOverlappingOtherEntities ? "auto" : "4em",
        marginBottom: !props.isOverlappingOtherEntities ? "0" : "1em"
    }

    if (props.isOverlappingOtherEntities) {
        return null
    }

    return (
        <div
            className={`custom-toolbar ${props.isVisible ? "custom-toolbar--visible" : ""}`}
            onKeyDown={onKeyDown}
            ref={props.menuRef}
            style={style}
            role="button"
        >
            <div className="custom-toolbar__search">
                <input
                    data-testid="entity-picker-entity-search"
                    id="toolbar-input"
                    type="text"
                    placeholder="Search for entities"
                    value={searchText}
                    className="custom-toolbar__input"
                    onChange={event => setSearchText(event.target.value)}
                />
            </div>
            <OF.PrimaryButton
                tabIndex={-1}
                onClick={() => props.onClickNewEntity(props.entityTypeFilter)}
                text="New Entity"
                iconProps={{ iconName: 'Add' }}
            />
            <div className="custom-toolbar__results" ref={resultsRef}>
                {matchedOptions.length === 0
                    ? <div className="custom-toolbar__result">No matching entities</div>
                    : matchedOptions.map((matchedOption, i) =>
                        <div
                            key={matchedOption.original.id}
                            onClick={() => onClickOption(matchedOption.original)}
                            className={`custom-toolbar__result ${highlightIndex === i ? 'custom-toolbar__result--highlight' : ''}`}
                            role="button"
                        >
                            <FuseMatch matches={matchedOption.matchedStrings} />
                        </div>
                    )}
            </div>
        </div>
    )
}

export default EntityPicker