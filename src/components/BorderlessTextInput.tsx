import * as React from 'react'
import './BorderlessTextInput.css'

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
        this.setState({
            active: true
        })
    }

    onBlurInput = () => {
        this.setState({
            active: false
        })
    }

    onChangeInput = (event: React.ChangeEvent<HTMLInputElement>) => {
        this.props.onChange(event.target.value)
    }
    
    render () {
        return (
            <input className={`cl-borderless-text-input ${this.state.active ? 'cl-borderless-text-input--active' : ''}`}
                type="text"
                id={this.props.id}
                value={this.props.value}
                placeholder={this.props.placeholder}
                onChange={this.onChangeInput}
                onFocus={this.onFocusInput}
                onBlur={this.onBlurInput}
                autoComplete="off"
            />
        )
    }
}

export default component