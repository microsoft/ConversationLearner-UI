import * as React from 'react';
import { createBLISApplication } from '../actions/create';
import { setWebchatDisplay, toggleTrainDialog } from '../actions/update';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { State } from '../types';
import { CommandButton, IIconProps, IIconStyles } from 'office-ui-fabric-react';
interface Props {
    toggleMeta: Function;
    buttonText: string
}
class Webchat extends React.Component<any, any> {
    constructor(p: Props) {
        super(p);
    }
    render() {
        return (
            <div className="container">
                <div className="webchatHeader">
                    <CommandButton
                        data-automation-id='randomID12'
                        disabled={false}
                        className='webchatGoBack'
                        onClick={() => this.props.setWebchatDisplay(false)}
                        ariaDescription={this.props.buttonText}
                        iconProps={{ iconName: 'Cancel' }}
                    />
                    <CommandButton
                        data-automation-id='randomID11'
                        disabled={false}
                        onClick={() => this.props.toggleMeta()}
                        className='toggleMeta'
                        ariaDescription={this.props.buttonText}
                        text={this.props.buttonText}
                    />
                </div>
                    <div className="toggleTrainDialogBack">
                        <CommandButton
                            data-automation-id='randomID14'
                            disabled={false}
                            className='toggleTrainDialog'
                            onClick={() => this.props.toggleTrainDialog(false)}
                            ariaDescription={this.props.buttonText}
                            iconProps={{ iconName: 'Back' }}
                        />
                    </div>
                    <div>
                    </div>
                    <div className="toggleTrainDialogForward">
                        <CommandButton
                            data-automation-id='randomID13'
                            disabled={false}
                            onClick={() => this.props.toggleTrainDialog(true)}
                            className='toggleTrainDialog'
                            ariaDescription={this.props.buttonText}
                            iconProps={{ iconName: 'Forward' }}
                        />
                    </div>
            </div>
        );
    }
}
const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
        createBLISApplication: createBLISApplication,
        setWebchatDisplay: setWebchatDisplay,
        toggleTrainDialog: toggleTrainDialog
    }, dispatch);
}
const mapStateToProps = (state: State) => {
    return {
        blisApps: state.apps,
        trainDialogs: state.trainDialogs
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(Webchat);