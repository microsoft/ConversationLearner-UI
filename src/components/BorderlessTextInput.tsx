import * as React from 'react'
import './BorderlessTextInput.css'

const testIdAttribute = 'data-testid'
interface Props {
    id: string
    placeholder: string
    value: string
    onChange: (value: string) => void
    maxLength: number
    [testIdAttribute]: string
    readOnly?: boolean
}

class component extends React.Component<Props> {
    static defaultProps = {
        id: "defaultBorderlessInputId",
        maxLength: 200
    }

    render() {
        return (
            <input
                readOnly={this.props.readOnly}
                data-testid={this.props[testIdAttribute]}
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