import * as React from 'react'
import * as OF from 'office-ui-fabric-react'
import './Tags.css'

interface Props extends React.HTMLProps<HTMLDivElement> {
    tags: string[]
    onAdd: (tag: string) => void
    onRemove: (tag: string) => void
}

interface State {
    inputValue: string
    showForm: boolean
}

class component extends React.Component<Props, State> {
    inputRef = React.createRef<HTMLInputElement>()
    
    state: Readonly<State> = {
        inputValue: '',
        showForm: false
    }

    onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        const tag = this.state.inputValue
        this.props.onAdd(tag)
        this.setState({
            inputValue: ''
        })
    }

    onChangeInput = (event: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = event.target.value
        this.setState({
            inputValue
        })
    }

    onBlurInput = () => {
        this.setState({
            showForm: false
        })
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
    
    render() {
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
                {!this.state.showForm
                    ? <button className="cl-tags__button-add" id={this.props.id} onClick={() => this.onShowForm()} >
                        {this.props.tags.length === 0
                        ? 'Add Tag'
                        : <OF.Icon iconName="Add" />}
                    </button>
                    : <form onSubmit={this.onSubmit}>
                    <input type="text"
                        ref={this.inputRef}
                        id={this.props.id}
                        value={this.state.inputValue}
                        onChange={this.onChangeInput}
                        onBlur={this.onBlurInput}
                    />
                </form>
                }
            </div>
        )
    }
}

export default component