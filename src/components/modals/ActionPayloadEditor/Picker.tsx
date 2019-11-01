/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import * as React from 'react'
import './Picker.css'
import { IOption } from './APEModels'
import { FuseMatch, MatchedOption } from '../../FuseMatch'

interface Props {
    matchedOptions: MatchedOption<IOption>[]
    isVisible: boolean
    left: number
    top: number
    onClickOption: (option: IOption) => void
}

interface PropsWithRef extends Props {
    menuRef: React.Ref<HTMLDivElement>
}

class Picker extends React.Component<PropsWithRef> {
    listRef =  React.createRef<HTMLDivElement>()

    componentDidUpdate() {
        if (this.listRef.current) {
            this.scrollHighlightedElementIntoView(this.listRef.current)
        }
    }

    scrollHighlightedElementIntoView = (resultsElement: HTMLDivElement) => {
        const selectedElement = resultsElement
            ? resultsElement.querySelector('.mention-picker-button--active') as HTMLElement
            : null

        if (selectedElement) {
            selectedElement.scrollIntoView({
                behavior: "smooth",
                block: "nearest"
            })
        }
    }

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
            <div className="mention-picker-list" ref={this.listRef}>
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

export default React.forwardRef<HTMLDivElement, Props>((props, ref) => <Picker {...props} menuRef={ref} />)