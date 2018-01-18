import * as React from 'react'
import { FormattedMessage } from 'react-intl'
import { FontClassNames } from 'office-ui-fabric-react'
import { FM } from '../react-intl-messages'
import * as ActionPayloadEditor from '../components/modals/ActionPayloadEditor'

interface State {
    value: ActionPayloadEditor.SlateValue
}

const optionsAvailableForPayload: ActionPayloadEditor.IOption[] = [
    {
        id: '1',
        name: 'docs'
    },
    {
        id: '2',
        name: 'documents'
    },
    {
        id: '3',
        name: 'doctors'
    }
]

export class Docs extends React.Component<{}, State> {
    state = {
        value: ActionPayloadEditor.Utilities.createTextValue('initial value')
    }

    onChangeValue = (value: ActionPayloadEditor.SlateValue) => {
        this.setState({
            value
        })
    }

    render() {
        
        return (
            <div className="blis-page">
                <div className={FontClassNames.superLarge}>
                    <FormattedMessage
                        id={FM.DOCS_TITLE}
                        defaultMessage="Docs"
                    />
                </div>
                <div className={FontClassNames.mediumPlus}>
                    <FormattedMessage
                        id={FM.PAGE_COMINGSOON}
                        defaultMessage="Coming Soon..."
                    />
                </div>
                <div>
                    <ActionPayloadEditor.Editor
                        options={optionsAvailableForPayload}
                        value={this.state.value}
                        placeholder="Phrase..."
                        onChange={value => this.onChangeValue(value)}
                        disabled={false}
                    />
                </div>
            </div>
        )
    }
}

export default Docs