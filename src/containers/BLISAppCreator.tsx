import * as React from 'react';
import { createBLISApplication } from '../actions/create';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Modal } from 'office-ui-fabric-react/lib/Modal';
import { CommandButton, Dialog, DialogFooter, DialogType, ChoiceGroup, TextField, DefaultButton, Dropdown } from 'office-ui-fabric-react';
import { setBLISAppDisplay } from '../actions/update'
import { fetchAllActions, fetchAllEntities, fetchAllTrainDialogs } from '../actions/fetch'
import { BLISApplication } from '../models/Application'
class BLISAppCreator extends React.Component<any, any> {
    constructor(p: any) {
        super(p);
        this.state = {
            open: false,
            appNameVal: '',
            localeVal: 'East-US',
            luisKeyVal: ''
        }
    }
    handleOpen() {
        this.setState({
            open: true
        })
    }
    handleClose() {
        this.setState({
            open: false,
            appNameVal: '',
            localeVal: null,
            luisKeyVal: ''
        })
    }
    nameChanged(text: string) {
        this.setState({
            appNameVal: text
        })
    }
    localeChanged(obj: {text: string}) {
        this.setState({
            localeVal: obj.text
        })
    }
    luisKeyChanged(text: string) {
        this.setState({
            luisKeyVal: text
        })
    }
    generateGUID(): string {
        let d = new Date().getTime();
        let guid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
            let r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (char == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
        return guid;
    }
    createApplication() {
        let randomGUID = this.generateGUID();
        let appToAdd = new BLISApplication(randomGUID, this.state.appNameVal, this.state.luisKeyVal, this.state.localeVal);
        this.props.createBLISApplication(appToAdd);
        this.props.fetchAllActions(randomGUID);
        this.props.fetchAllEntities(randomGUID);
        this.props.fetchAllTrainDialogs(randomGUID);
        this.handleClose();
        this.props.setBLISAppDisplay("TrainingGround");
    }
    render() {
        let localeOptions = ['East-US', 'West-US']
        let options = localeOptions.map(v => {
            return {
                key: v,
                text: v
            }
        })
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
                            defaultSelectedKey='East-US'
                            options={options}
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
        setBLISAppDisplay: setBLISAppDisplay
    }, dispatch);
}
const mapStateToProps = (state: any) => {
    return {
        blisApps: state.apps
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(BLISAppCreator);