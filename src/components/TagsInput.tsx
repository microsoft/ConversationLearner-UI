import * as React from 'react'
import * as OF from 'office-ui-fabric-react'
import * as Fuse from 'fuse.js'
import FuseMatch from './ExtractorResponseEditor/FuseMatch'
import { FuseResult, MatchedOption } from './ExtractorResponseEditor/models'
import { convertMatchedTextIntoMatchedOption } from './ExtractorResponseEditor/utilities'
import './TagsInput.css'

interface ITag {
    text: string
}
interface Props extends React.HTMLProps<HTMLDivElement> {
    allUniqueTags: ITag[]
    tags: string[]
    onAdd: (tag: string) => void
    onRemove: (tag: string) => void
}

interface State {
    inputValue: string
    showForm: boolean
    matchedOptions: MatchedOption<ITag>[]
    highlightIndex: number
}

const fuseOptions: Fuse.FuseOptions = {
    shouldSort: true,
    includeMatches: true,
    threshold: 0.6,
    location: 0,
    distance: 100,
    maxPatternLength: 32,
    minMatchCharLength: 1,
    keys: [
        "text"
    ]
}

class component extends React.Component<Props, State> {
    inputRef = React.createRef<HTMLInputElement>()
    suggestedTagsRef = React.createRef<HTMLDivElement>()
    fuse: Fuse

    state: Readonly<State> = {
        inputValue: '',
        showForm: false,
        matchedOptions: [],
        highlightIndex: -1
    }

    constructor(props: Props) {
        super(props)

        this.fuse = new Fuse(this.props.allUniqueTags, fuseOptions)
    }

    componentDidMount() {
        const matchedOptions = this.getSuggestedTags(this.props.allUniqueTags, this.props.tags)
        this.setState({
            matchedOptions
        })
    }

    componentWillReceiveProps(nextProps: Props) {
        if (this.props.tags.length !== nextProps.tags.length
            || this.props.allUniqueTags.length !== nextProps.allUniqueTags.length) {

            const matchedOptions = this.getSuggestedTags(nextProps.allUniqueTags, nextProps.tags)
            this.setState({
                matchedOptions
            })

            if (this.props.allUniqueTags.length !== nextProps.allUniqueTags.length) {
                this.fuse = new Fuse(this.props.allUniqueTags, fuseOptions)
            }
        }
    }

    componentDidUpdate(prevProps: Props, prevState: State) {
        if (this.state.highlightIndex !== prevState.highlightIndex && this.suggestedTagsRef.current) {
            this.scrollHighlightedElementIntoView(this.suggestedTagsRef.current)
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
        const matchedOptions: MatchedOption<ITag>[] = (searchText.length === 0)
            ? this.getSuggestedTags(this.props.allUniqueTags, this.props.tags)
            : this.fuse.search<FuseResult<ITag>>(searchText)
                .map(result => convertMatchedTextIntoMatchedOption(result.item.text, result.matches[0].indices, result.item))

        this.setState({
            inputValue,
            matchedOptions
        })
    }

    onKeyDownInput = (event: React.KeyboardEvent<HTMLInputElement>) => {
        const fn = this[`on${event.key}`]
        if (typeof fn === "function") {
            return fn.call(this, event)
        }
    }

    onArrowUp() {
        // Move highlight up unless it's already at top then move to bottom
        this.setState(prevState => ({
            highlightIndex: prevState.highlightIndex <= 0
                ? prevState.matchedOptions.length - 1
                : prevState.highlightIndex - 1
        }))
    }

    onArrowDown() {
        // Move highlight down unless it's already at bottom then move to top
        this.setState(prevState => ({
            highlightIndex: prevState.highlightIndex >= prevState.matchedOptions.length - 1
                ? 0
                : prevState.highlightIndex + 1
        }))
    }

    onEnter(event: React.KeyboardEvent<HTMLInputElement>) {
        if (event.shiftKey
            || this.state.highlightIndex === -1) {
            return
        }

        const highlightedTag = this.state.matchedOptions[this.state.highlightIndex]
        // Should never happen but if for some reason index is out of bounds return
        if (!highlightedTag) {
            return
        }

        this.props.onAdd(highlightedTag.original.text)
        this.setState({
            inputValue: '',
            highlightIndex: -1,
        })
        event.stopPropagation()
        event.preventDefault()

        return true
    }

    onTab(event: React.KeyboardEvent<HTMLInputElement>) {
        return this.onEnter(event)
    }

    onEscape() {
        this.resetForm()
    }

    onBlurInput = () => {
        const tag = this.state.inputValue

        // If user accidentally clicked away before submission still save tag
        // They can delete if unintended
        if (tag.length > 0) {
            this.props.onAdd(tag)
        }

        this.resetForm()
    }

    onClickAdd = () => {
        this.setState({
            showForm: true
        }, () => {
            if (this.inputRef.current) {
                this.inputRef.current.focus()
            }
        })
    }

    /** Use mouseDown instead of click in order to fire event before blur which removes element from DOM */
    onMouseDownSuggestedTag = (event: React.MouseEvent<HTMLDivElement>, tag: string) => {
        this.props.onAdd(tag)
        this.setState({
            inputValue: '',
            highlightIndex: -1,
        })

        event.stopPropagation()
        event.preventDefault()
    }

    private scrollHighlightedElementIntoView(resultsElement: HTMLDivElement) {
        const selectedElement = resultsElement.querySelector('.cl-tags__suggested-tags__button--highlight') as HTMLUListElement
        if (selectedElement) {
            setTimeout(() => {
                selectedElement.scrollIntoView({
                    behavior: "smooth",
                    block: "nearest"
                })
            }, 0)
        }
    }

    private resetForm() {
        this.setState({
            inputValue: '',
            showForm: false,
            highlightIndex: -1,
        })
    }

    // Only used when input is empty and can't use fuse.js but still need list of matchedOptions
    private getSuggestedTags(allUniqueTags: ITag[], currentTags: string[]) {
        return allUniqueTags
            .filter(st => !currentTags.some(t => t === st.text))
            .sort((a, b) => a.text.localeCompare(b.text))
            .map<MatchedOption<ITag>>((tag, i) => ({
                highlighted: false, // Won't affect rendering for this component
                matchedStrings: [{ text: tag.text, matched: false }],
                original: tag
            }))
    }

    render() {
        const { matchedOptions, highlightIndex } = this.state
        const { showForm } = this.state

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
                    ? <button className="cl-tags__button-add" id={this.props.id} onClick={() => this.onClickAdd()} >
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
                            {matchedOptions.length !== 0
                                && <div className="cl-tags__suggested-tags" ref={this.suggestedTagsRef}>
                                    {matchedOptions.map((matchedOption, i) =>
                                        <div
                                            key={i}
                                            className={`cl-tags__suggested-tags__button ${highlightIndex === i ? 'cl-tags__suggested-tags__button--highlight' : ''}`}
                                            onMouseDown={event => this.onMouseDownSuggestedTag(event, matchedOption.original.text)}
                                        >
                                            <FuseMatch matches={matchedOption.matchedStrings} />
                                        </div>
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