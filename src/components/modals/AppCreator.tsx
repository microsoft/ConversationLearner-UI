import * as React from 'react';
import { returntypeof } from 'react-redux-typescript';
import axios from 'axios';
import { createBLISApplicationAsync } from '../../actions/createActions';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Modal } from 'office-ui-fabric-react/lib/Modal';
import { CommandButton, Dropdown, TextField } from 'office-ui-fabric-react';
import { emptyStateProperties } from '../../actions/displayActions'
import { BlisAppBase, BlisAppMetaData } from 'blis-models'
import { developmentSubKeyLUIS } from '../../secrets'
import { State } from '../../types'

type CultureObject = {
    CultureCode: string;
    CultureName: string;
}

interface ComponentState {
    appNameVal: string
    localeVal: string
    luisKeyVal: string
    localeOptions: IOption[]
}

interface IOption {
    key: string
    text: string
}

class AppCreator extends React.Component<Props, ComponentState> {
    state: ComponentState = {
        appNameVal: '',
        localeVal: '',
        luisKeyVal: '',
        localeOptions: []
    }

    constructor(p: Props) {
        super(p)

        this.checkIfBlank = this.checkIfBlank.bind(this)
        this.luisKeyChanged = this.luisKeyChanged.bind(this)
        this.onKeyDown = this.onKeyDown.bind(this)
        this.localeChanged = this.localeChanged.bind(this)
        this.onClickCreate = this.onClickCreate.bind(this)
        this.onClickCancel = this.onClickCancel.bind(this)
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
                    let cultureOptions = cultures.map(c => {
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


    resetState() {
        let firstValue = this.state.localeOptions[0].text
        this.setState({
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
        
    onClickCancel() {
        this.resetState()
        this.props.onCancel()
    }

    onClickCreate() {
        const appToAdd = new BlisAppBase({
            appName: this.state.appNameVal,
            luisKey: this.state.luisKeyVal,
            locale: this.state.localeVal,
            metadata: new BlisAppMetaData({
                botFrameworkApps: []
            })
        })
        this.props.createBLISApplicationAsync(this.props.userKey, this.props.userId, appToAdd);
        //need to empty entities, actions, and trainDialogs arrays
        this.props.emptyStateProperties();
        this.resetState();
        this.props.onSubmit()
    }

    // TODO: Refactor to use default form submission instead of manually listening for keys
    // Also has benefit of native browser validation for required fields
    onKeyDown(key: React.KeyboardEvent<HTMLElement>) {
        // On enter attempt to create the app if required fields are set
        if (key.keyCode == 13 && this.state.appNameVal && this.state.luisKeyVal) {
            this.onClickCreate();
        }
    }

    checkIfBlank(value: string): string {
        return value ? "" : "Required Value";
    }

    render() {
        return (
            <Modal
                isOpen={this.props.open}
                onDismiss={() => this.onClickCancel()}
                isBlocking={false}
                containerClassName='blis-modal blis-modal--small blis-modal--border'
            >
                <div className='blis-modal_title'>
                    <span className='ms-font-xxl ms-fontWeight-semilight'>Create a BLIS App</span>
                </div>
                <div>
                    <TextField
                        onGetErrorMessage={value => this.checkIfBlank(value)}
                        onChanged={text => this.nameChanged(text)}
                        label="Name"
                        placeholder="Application Name..."
                        onKeyDown={key => this.onKeyDown(key)}
                        value={this.state.appNameVal} />
                    <TextField
                        onGetErrorMessage={this.checkIfBlank}
                        onChanged={this.luisKeyChanged}
                        label="LUIS Key"
                        placeholder="Key..."
                        type="password"
                        onKeyDown={this.onKeyDown}
                        value={this.state.luisKeyVal} />
                    <Dropdown
                        label='Locale'
                        defaultSelectedKey={this.state.localeVal}
                        options={this.state.localeOptions}
                        onChanged={this.localeChanged}
                    />
                </div>
                <div className='blis-modal_buttonbox'>
                    <CommandButton
                        disabled={!this.state.appNameVal || !this.state.luisKeyVal}
                        onClick={this.onClickCreate}
                        className='blis-button--gold'
                        ariaDescription='Create'
                        text='Create'
                    />
                    <CommandButton
                        className="blis-button--gray"
                        onClick={this.onClickCancel}
                        ariaDescription='Cancel'
                        text='Cancel'
                    />
                </div>
            </Modal>
        )
    }
}
const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
        createBLISApplicationAsync,
        emptyStateProperties
    }, dispatch);
}
const mapStateToProps = (state: State) => {
    return {
        blisApps: state.apps,
        userId: state.user.id,
        userKey: state.user.key
    }
}

export interface ReceivedProps {
    open: boolean
    onSubmit: () => void
    onCancel: () => void
}

// Props types inferred from mapStateToProps & dispatchToProps
const stateProps = returntypeof(mapStateToProps);
const dispatchProps = returntypeof(mapDispatchToProps);
type Props = typeof stateProps & typeof dispatchProps & ReceivedProps;

export default connect<typeof stateProps, typeof dispatchProps, ReceivedProps>(mapStateToProps, mapDispatchToProps)(AppCreator);