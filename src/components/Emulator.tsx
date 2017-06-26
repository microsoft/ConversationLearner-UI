import * as React from 'react';
import Webchat from '../containers/Webchat'
import WebchatMetadata from '../containers/WebchatMetadata'
export default class Emulator extends React.Component<any, any> {
    constructor(p: any) {
        super(p);
        this.state = {
            displayMetadata: true
        }
        this.renderWithMeta = this.renderWithMeta.bind(this)
    }
    toggleMeta() {
        this.setState({
            displayMetadata: !this.state.displayMetadata
        })
    }
    renderWithMeta() {
        return (
            <div className='container'>
                <div className="webchatShrink">
                    <Webchat toggleMeta={this.toggleMeta.bind(this)} buttonText="HIDE METADATA"/>
                </div>
                <div className="webchatMetaShrink">
                    <WebchatMetadata/>
                </div>
            </div>
        )
    }
    render() {
        return (
            <div className='container'>
                { this.state.displayMetadata == true ? this.renderWithMeta() : <Webchat toggleMeta={this.toggleMeta.bind(this)} buttonText="SHOW METADATA" /> }
            </div>
        )

    }
}