import * as React from 'react';
import { editBLISApplicationAsync } from '../actions/updateActions';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import TrainingGroundArenaHeader from '../components/TrainingGroundArenaHeader'
import { State } from '../types';
import { CommandButton, ChoiceGroup, TextField, DefaultButton, Dropdown, Label, List } from 'office-ui-fabric-react';
import { TextFieldPlaceholder } from './TextFieldPlaceholder';
import { BlisAppBase, BlisAppMetaData } from 'blis-models'

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
            appIdVal: '',
            appNameVal: '',
            luisKeyVal: '',
            edited: false,
            botFrameworkAppsVal: [],
            newBotVal: ""
        }
        this.luisKeyChanged = this.luisKeyChanged.bind(this)
        this.botIdChanged = this.botIdChanged.bind(this)
        this.appNameChanged = this.appNameChanged.bind(this)
    }
    componentWillMount() {
        let current: BlisAppBase = this.props.blisApps.current
        this.setState({
            localeVal: current.locale,
            appIdVal: current.appId,
            appNameVal: current.appName,
            luisKeyVal: current.luisKey,
            botFrameworkAppsVal: current.metadata.botFrameworkApps,
            newBotVal: ""
        })
    }
    componentDidUpdate() {
        let current: BlisAppBase = this.props.blisApps.current
        if (this.state.edited == false && (this.state.localeVal !== current.locale ||
            this.state.appIdVal !== current.appId ||
            this.state.appNameVal !== current.appName ||
            this.state.luisKeyVal !== current.luisKey ||
            this.state.botFrameworkAppsVal !== current.metadata.botFrameworkApps)) {
            this.setState({
                localeVal: current.locale,
                appIdVal: current.appId,
                appNameVal: current.appName,
                luisKeyVal: current.luisKey,
                botFrameworkAppsVal: current.metadata.botFrameworkApps
            })
        }
    }
    appNameChanged(text: string) {
        this.setState({
            appNameVal: text,
            edited: true
        })
    }
    botIdChanged(text: string) {
        this.setState({
            newBotVal: text,
            edited: true
        })
    }
    luisKeyChanged(text: string) {
        this.setState({
            luisKeyVal: text,
            edited: true
        })
    }
    botAdded() {
        let newBotApps = this.state.botFrameworkAppsVal.concat(this.state.newBotVal);
        this.setState({
            botFrameworkAppsVal: newBotApps,
            newBotVal: ""
        })
    }
    onRenderBotListRow(item?: any, index?: number) {
        return (
            <div className="textFieldInlineButtonDiv">
                <TextField className="ms-font-m-plus textFieldWithButton" disabled={true} value={item} />
            </div>
        )
    }
    discardChanges() {
        let current: BlisAppBase = this.props.blisApps.current
        this.setState({
            localeVal: current.locale,
            appIdVal: current.appId,
            appNameVal: current.appName,
            luisKeyVal: current.luisKey,
            botFrameworkAppsVal: current.metadata.botFrameworkApps,
            edited: false,
            newBotVal: ""
        })
    }
    editApp() {
        let current: BlisAppBase = this.props.blisApps.current;
        let meta: BlisAppMetaData = new BlisAppMetaData({
            botFrameworkApps: this.state.botFrameworkAppsVal
        })
        let appToAdd = new BlisAppBase({
            appName: this.state.appNameVal,
            appId: current.appId,
            luisKey: this.state.luisKeyVal,
            locale: current.locale,
            metadata: meta
        })
        this.props.editBLISApplication(this.props.userKey, appToAdd);
        this.setState({
            localeVal: current.locale,
            appIdVal: current.appId,
            appNameVal: current.appName,
            luisKeyVal: current.luisKey,
            edited: false,
            newBotVal: ""
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
                <TextField className="ms-font-m-plus" onChanged={(text) => this.appNameChanged(text)} label="Name" value={this.state.appNameVal} />
                <TextField className="ms-font-m-plus" disabled={true} label="App ID" value={this.state.appIdVal} />
                <TextField className="ms-font-m-plus" onChanged={(text) => this.luisKeyChanged(text)} label="LUIS Key" value={this.state.luisKeyVal} />
                <Label className="ms-font-m-plus">Locale</Label>
                <Dropdown
                    className="ms-font-m-plus"
                    options={options}
                    selectedKey={this.state.localeVal}
                    disabled={true}
                />
                <div>
                    <Label className="ms-font-m-plus">Bot Framework Apps</Label>
                    <List
                        items={this.state.botFrameworkAppsVal}
                        onRenderCell={this.onRenderBotListRow.bind(this)}
                    />
                    <div className="textFieldInlineButtonDiv">
                        <TextFieldPlaceholder className="ms-font-m-plus textFieldWithButton" onChanged={(text) => this.botIdChanged(text)} placeholder="Application ID" value={this.state.newBotVal} />
                        <CommandButton
                            data-automation-id='randomID16'
                            disabled={false}
                            onClick={this.botAdded.bind(this)}
                            className='goldButton buttonWithTextField'
                            ariaDescription='Add'
                            text='Add'
                        />
                    </div>
                </div>
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
        editBLISApplication: editBLISApplicationAsync,
    }, dispatch);
}
const mapStateToProps = (state: State) => {
    return {
        userKey: state.user.key,
        blisApps: state.apps
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(AppSettings);