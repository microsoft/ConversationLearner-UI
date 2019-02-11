import * as React from 'react'
import './BorderlessTextInput.css'

// Renaming from Props because of https://github.com/Microsoft/tslint-microsoft-contrib/issues/339
interface ReceivedProps {
    id: string
    placeholder: string
    value: string
    onChange: (value: string) => void
}

type Props = ReceivedProps

const component: React.SFC<Props> = (props) => {
    return (
        <input className="cl-borderless-text-input"
            type="text"
            id={props.id}
            value={props.value}
            placeholder={props.placeholder}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => void props.onChange(event.target.value)}
            autoComplete="off"
        />
    )
}

export default component