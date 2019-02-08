import * as React from 'react'
import * as OF from 'office-ui-fabric-react'
import * as Fuse from 'fuse.js'
import { FuseResult } from './ExtractorResponseEditor/models'
import './TagsInput.css'
import { IOption } from './modals/ActionPayloadEditor/APEModels'

interface Props extends React.HTMLProps<HTMLDivElement> {
    tags: string[]
    suggestedTags: string[]
    onAdd: (tag: string) => void
    onRemove: (tag: string) => void
}

interface State {
    inputValue: string
    showForm: boolean
    filteredSuggestedTags: string[]
    highlightIndex: number
}

const fuseOptions: Fuse.FuseOptions = {
    shouldSort: true,
    includeMatches: true,
    threshold: 0.6,
    location: 0,
    distance: 100,
    maxPatternLength: 32,
    minMatchCharLength: 1
}

class component extends React.Component<Props, State> {
    inputRef = React.createRef<HTMLInputElement>()
    fuse: Fuse

    state: Readonly<State> = {
        inputValue: '',
        showForm: false,
        filteredSuggestedTags: [],
        highlightIndex: -1
    }

    constructor(props: Props) {
        super(props)

        this.fuse = new Fuse(this.props.suggestedTags, fuseOptions)
    }

    componentDidMount() {
        this.setState({
            filteredSuggestedTags: this.props.suggestedTags.filter(st => !this.props.tags.some(t => t === st))
        })
    }

    componentWillReceiveProps(nextProps: Props) {
        // If either the tags or suggestedTags change recompute the filteredTags
        if (this.props.tags.length !== nextProps.tags.length
            || this.props.suggestedTags.length !== nextProps.suggestedTags.length) {
            console.log(`props changed`)
            this.setState({
                filteredSuggestedTags: nextProps.suggestedTags.filter(st => !nextProps.tags.some(t => t === st)),
            })

            if (this.props.suggestedTags.length !== nextProps.suggestedTags.length) {
                this.fuse = new Fuse(this.props.suggestedTags, fuseOptions)
            }
        }
    }

    onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        const tag = this.state.inputValue.trim()

        // Prevent submitting empty tags
        if (tag.length === 0) {
            return
        }

        this.props.onAdd(tag)
        this.setState({
            inputValue: '',
            highlightIndex: -1
        })
    }

    onChangeInput = (event: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = event.target.value

        const searchText = inputValue.trim()
        const matchedOptions = (searchText.length === 0)
            ? this.getUnusedTags(this.props.suggestedTags)
            : this.fuse.search<FuseResult<IOption>>(searchText)
        console.log(`Search Text: `, { searchText })
        console.log(`matchedOptions: `, { matchedOptions })

        const filteredSuggestedTags = this.props.suggestedTags.filter(t => t.toLowerCase().startsWith(searchText.toLowerCase()))
        console.log(`filteredSuggestedTags: `, { filteredSuggestedTags })

        this.setState({
            inputValue,
            filteredSuggestedTags
        })
    }

    onKeyDownInput = (event: React.KeyboardEvent<HTMLInputElement>) => {
        console.log(`onKeyDownInput: `, event.key)

        switch (event.key) {
            case 'ArrowUp':
                // Move highlight up unless it's already at top then move to bottom
                this.setState(prevState => ({
                    highlightIndex: prevState.highlightIndex <= 0
                        ? prevState.filteredSuggestedTags.length - 1
                        : prevState.highlightIndex - 1
                }))
                break
            case 'ArrowDown':
                // Move highlight down unless it's already at bottom then move to top
                this.setState(prevState => ({
                    highlightIndex: prevState.highlightIndex >= prevState.filteredSuggestedTags.length - 1
                        ? 0
                        : prevState.highlightIndex + 1
                }))
                break
            case 'Enter':
            case 'Tab':
                // Don't do anything is shift is pressed or nothing is highlighted
                if (event.shiftKey
                    || this.state.highlightIndex === -1) {
                    return
                }

                const highlightedTag = this.state.filteredSuggestedTags[this.state.highlightIndex]
                // Should never happen but if for some reason index is out of bounds return
                if (!highlightedTag) {
                    return
                }

                this.props.onAdd(highlightedTag)
                this.setState({
                    inputValue: '',
                    highlightIndex: -1,
                })
                event.stopPropagation()
                event.preventDefault()
                break
            case 'Escape':
                this.resetForm()
                break
            default:
            // Do nothing
        }
    }

    onBlurInput = () => {
        const tag = this.state.inputValue
        
        // If user accidentally clicked away before submission still save tag
        // They can always delete if unintended
        if (tag.length > 0) {
            this.props.onAdd(tag)
        }

        this.resetForm()
    }

    onShowForm = () => {
        this.setState(prevState => ({
            showForm: !prevState.showForm
        }), () => {
            if (this.inputRef.current) {
                this.inputRef.current.focus()
            }
        })
    }

    onMouseDownSuggestedTag = (event: React.MouseEvent<HTMLDivElement>, tag: string) => {
        console.log(`onClickSuggestedTag: `, tag)
        this.props.onAdd(tag)
        this.setState({
            inputValue: '',
            highlightIndex: -1,
        })

        event.stopPropagation()
        event.preventDefault()
    }

    private resetForm() {
        this.setState({
            inputValue: '',
            showForm: false,
            highlightIndex: -1,
        })
    }

    private getUnusedTags(suggestedTags: string[]) {
        return suggestedTags.filter(st => !this.props.tags.some(t => t === st))
    }

    render() {
        const { filteredSuggestedTags, highlightIndex } = this.state
        const { showForm } = this.state
        console.log({ suggestedTags: this.props.suggestedTags })
        console.log({ highlightIndex, filteredSuggestedTags })

        return (
            <div className="cl-tags">
                {this.props.tags.map((tag, i) =>
                    <div className="cl-tags__tag" key={i}>
                        <span>{tag}</span>
                        <button onClick={() => this.props.onRemove(tag)}>
                            <OF.Icon iconName="Clear" />
                        </button>
                    </div>
                )}
                {!showForm
                    ? <button className="cl-tags__button-add" id={this.props.id} onClick={() => this.onShowForm()} >
                        {this.props.tags.length === 0
                            ? 'Add Tag'
                            : <OF.Icon iconName="Add" />}
                    </button>
                    : <form onSubmit={this.onSubmit} className="cl-tags__form">
                        <input type="text"
                            ref={this.inputRef}
                            id={this.props.id}
                            value={this.state.inputValue}
                            onChange={this.onChangeInput}
                            onKeyDown={this.onKeyDownInput}
                            onBlur={this.onBlurInput}
                            autoComplete="off"
                        />
                        <div className="cl-tags__suggested-tags-container">
                            {filteredSuggestedTags.length !== 0
                                && <div className="cl-tags__suggested-tags">
                                    {filteredSuggestedTags.map((tag, i) =>
                                        <div
                                            key={i}
                                            className={`cl-tags__suggested-tags__button ${highlightIndex === i ? 'cl-tags__suggested-tags__button--highlight' : ''}`}
                                            onMouseDown={event => this.onMouseDownSuggestedTag(event, tag)}
                                        >{tag}</div>
                                    )}
                                </div>
                            }
                        </div>
                    </form>
                }
            </div>
        )
    }
}

export default component