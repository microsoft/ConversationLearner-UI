import * as React from 'react'
import { ITag, TextField, Label } from 'office-ui-fabric-react'
import './ActionPayloadEditor.css'

interface TagMatch {
    startIndex: number
    endIndex: number
    tag: ITag
}

interface ComponentState {
    payload: string
    tagMatches: TagMatch[]
    isListVisible: boolean
    lastIndexOfOpeningCharacter: number
    visibleTags: ITag[]
}

const initialState: ComponentState = {
    payload: '',
    tagMatches: [],
    isListVisible: false,
    lastIndexOfOpeningCharacter: -1,
    visibleTags: []
}

export interface Props {
    tags: ITag[],
    value: string,
    onMatchTag: (tag: ITag) => void,
    onUnmatchTag: (tag: ITag) => void,
}

class ActionPayloadEditor extends React.Component<Props, ComponentState> {
    state = initialState

    componentWillMount() {
        console.log(`componentWillMount`)

        this.setState({
            payload: this.props.value
        })
    }

    componentWillReceiveProps(nextProps: Props) {
        console.log(`componentWillReceiveProps`, nextProps)

        this.setState({
            payload: nextProps.value
        })
    }

    onChangedPayload(payload: string) {
        console.log(`onChangedPayload: `, payload)

        const nextState: Partial<ComponentState> = {
            payload
        }

        const lastIndexOfOpeningCharacter = payload.lastIndexOf('{')
        const lastIndexOfClosingCharacter = payload.lastIndexOf('}')

        // If there is a '{' after the last '}' then display the tag list
        if (lastIndexOfOpeningCharacter > lastIndexOfClosingCharacter) {
            nextState.isListVisible = true
            nextState.lastIndexOfOpeningCharacter = lastIndexOfOpeningCharacter
            const charactersForSearch = payload.substring(nextState.lastIndexOfOpeningCharacter + 1)
            nextState.visibleTags = charactersForSearch.length === 0
                ? []
                : this.props.tags.filter(tag => tag.name.toLowerCase().startsWith(charactersForSearch.toLowerCase()))
        }
        // Force the list to be closed since it might have been open from previous state
        else {
            nextState.isListVisible = false
            nextState.lastIndexOfOpeningCharacter = -1
            nextState.visibleTags = []
        }

        this.setState(prevState => nextState)
    }

    onFocusTextField(event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) {
        console.log(`onFocusText: `, event)
        this.onChangedPayload(this.state.payload)
    }

    /**
     * If the user presses Tab and there are options available select the first option
     * Else if the user presses Enter attempt to submit the form.
     * Otherwise, do nothing.
     */
    onKeyDownTextField(event: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) {
        console.log(`onKeyDownTextField: `, event)
        const input = event.currentTarget as HTMLInputElement
        console.log(`
        selectionDirection: ${input.selectionDirection}
        selectionEnd: ${input.selectionEnd}
        selectionStart: ${input.selectionStart}
        `)

        // If user presses Tab (9) and there is tag options availabe, select the first option
        switch (event.key) {
            case "ArrowUp": {
                console.log(`ArrowUp`)
                break
            }
            case "ArrowDown": {
                console.log(`ArrowDown`)
                break
            }
            case "Tab": {
                if (this.state.isListVisible === true
                    && this.state.visibleTags.length > 0) {
                    event.preventDefault()
                    event.stopPropagation()
                    const firstTag = this.state.visibleTags[0]
                    this.matchTag(firstTag)
                }
                break
            }
            case "Enter": {
                // this.createOnClick();
                break
            }
            case "Backspace":
            case "Delete": {
                console.log('characters removed')
                // TODO: Find alternative method to allow detecting other cases where user deletes text from match
                // E.g. select letter lo out of 'co[lo]r' and presses 'A' it would be 'coAr' and invalidat the match
                // however, we currently would have to handle this case in the onChanged handler and do complicated
                // comprison to find the changed text which seems unreliable.

                const currentIndex = input.selectionStart
                const matchToDelete = this.state.tagMatches
                    .find(tagMatch => tagMatch.startIndex <= currentIndex && currentIndex <= tagMatch.endIndex)
                if (matchToDelete) {
                    this.unmatchTag(matchToDelete)
                }
                break;
            }
        }
    }

    onBlurTextField(event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) {
        console.log(`onBlurTextField: `, event)

        // If the blur event was due to the user click on an item in the dropdown
        // settings the dropdown visibility to false would hide it before the click
        // even could get handle. We wrap this in a timeout to defer it just enough to
        // allow the click to be handled.
        setTimeout(() => {
            this.setState({
                isListVisible: false
            })
        }, 100)
    }

    onClickVisibleTag(tag: ITag) {
        console.log(`onClickVisibleTag: `, tag)
        this.matchTag(tag)
    }

    matchTag(tag: ITag) {
        // Update payload to include tag name enclosed in brackets
        // and notify consumers of tag match
        this.setState(prevState => {
            const tagText = `{${tag.name}}`
            const tagMatch: TagMatch = {
                startIndex: prevState.lastIndexOfOpeningCharacter,
                endIndex: prevState.lastIndexOfOpeningCharacter + tagText.length,
                tag
            }

            console.log(`add tag match: `, tagMatch)

            const nextPayload = prevState.payload.substring(0, prevState.lastIndexOfOpeningCharacter) + tagText
            return {
                payload: nextPayload,
                tagMatches: [...prevState.tagMatches, tagMatch],
                isListVisible: false
            }
        }, () => {
            this.props.onMatchTag(tag)
        })
    }

    /**
     * Remove tag from payload, remove tag from matches list and notify parents of unmatched tag
     */
    unmatchTag(tagMatch: TagMatch) {
        this.setState(prevState => {
            // Remove tagMatch from old payload
            const nextPayload = prevState.payload.substring(0, tagMatch.startIndex) + prevState.payload.substring(tagMatch.endIndex)

            return {
                payload: nextPayload,
                tagMatches: prevState.tagMatches.filter(t => t.startIndex === tagMatch.startIndex)
            }
        }, () => {
            this.props.onUnmatchTag(tagMatch.tag)
        })
    }

    render() {
        return (
            <div className="blis-payload-editor">
                <Label>Payload</Label>
                <div className="blis-payload-editor_options-container">
                    {this.state.isListVisible &&
                        <div className="blis-payload-editor_options">
                            {this.state.visibleTags.length === 0
                                ? <div>No matching tags</div>
                                : this.state.visibleTags.map(tag => (
                                    <div
                                        className="blis-payload-editor-option"
                                        key={tag.key}
                                        onClick={() => this.onClickVisibleTag(tag)}
                                    >
                                        {tag.name}
                                    </div>
                                ))}
                        </div>}
                </div>
                <TextField
                    onGetErrorMessage={value => value ? "" : "Payload is required"}
                    onChanged={payload => this.onChangedPayload(payload)}
                    placeholder="Payload..."
                    autoFocus={true}
                    onFocus={e => this.onFocusTextField(e)}
                    onKeyDown={e => this.onKeyDownTextField(e)}
                    onBlur={e => this.onBlurTextField(e)}
                    value={this.state.payload}
                />
            </div>
        )
    }
}

export default ActionPayloadEditor