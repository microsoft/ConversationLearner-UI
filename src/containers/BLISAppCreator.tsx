import * as React from 'react';
import { returntypeof } from 'react-redux-typescript';
import axios from 'axios';
import { createBLISApplicationAsync } from '../actions/createActions';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Modal } from 'office-ui-fabric-react/lib/Modal';
import { CommandButton, Dialog, DialogFooter, DialogType, ChoiceGroup, TextField, DefaultButton, Dropdown } from 'office-ui-fabric-react';
import { TextFieldPlaceholder } from './TextFieldPlaceholder';
import { setDisplayMode, emptyStateProperties } from '../actions/displayActions'
import { fetchAllActionsAsync, fetchAllEntitiesAsync, fetchAllTrainDialogsAsync } from '../actions/fetchActions';
import { BlisAppBase, BlisAppMetaData } from 'blis-models'
import { developmentSubKeyLUIS } from '../secrets'
import { State } from '../types'

type CultureObject = {
    CultureCode: string;
    CultureName: string;
}
class BLISAppCreator extends React.Component<Props, any> {
    constructor(p: any) {
        super(p);
        this.state = {
            open: false,
            appNameVal: '',
            localeVal: '',
            luisKeyVal: '',
            localeOptions: []
        }
    }
    componentWillMount() {
        let url = 'https://westus.api.cognitive.microsoft.com/luis/v1.0/prog/apps/applicationcultures?';
        const subscriptionKey: string = developmentSubKeyLUIS;
        const config = {
            headers: { "Ocp-Apim-Subscription-Key": subscriptionKey }
        };
        axios.get(url, config)
            .then((response) => {
                if (response.data) {
                    let cultures: CultureObject[] = response.data;
                    let cultureOptions = cultures.map((c: CultureObject) => {
                        return {
                            key: c.CultureCode,
                            text: c.CultureCode,
                        }
                    })
                    this.setState({
                        localeOptions: cultureOptions,
                        localeVal: cultureOptions[0].text
                    })
                }


            })
    }
    handleOpen() {
        this.setState({
            open: true
        })
    }
    handleClose() {
        let firstValue = this.state.localeOptions[0].text
        this.setState({
            open: false,
            appNameVal: '',
            localeVal: firstValue,
            luisKeyVal: ''
        })
    }
    nameChanged(text: string) {
        this.setState({
            appNameVal: text
        })
    }
    localeChanged(obj: { text: string }) {
        this.setState({
            localeVal: obj.text
        })
    }
    luisKeyChanged(text: string) {
        this.setState({
            luisKeyVal: text
        })
    }
    createApplication() {
        let meta = new BlisAppMetaData({
            botFrameworkApps: []
        })
        let appToAdd = new BlisAppBase({
            appId: null,
            appName: this.state.appNameVal,
            luisKey: this.state.luisKeyVal,
            locale: this.state.localeVal,
            metadata: meta
        })
        this.props.createBLISApplication(this.props.userKey, this.props.userId, appToAdd);
        //need to empty entities, actions, and trainDialogs arrays
        this.props.emptyStateProperties();
        this.handleClose();
    }
    checkIfBlank(value :string): string {
        return value ? "" : "Required Value";
    }
    render() {
        return (
            <div>
                <CommandButton
                    data-automation-id='randomID'
                    disabled={false}
                    onClick={this.handleOpen.bind(this)}
                    className='blis-button--gold'
                    ariaDescription='Create a New Application'
                    text='New App'
                />
                <Modal
                    isOpen={this.state.open}
                    onDismiss={this.handleClose.bind(this)}
                    isBlocking={false}
                    containerClassName='createModal'
                >
                    <div className='modalHeader'>
                        <span className='ms-font-xxl ms-fontWeight-semilight'>Create a BLIS App</span>
                    </div>
                    <div>
                        <TextFieldPlaceholder 
                            onGetErrorMessage={ this.checkIfBlank.bind(this)}
                            onChanged={this.nameChanged.bind(this)} 
                            label="Name" 
                            placeholder="Application Name..." 
                            value={this.state.appNameVal} />
                        <TextFieldPlaceholder 
                            onGetErrorMessage={ this.checkIfBlank.bind(this)}
                            onChanged={this.luisKeyChanged.bind(this)} 
                            label="LUIS Key" 
                            placeholder="Key..." 
                            value={this.state.luisKeyVal} />
                        <Dropdown
                            label='Locale'
                            defaultSelectedKey={this.state.localeVal}
                            options={this.state.localeOptions}
                            onChanged={this.localeChanged.bind(this)}
                        />
                    </div>
                    <div className='modalFooter'>
                        <CommandButton
                            data-automation-id='randomID2'
                            disabled={!this.state.appNameVal || !this.state.luisKeyVal}
                            onClick={this.createApplication.bind(this)}
                            className='blis-button--gold'
                            ariaDescription='Create'
                            text='Create'
                        />
                        <CommandButton
                            data-automation-id='randomID3'
                            className="blis-button--gray"
                            disabled={false}
                            onClick={this.handleClose.bind(this)}
                            ariaDescription='Cancel'
                            text='Cancel'
                        />
                    </div>
                </Modal>
            </div>
        );
    }
}
const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
        createBLISApplication: createBLISApplicationAsync,
        fetchAllActions: fetchAllActionsAsync,
        fetchAllEntities: fetchAllEntitiesAsync,
        fetchAllTrainDialogs: fetchAllTrainDialogsAsync,
        setDisplayMode: setDisplayMode,
        emptyStateProperties: emptyStateProperties
    }, dispatch);
}
const mapStateToProps = (state: State) => {
    return {
        blisApps: state.apps,
        userId: state.user.id,
        userKey: state.user.key
    }
}
// Props types inferred from mapStateToProps & dispatchToProps
const stateProps = returntypeof(mapStateToProps);
const dispatchProps = returntypeof(mapDispatchToProps);
type Props = typeof stateProps & typeof dispatchProps;

export default connect(mapStateToProps, mapDispatchToProps)(BLISAppCreator);