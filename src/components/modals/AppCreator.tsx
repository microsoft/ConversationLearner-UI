import * as React from 'react';
import { returntypeof } from 'react-redux-typescript';
import { getLuisApplicationCultures } from '../../epics/apiHelpers'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Modal } from 'office-ui-fabric-react/lib/Modal';
import { PrimaryButton, DefaultButton, Dropdown, IDropdownOption, TextField, Label } from 'office-ui-fabric-react';
import { State } from '../../types'
import { FM } from '../../react-intl-messages'
import { injectIntl, InjectedIntlProps, defineMessages, FormattedMessage } from 'react-intl'
import { AppInput } from '../../types/models';

const messages = defineMessages({
    fieldErrorRequired: {
        id: FM.APPCREATOR_FIELDERROR_REQUIREDVALUE,
        defaultMessage: "Required Value"
    },
    fieldErrorAlphanumeric: {
        id: FM.APPCREATOR_FIELDERROR_ALPHANUMERIC,
        defaultMessage: 'Application name may only contain alphanumeric characters'
    },
    fieldErrorDistinct: {
        id: FM.APPCREATOR_FIELDERROR_DISTINCT,
        defaultMessage: 'Name is already in use.'
    }
})

interface ComponentState {
    appNameVal: string
    localeVal: string
    luisKeyVal: string
    localeOptions: IDropdownOption[]
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

