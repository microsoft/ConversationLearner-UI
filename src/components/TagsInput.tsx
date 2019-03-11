import * as React from 'react'
import * as OF from 'office-ui-fabric-react'
import * as Fuse from 'fuse.js'
import { FM } from '../react-intl-messages'
import FormattedMessageId from './FormattedMessageId'
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
    maxTags: number
    magTagLength: number
}

interface State {
    hasMaxTags: boolean
    inputValue: string
    showForm: boolean
    matchedOptions: MatchedOption<ITag>[]
    highlightIndex: number
    pendingTagIsDuplicate: boolean
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

    static defaultProps = {
        maxTags: 20,
        magTagLength: 100
    }

    state: Readonly<State> = {
        hasMaxTags: false,
        inputValue: '',
        showForm: false,
        matchedOptions: [],
        highlightIndex: -1,
        pendingTagIsDuplicate: false
    }

    constructor(props: Props) {
        super(props)

        this.fuse = new Fuse(this.props.allUniqueTags, fuseOptions)
    }

    componentDidMount() {
        const hasMaxTags = this.props.tags.length > this.props.maxTags
        const matchedOptions = this.getSuggestedTags(this.props.allUniqueTags, this.props.tags)

        this.setState({
            hasMaxTags,
            matchedOptions
        })
    }

    componentWillReceiveProps(nextProps: Props) {
        if (this.props.tags.length !== nextProps.tags.length
            || this.props.allUniqueTags.length !== nextProps.allUniqueTags.length) {

            const hasMaxTags = nextProps.tags.length >= nextProps.maxTags
            const matchedOptions = this.getSuggestedTags(nextProps.allUniqueTags, nextProps.tags)
            this.setState({
                hasMaxTags,
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
        if (tag.length === 0
            || this.state.pendingTagIsDuplicate) {
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
        const pendingTagIsDuplicate = this.props.tags.some(t => t === inputValue)
        const searchText = inputValue.trim()
        const matchedOptions: MatchedOption<ITag>[] = (searchText.length === 0)
            ? this.getSuggestedTags(this.props.allUniqueTags, this.props.tags)
            : this.fuse.search<FuseResult<ITag>>(searchText)
                .map(result => convertMatchedTextIntoMatchedOption(result.item.text, result.matches[0].indices, result.item))
                // Remove matches for tags that are already added
                .filter(option => !this.props.tags.some(t => t === option.original.text))

        this.setState({
            inputValue,
            pendingTagIsDuplicate,
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
            || this.state.highlightIndex === -1
            || this.state.pendingTagIsDuplicate) {
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
        const tag = this.state.inputValue.trim()

        // If user accidentally clicked away before submission still save tag
        // They can delete if unintended
        if (tag.length > 0
            && !this.state.pendingTagIsDuplicate) {
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
            pendingTagIsDuplicate: false
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
        const { matchedOptions, highlightIndex, hasMaxTags, showForm, pendingTagIsDuplicate } = this.state
        const dataTestId = this.props['data-testid']

        return (
            <div className="cl-tags" data-testid={dataTestId} >
                {this.props.tags.map((tag, i) =>
                    <div className="cl-tags__tag" key={i}>
                        <span>{tag}</span>
                        <button onClick={() => this.props.onRemove(tag)}>
                            <OF.Icon iconName="Clear" />
                        </button>
                    </div>
                )}
                {!hasMaxTags && (!showForm
                    ? <button className="cl-tags__button-add" id={this.props.id} onClick={() => this.onClickAdd()} >
                        {this.props.tags.length === 0
                            ? <FormattedMessageId id={FM.TAGS_INPUT_ADD} />
                            : <OF.Icon iconName="Add" />}
                    </button>
                    : <>
                        <form onSubmit={this.onSubmit} className="cl-tags__form">
                            <input type="text"
                                ref={this.inputRef}
                                id={this.props.id}
                                value={this.state.inputValue}
                                onChange={this.onChangeInput}
                                onKeyDown={this.onKeyDownInput}
                                onBlur={this.onBlurInput}
                                autoComplete="off"
                                spellCheck={false}
                                maxLength={this.props.magTagLength}
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
                        {pendingTagIsDuplicate && <div className="cl-tags-error"><OF.Icon iconName="Warning" /> <FormattedMessageId id={FM.TAGS_INPUT_ERROR_DUPLICATE} /></div>}
                    </>)
                }
            </div>
        )
    }
}

export default component