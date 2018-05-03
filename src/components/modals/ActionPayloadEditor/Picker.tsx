/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as React from 'react'
import './Picker.css'
import { IOption } from './models'
import { MatchedOption } from '../../ExtractorResponseEditor/models'
import FuseMatch from '../../ExtractorResponseEditor/FuseMatch'

interface Props {
    matchedOptions: MatchedOption<IOption>[]
    isVisible: boolean
    bottom: number
    left: number
    top: number
    searchText: string
    menuRef: (element: HTMLDivElement) => void
    onClickOption: (option: IOption) => void
}

export default class Picker extends React.Component<Props, {}> {
    render() {
        const style: any = {
            left: `${this.props.left}px`,
            top: `${this.props.top}px`,
        }

        return <div
            className={`mention-picker ${this.props.isVisible ? 'mention-picker--visible' : ''}`}
            ref={this.props.menuRef}
            style={style}
        >
            <div className="mention-picker-list">
                {this.props.matchedOptions.length === 0
                    ? <div className="mention-picker-button">No Results</div>
                    : this.props.matchedOptions.map((matchedOption, i) =>
                    <button
                        key={matchedOption.original.id}
                        type="button"
                        className={`mention-picker-button ${(matchedOption as any).highlighted ? 'mention-picker-button--active' : ''}`}
                        onMouseDown={() => this.props.onClickOption(matchedOption.original)}
                    >
                        <FuseMatch matches={matchedOption.matchedStrings} />
                    </button>
                )}
            </div>
        </div>
    }
}