        this.luisKeyChanged = this.luisKeyChanged.bind(this)
        this.onKeyDown = this.onKeyDown.bind(this)
        this.localeChanged = this.localeChanged.bind(this)
        this.onClickCreate = this.onClickCreate.bind(this)
        this.onClickCancel = this.onClickCancel.bind(this)
    }

    componentWillMount() {
        getLuisApplicationCultures()
            .then(cultures => {
                const cultureOptions = cultures.map<IDropdownOption>(c =>
                    ({
                        key: c.cultureCode,
                        text: c.cultureCode,
                    }))

                this.setState({
                    localeOptions: cultureOptions,
                    localeVal: cultureOptions[0].text
                })
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
    localeChanged(obj: IDropdownOption) {
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
        const appToAdd: AppInput = {
            appName: this.state.appNameVal,
            luisKey: this.state.luisKeyVal,
            locale: this.state.localeVal,
            metadata: {
                botFrameworkApps: []
            }
        }

        this.resetState()
        this.props.onSubmit(appToAdd)
    }

    // TODO: Refactor to use default form submission instead of manually listening for keys
    // Also has benefit of native browser validation for required fields
    onKeyDown(key: React.KeyboardEvent<HTMLElement>) {
        // On enter attempt to create the app if required fields are set
        if (key.keyCode == 13 && this.state.appNameVal && this.state.luisKeyVal) {
            this.onClickCreate();
        }
    }

    onGetNameErrorMessage(value: string): string {
        const { intl } = this.props
        if (value.length === 0) {
            return intl.formatMessage(messages.fieldErrorRequired)
        }

        if (!/^[a-zA-Z0-9- ]+$/.test(value)) {
            return intl.formatMessage(messages.fieldErrorAlphanumeric)
        }

        // Check that name isn't in use
        let foundApp = this.props.apps.find(a => a.appName == value)
        if (foundApp) {
            return intl.formatMessage(messages.fieldErrorDistinct)
        }

        return ""
    }

    onGetPasswordErrorMessage(value: string): string {
        return value ? "" : this.props.intl.formatMessage(messages.fieldErrorRequired);
    }

    render() {
        const { intl } = this.props
        return (
            <Modal
                isOpen={this.props.open}
                onDismiss={() => this.onClickCancel()}
                isBlocking={false}
                containerClassName='blis-modal blis-modal--small blis-modal--border'
            >
                <div className='blis-modal_header'>
                    <span className='ms-font-xxl ms-fontWeight-semilight'>
                        <FormattedMessage
                            id={FM.APPCREATOR_TITLE}
                            defaultMessage="Create a BLIS App"
                        />
                    </span>
                </div>
                <div>
                    <TextField
                        onGetErrorMessage={value => this.onGetNameErrorMessage(value)}
                        onChanged={text => this.nameChanged(text)}
                        label={intl.formatMessage({
                            id: FM.APPCREATOR_FIELDS_NAME_LABEL,
                            defaultMessage: "Name"
                        })}
                        placeholder={intl.formatMessage({
                            id: FM.APPCREATOR_FIELDS_NAME_PLACEHOLDER,
                            defaultMessage: "Application Name..."
                        })}
                        onKeyDown={key => this.onKeyDown(key)}
                        value={this.state.appNameVal} />
                    <Label>
                        <FormattedMessage
                            id={FM.APPCREATOR_FIELDS_LUISKEY_LABEL}
                            defaultMessage="LUIS Key"
                        /> <a href="https://www.luis.ai/user/settings" tabIndex={-1} className="ms-font-xs" target="_blank">
                            (<FormattedMessage
                                id={FM.APPCREATOR_FIELDS_LUISKEY_HELPTEXT}
                                defaultMessage="Find your key"
                            />)
                        </a>
                    </Label>
                    <TextField
                        onGetErrorMessage={value => this.onGetPasswordErrorMessage(value)}
                        onChanged={this.luisKeyChanged}
                        placeholder={intl.formatMessage({
                            id: FM.APPCREATOR_FIELDS_LUISKEY_PLACEHOLDER,
                            defaultMessage: "Key..."
                        })}
                        type="password"
                        onKeyDown={this.onKeyDown}
                        value={this.state.luisKeyVal} />
                    <Dropdown
                        label={intl.formatMessage({
                            id: FM.APPCREATOR_FIELDS_LOCALE_LABEL,
                            defaultMessage: 'Locale'
                        })}
                        defaultSelectedKey={this.state.localeVal}
                        options={this.state.localeOptions}
                        onChanged={this.localeChanged}
                    />
                </div>
                <div className='blis-modal_footer'>
                    <div className="blis-modal-buttons">
                        <div className="blis-modal-buttons_primary">
                            <PrimaryButton
                                disabled={!this.state.appNameVal || !this.state.luisKeyVal}
                                onClick={this.onClickCreate}
                                ariaDescription={intl.formatMessage({
                                    id: FM.APPCREATOR_CREATEBUTTON_ARIADESCRIPTION,
                                    defaultMessage: 'Create'
                                })}
                                text={intl.formatMessage({
                                    id: FM.APPCREATOR_CREATEBUTTON_TEXT,
                                    defaultMessage: 'Create'
                                })}
                            />
                            <DefaultButton
                                onClick={this.onClickCancel}
                                ariaDescription={intl.formatMessage({
                                    id: FM.APPCREATOR_CANCELBUTTON_ARIADESCRIPTION,
                                    defaultMessage: 'Cancel'
                                })}
                                text={intl.formatMessage({
                                    id: FM.APPCREATOR_CANCELBUTTON_TEXT,
                                    defaultMessage: 'Cancel'
                                })}
                            />
                        </div>
                    </div>
                </div>
            </Modal>
        )
    }
}

const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
    }, dispatch);
}
const mapStateToProps = (state: State) => {
    return {
        apps: state.apps.all
    }
}

export interface ReceivedProps {
    open: boolean
    onSubmit: (app: AppInput) => void
    onCancel: () => void
}

// Props types inferred from mapStateToProps & dispatchToProps
const stateProps = returntypeof(mapStateToProps);
const dispatchProps = returntypeof(mapDispatchToProps);
type Props = typeof stateProps & typeof dispatchProps & ReceivedProps & InjectedIntlProps

export default connect<typeof stateProps, typeof dispatchProps, ReceivedProps>(mapStateToProps, mapDispatchToProps)(injectIntl(AppCreator))