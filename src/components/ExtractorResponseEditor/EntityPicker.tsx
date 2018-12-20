/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as React from 'react'
import { IOption, IPosition, MatchedOption } from './models'
import FuseMatch from './FuseMatch'
import './EntityPicker.css'
import { ScrollablePane } from 'office-ui-fabric-react'

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
    position: IPosition
    menuRef: any
    searchText: string
    value: any,
    entityTypeFilter: string
}

export default class EntityPicker extends React.Component<MenuProps> {
    render() {
        const style: any = {
            left: this.props.isVisible ? `1em` : null,
            bottom: this.props.isVisible ? `${this.props.position.bottom}px` : null,
            height: !this.props.isOverlappingOtherEntities ? "14em" : "4em",
            marginBottom: !this.props.isOverlappingOtherEntities ? "0" : "1em"
        }

        return (
            <div
                className={`custom-toolbar ${this.props.isVisible ? "custom-toolbar--visible cl-ux-shadowed" : ""}`}
                onKeyDown={this.props.onKeyDown}
                ref={this.props.menuRef}
                style={style}
            >
                {this.props.isOverlappingOtherEntities
                    ? <div className="custom-toolbar__warning">Cannot add overlapping entities.<br />Remove the entity or change the selection.</div>
                    : <React.Fragment>
                        <button
                            type="button"
                            tabIndex={-1}
                            onClick={() => this.props.onClickNewEntity(this.props.entityTypeFilter)}
                            className="custom-toolbar__new-entity-button"
                        >
                            New Entity
                        </button>
                        <div className="custom-toolbar__search">
                            <input
                                data-testid="entity-picker-entity-search"
                                id="toolbar-input"
                                type="text"
                                placeholder="Search for entities"
                                value={this.props.searchText}
                                className="custom-toolbar__input"
                                onChange={event => this.props.onChangeSearchText(event.target.value)}
                            />
                        </div>
                        {this.props.matchedOptions.length !== 0
                            && <ScrollablePane className="cl-ux-opaque" style={{ marginTop: "5.3em" }}>
                                {this.props.matchedOptions.map((matchedOption, i) =>
                                    <div
                                        key={matchedOption.original.id}
                                        onClick={() => this.props.onClickOption(matchedOption.original)}
                                        className={`custom-toolbar__result ${this.props.highlightIndex === i ? 'custom-toolbar__result--highlight' : ''}`}
                                    >
                                        <FuseMatch matches={matchedOption.matchedStrings} />
                                    </div>
                                )}

                            </ScrollablePane>}
                    </React.Fragment>
                }
            </div>
        )
    }
}