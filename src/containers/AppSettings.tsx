import * as React from 'react';
import { editBLISApplication } from '../actions/update';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import TrainingGroundArenaHeader from '../components/TrainingGroundArenaHeader'
import { State } from '../types';
import { BLISApplication } from '../models/Application'
import { CommandButton, ChoiceGroup, TextField, DefaultButton, Dropdown, Label } from 'office-ui-fabric-react';

const styles = {
    shown: {
        visibility: "visible"
    },
    hidden: {
        visibility: "hidden"
    }
}
class AppSettings extends React.Component<any, any> {
    constructor(p: any) {
        super(p);
        this.state = {
            localeVal: '',
            modelIDVal: '',
            appNameVal: '',
            luisKeyVal: '',
            edited: false
        }
        this.luisKeyChanged = this.luisKeyChanged.bind(this)
    }
    componentWillMount() {
        let current: BLISApplication = this.props.blisApps.current
        this.setState({
            localeVal: current.locale,
            modelIDVal: current.modelID,
            appNameVal: current.appName,
            luisKeyVal: current.luisKey
        })
    }
    componentDidUpdate() {
        let current: BLISApplication = this.props.blisApps.current
        if (this.state.edited == false && (this.state.localeVal !== current.locale ||
            this.state.modelIDVal !== current.modelID ||
            this.state.appNameVal !== current.appName ||
            this.state.luisKeyVal !== current.luisKey)) {
            this.setState({
                localeVal: current.locale,
                modelIDVal: current.modelID,
                appNameVal: current.appName,
                luisKeyVal: current.luisKey
            })
        }
    }
    luisKeyChanged(text: string) {
        this.setState({
            luisKeyVal: text,
            edited: true
        })
    }
    discardChanges() {
        let current: BLISApplication = this.props.blisApps.current
        this.setState({
            localeVal: current.locale,
            modelIDVal: current.modelID,
            appNameVal: current.appName,
            luisKeyVal: current.luisKey,
            edited: false
        })
    }
    editApp() {
        let current: BLISApplication = this.props.blisApps.current
        let appToAdd = new BLISApplication(current.modelID, current.appName, this.state.luisKeyVal, current.locale);
        this.props.editBLISApplication(appToAdd);
        this.setState({
            localeVal: current.locale,
            modelIDVal: current.modelID,
            appNameVal: current.appName,
            luisKeyVal: current.luisKey,
            edited: false
        })
    }
    render() {
        let options = [{
            key: this.state.localeVal,
            text: this.state.localeVal,
        }]
        let buttonsDivStyle = this.state.edited == true ? styles.shown : styles.hidden;
        return (
            <div>
                <TrainingGroundArenaHeader title="Settings" description="Control your application versions, who has access to it and whether it is public or private...." />
                <TextField className="ms-font-m-plus" disabled={true} label="Name" value={this.state.appNameVal} />
                <TextField className="ms-font-m-plus" disabled={true} label="Model ID" value={this.state.modelIDVal} />
                <TextField className="ms-font-m-plus" onChanged={(text) => this.luisKeyChanged(text)} label="LUIS Key" value={this.state.luisKeyVal} />
                <Dropdown
                    className="ms-font-m-plus" 
                    label='Locale'
                    defaultSelectedKey={this.state.localeVal}
                    options={options}
                    selectedKey={this.state.localeVal}
                    disabled={true}
                />
                <div style={buttonsDivStyle} className="saveAppChangesButtonsDiv">
                    <CommandButton
                        data-automation-id='randomID6'
                        disabled={false}
                        onClick={this.editApp.bind(this)}
                        className='goldButton'
                        ariaDescription='Save Changes'
                        text='Save Changes'
                    />
                    <CommandButton
                        data-automation-id='randomID7'
                        className="grayButton"
                        disabled={false}
                        onClick={this.discardChanges.bind(this)}
                        ariaDescription='Discard'
                        text='Discard'
                    />
                </div>
            </div>
        );
    }
}
const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
        editBLISApplication: editBLISApplication,
    }, dispatch);
}
const mapStateToProps = (state: State) => {
    return {
        blisApps: state.apps
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(AppSettings);