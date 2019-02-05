import * as React from 'react'
import './BorderlessInput.css'

interface Props {
    id: string
    placeholder: string
    value: string
    onChange: (value: string) => void
}

interface State {
    active: boolean
}

class component extends React.Component<Props> {
    state: State = {
        active: false
    }

    onFocusInput = () => {
        console.log(`onClickInput`)
        this.setState({
            active: true
        })
    }

    onBlurInput = () => {
        console.log(`onBlur`)
        this.setState({
            active: false
        })
    }

    onChangeInput = (event: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = event.target.value
        this.props.onChange(inputValue)
    }
    
    render () {
        return (
            <input className={`cl-borderless-input ${this.state.active ? 'cl-borderless-input--active' : ''}`}
                type="text"
                id={this.props.id}
                value={this.props.value}
                placeholder={this.props.placeholder}
                onChange={this.onChangeInput}
                onFocus={this.onFocusInput}
                onBlur={this.onBlurInput}
            />
        )
    }
}

export default component