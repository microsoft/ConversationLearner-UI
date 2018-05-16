import * as React from 'react'
import * as OF from 'office-ui-fabric-react'
import './TextPayloadRenderer.css'

interface Props {
    original: string
    currentMemory: string
}

interface State {
    isOriginalVisible: boolean
}

export default class Component extends React.Component<Props, State> {
    state = {
        isOriginalVisible: false
    }

    onChangedVisible = () => {
        this.setState(prevState => ({
            isOriginalVisible: !prevState.isOriginalVisible
        }))
    }

    render() {
        return <div className={`${OF.FontClassNames.mediumPlus} cl-textpayload`}>
            <div className="cl-textpayload__string">{this.state.isOriginalVisible
                ? this.props.original
                : this.props.currentMemory
            }</div>
            {this.props.currentMemory !== this.props.original
                && <div>
                <OF.Toggle
                    checked={this.state.isOriginalVisible}
                    onChanged={this.onChangedVisible}
                />
            </div>}
        </div>
    }
}