import * as React from 'react';
import axios from 'axios';
import { createBLISApplication } from '../actions/createActions';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Modal } from 'office-ui-fabric-react/lib/Modal';
import { CommandButton, Dialog, DialogFooter, DialogType, ChoiceGroup, TextField, DefaultButton, Dropdown } from 'office-ui-fabric-react';
import { setBLISAppDisplay, emptyStateProperties } from '../actions/updateActions'
import { fetchAllActions, fetchAllEntities, fetchAllTrainDialogs } from '../actions/fetchActions';
import { BlisAppBase, BlisAppMetaData } from 'blis-models'
import { developmentSubKeyLUIS } from '../secrets'
import { State } from '../types'

type CultureObject = {
    CultureCode: string;
    CultureName: string;
}
class BLISAppCreator extends React.Component<any, any> {
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
        this.props.createBLISApplication(this.props.userId, appToAdd);
        //need to empty entities, actions, and trainDialogs arrays
        this.props.emptyStateProperties();
        this.handleClose();
        this.props.setBLISAppDisplay("TrainingGround");
    }
    render() {
        return (
            <div>
                <CommandButton
                    data-automation-id='randomID'
                    disabled={false}
                    onClick={this.handleOpen.bind(this)}
                    className='goldButton'
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
                        <TextField onChanged={this.nameChanged.bind(this)} label="Name" placeholder="Application Name..." value={this.state.appNameVal} />
                        <TextField onChanged={this.luisKeyChanged.bind(this)} label="LUIS Key" placeholder="Key..." value={this.state.luisKeyVal} />
                        <Dropdown
                            label='Locale'
                            defaultSelectedKey={this.state.localeVal}
                            options={this.state.localeOptions}
                            onChanged={this.localeChanged.bind(this)}
                            selectedKey={this.state.localeVal}
                        />
                    </div>
                    <div className='modalFooter'>
                        <CommandButton
                            data-automation-id='randomID2'
                            disabled={false}
                            onClick={this.createApplication.bind(this)}
                            className='goldButton'
                            ariaDescription='Create'
                            text='Create'
                        />
                        <CommandButton
                            data-automation-id='randomID3'
                            className="grayButton"
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
        createBLISApplication: createBLISApplication,
        fetchAllActions: fetchAllActions,
        fetchAllEntities: fetchAllEntities,
        fetchAllTrainDialogs: fetchAllTrainDialogs,
        setBLISAppDisplay: setBLISAppDisplay,
        emptyStateProperties: emptyStateProperties
    }, dispatch);
}
const mapStateToProps = (state: State) => {
    return {
        blisApps: state.apps,
        userId: state.user.id
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(BLISAppCreator);