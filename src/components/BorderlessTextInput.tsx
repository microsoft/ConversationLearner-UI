import * as React from 'react'
import './BorderlessTextInput.css'

// Renaming from Props because of https://github.com/Microsoft/tslint-microsoft-contrib/issues/339
interface Props {
    id: string
    placeholder: string
    value: string
    onChange: (value: string) => void
    maxLength: number
    ['data-testid']: string
}

class component extends React.Component<Props> {
    static defaultProps = {
        id: "defaultBorderlessInputId",
        maxLength: 200
    }

    render() {
        return (
            <input
                data-testid={this.props['data-testid']}
                className="cl-borderless-text-input"
                type="text"
                id={this.props.id}
                value={this.props.value}
                placeholder={this.props.placeholder}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => void this.props.onChange(event.target.value)}
                autoComplete="off"
                maxLength={this.props.maxLength}
            />
        )
    }
}

export default component