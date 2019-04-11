/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as React from 'react'
import { IOption, IPosition, MatchedOption } from './models'
import FuseMatch from './FuseMatch'
import './EntityPicker.css'
import * as OF from 'office-ui-fabric-react'

interface MenuProps {
    highlightIndex: number
    isOverlappingOtherEntities: boolean
    isVisible: boolean
    matchedOptions: MatchedOption<IOption>[]
    maxDisplayedOptions: number
    onKeyDown: (event: React.KeyboardEvent<HTMLElement>) => void
    onChangeSearchText: (value: string) => void
    onClickOption: (o: IOption) => void
    onClickNewEntity: (entityTypeFilter: string) => void
    position: IPosition | null
    menuRef: any
    searchText: string
    value: any,
    entityTypeFilter: string
}

interface ComponentState {
    resultsRef: React.RefObject<HTMLDivElement>
    searchRef: HTMLInputElement | undefined
}
export default class EntityPicker extends React.Component<MenuProps, ComponentState> {
    state: ComponentState = {
        resultsRef: React.createRef<HTMLDivElement>(),
        searchRef: undefined
    }

    componentDidUpdate(prevProps: MenuProps, prevState: ComponentState) {
        if (this.props.highlightIndex !== prevProps.highlightIndex && this.state.resultsRef.current) {
            this.scrollHighlightedElementIntoView(this.state.resultsRef.current)
        }
        
        // Focus search 
        if (this.state.searchRef) {
            this.state.searchRef.focus()
        }
    }

    scrollHighlightedElementIntoView = (resultsElement: HTMLDivElement) => {
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

    @OF.autobind
    setSearchRef(ref: HTMLInputElement): void {
        this.setState({searchRef: ref})
    }

    render() {
        const style = {
            left: (this.props.position && this.props.isVisible) ? `${this.props.position.left}px` : undefined,
            top: (this.props.position && this.props.isVisible) ? `${this.props.position.top}px` : undefined,
            height: !this.props.isOverlappingOtherEntities ? "auto" : "4em",
            marginBottom: !this.props.isOverlappingOtherEntities ? "0" : "1em"
        }

        if (this.props.isOverlappingOtherEntities) {
            return null
        }
        return (
            <div
                className={`custom-toolbar ${this.props.isVisible ? "custom-toolbar--visible" : ""}`}
                onKeyDown={this.props.onKeyDown}
                ref={this.props.menuRef}
                style={style}
                role="button"
            >
                <div className="custom-toolbar__search">
                    <input
                        autoFocus={true}
                        ref={this.setSearchRef}
                        data-testid="entity-picker-entity-search"
                        id="toolbar-input"
                        type="text"
                        placeholder="Search for entities"
                        value={this.props.searchText}
                        className="custom-toolbar__input"
                        onChange={event => this.props.onChangeSearchText(event.target.value)}
                    />
                </div>
                <OF.PrimaryButton
                    tabIndex={-1}
                    onClick={() => this.props.onClickNewEntity(this.props.entityTypeFilter)}
                    text="New Entity"
                    iconProps={{ iconName: 'Add' }}
                />
                <div className="custom-toolbar__results" ref={this.state.resultsRef}>
                    {this.props.matchedOptions.length === 0
                        ? <div className="custom-toolbar__result">No matching entities</div>
                        : this.props.matchedOptions.map((matchedOption, i) =>
                            <div
                                key={matchedOption.original.id}
                                onClick={() => this.props.onClickOption(matchedOption.original)}
                                className={`custom-toolbar__result ${this.props.highlightIndex === i ? 'custom-toolbar__result--highlight' : ''}`}
                                role="button"
                            >
                                <FuseMatch matches={matchedOption.matchedStrings} />
                            </div>
                        )}
                </div>
            </div>
        )
    }
}