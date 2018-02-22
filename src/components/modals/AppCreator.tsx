import * as React from 'react';
import { returntypeof } from 'react-redux-typescript';
import { getLuisApplicationCultures } from '../../epics/apiHelpers'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Modal } from 'office-ui-fabric-react/lib/Modal';
import * as OF from 'office-ui-fabric-react'
import { State, localStorageKeyForLuisAuthoringKey, localStorageKeyForLuisConsumptionKey } from '../../types'
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
    },
    passwordHidden: {
        id: FM.SETTINGS_PASSWORDHIDDEN,
        defaultMessage: 'Show'
    },
    passwordVisible: {
        id: FM.SETTINGS_PASSWORDVISIBLE,
        defaultMessage: 'Hide'
    },
})

interface ComponentState {
    appNameVal: string
    localeVal: string
    luisAuthoringKeyVal: string
    luisConsumptionKeyVal: string
    localeOptions: OF.IDropdownOption[],
    isLuisAuthoringKeyVisible: boolean,
    luisAuthoringKeyShowHideText: string,
    isLuisConsumptionKeyVisible: boolean,
    luisConsumptionKeyShowHideText: string,
}

class AppCreator extends React.Component<Props, ComponentState> {
    state: ComponentState = {
        appNameVal: '',
        localeVal: '',
        luisAuthoringKeyVal: '',
        luisConsumptionKeyVal: '',
        localeOptions: [],
        isLuisAuthoringKeyVisible: false,
        luisAuthoringKeyShowHideText: this.props.intl.formatMessage(messages.passwordHidden),
        isLuisConsumptionKeyVisible: false,
        luisConsumptionKeyShowHideText: this.props.intl.formatMessage(messages.passwordHidden),
    }

    constructor(p: Props) {
        super(p)

        this.luisAuthoringKeyChanged = this.luisAuthoringKeyChanged.bind(this)
        this.luisConsumptionKeyChanged = this.luisConsumptionKeyChanged.bind(this)
        this.onKeyDown = this.onKeyDown.bind(this)
        this.localeChanged = this.localeChanged.bind(this)
        this.onClickCreate = this.onClickCreate.bind(this)
        this.onClickCancel = this.onClickCancel.bind(this)
    }

    componentWillMount() {
        getLuisApplicationCultures()
            .then(cultures => {
                const cultureOptions = cultures.map<OF.IDropdownOption>(c =>
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

    componentWillReceiveProps(nextProps: Props) {
        // Reset when opening modal
        if (this.props.open === false && nextProps.open === true) {
            let firstValue = this.state.localeOptions[0].text
            this.setState({
                appNameVal: '',
                localeVal: firstValue,
                isLuisAuthoringKeyVisible: false,
                luisAuthoringKeyShowHideText: this.props.intl.formatMessage(messages.passwordHidden),
                luisAuthoringKeyVal: localStorage.getItem(localStorageKeyForLuisAuthoringKey),
                isLuisConsumptionKeyVisible: false,
                luisConsumptionKeyShowHideText: this.props.intl.formatMessage(messages.passwordHidden),
                luisConsumptionKeyVal: localStorage.getItem(localStorageKeyForLuisConsumptionKey),
            })
        }
    }

    nameChanged(text: string) {
        this.setState({
            appNameVal: text
        })
    }
    localeChanged(obj: OF.IDropdownOption) {
        this.setState({
            localeVal: obj.text
        })
    }
    luisAuthoringKeyChanged(text: string) {
        this.setState({
            luisAuthoringKeyVal: text
        })
    }
    luisConsumptionKeyChanged(text: string) {
        this.setState({
            luisConsumptionKeyVal: text
        })
    }
    onClickCancel() {
        this.props.onCancel()
    }

    onClickCreate() {
        const appToAdd: AppInput = {
            appName: this.state.appNameVal,
            luisKey: this.state.luisAuthoringKeyVal,
            // TODO: Enable when schema is updated to allow authoring and consumption
            //luisAuthoringKey: this.state.luisAuthoringKeyVal,
            //luisConsumptionKey: this.state.luisConsumptionKeyVal,
            locale: this.state.localeVal,
            metadata: {
                botFrameworkApps: [],
                markdown: null,
                video: null
            }
        }

        // TODO: This was the simplest solution to isolate locale storage usage of luis key to this component
        // but it seems like poor practice to scatter this around the app.
        // Alternate solution which seems more idomatic is to create LocalStorage state object with reducer which reacts to actions, and component which maps the state
        // to the browser's localStorage on ever update; however, this seems overly complicated for the simple tasks we have
        localStorage.setItem(localStorageKeyForLuisAuthoringKey, this.state.luisAuthoringKeyVal)
        localStorage.setItem(localStorageKeyForLuisConsumptionKey, this.state.luisConsumptionKeyVal)
        this.props.onSubmit(appToAdd)
    }

    // TODO: Refactor to use default form submission instead of manually listening for keys
    // Also has benefit of native browser validation for required fields
    onKeyDown(event: React.KeyboardEvent<HTMLElement>) {
        // On enter attempt to create the app if required fields are set
        if (event.keyCode === 13 && this.state.appNameVal && this.state.luisAuthoringKeyVal) {
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

    onClickToggleLuisAuthoringKeyVisibility = () => {
        this.setState((prevState: ComponentState) => ({
            isLuisAuthoringKeyVisible: !prevState.isLuisAuthoringKeyVisible,
            luisAuthoringKeyShowHideText: !prevState.isLuisAuthoringKeyVisible
                ? this.props.intl.formatMessage(messages.passwordVisible)
                : this.props.intl.formatMessage(messages.passwordHidden)
        }))
    }

    onClickToggleLuisConsumptionKeyVisibility = () => {
        this.setState((prevState: ComponentState) => ({
            isLuisConsumptionKeyVisible: !prevState.isLuisConsumptionKeyVisible,
            luisConsumptionKeyShowHideText: !prevState.isLuisConsumptionKeyVisible
                ? this.props.intl.formatMessage(messages.passwordVisible)
                : this.props.intl.formatMessage(messages.passwordHidden)
        }))
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
                    <span className={OF.FontClassNames.xxLarge}>
                        <FormattedMessage
                            id={FM.APPCREATOR_TITLE}
                            defaultMessage="Create a BLIS App"
                        />
                    </span>
                </div>
                <div>
                    <OF.TextField
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
                    <OF.Label>
                        <FormattedMessage
                            id={FM.APPCREATOR_FIELDS_LUISKEY_AUTHORING_LABEL}
                            defaultMessage="LUIS Key"
                        /> <a href="https://www.luis.ai/user/settings" tabIndex={-1} className={OF.FontClassNames.xSmall} target="_blank">
                            (<FormattedMessage
                                id={FM.APPCREATOR_FIELDS_LUISKEY_AUTHORING_HELPTEXT}
                                defaultMessage="Find your authoring key"
                            />)
                        </a>
                    </OF.Label>
                    <div className="blis-settings-textfieldwithbutton">
                        <OF.TextField
                            onGetErrorMessage={value => this.onGetPasswordErrorMessage(value)}
                            onChanged={this.luisAuthoringKeyChanged}
                            placeholder={intl.formatMessage({
                                id: FM.APPCREATOR_FIELDS_LUISKEY_AUTHORING_PLACEHOLDER,
                                defaultMessage: "Authoring Key..."
                            })}
                            type={this.state.isLuisAuthoringKeyVisible ? "text" : "password"}
                            onKeyDown={this.onKeyDown}
                            value={this.state.luisAuthoringKeyVal}
                        />
                        <OF.PrimaryButton
                            onClick={this.onClickToggleLuisAuthoringKeyVisibility}
                            ariaDescription={this.state.luisAuthoringKeyShowHideText}
                            text={this.state.luisAuthoringKeyShowHideText}
                        />
                    </div>
                    <OF.Label>
                        <FormattedMessage
                            id={FM.APPCREATOR_FIELDS_LUISKEY_CONSUMPTION_LABEL}
                            defaultMessage="LUIS Key"
                        /> <a href="https://portal.azure.com" tabIndex={-1} className={OF.FontClassNames.xSmall} target="_blank">
                            (<FormattedMessage
                                id={FM.APPCREATOR_FIELDS_LUISKEY_CONSUMPTION_HELPTEXT}
                                defaultMessage="Find your consumption key"
                            />)
                        </a>
                    </OF.Label>
                    <div className="blis-settings-textfieldwithbutton">
                        <OF.TextField
                            onChanged={this.luisConsumptionKeyChanged}
                            placeholder={intl.formatMessage({
                                id: FM.APPCREATOR_FIELDS_LUISKEY_CONSUMPTION_PLACEHOLDER,
                                defaultMessage: "Consumption Key..."
                            })}
                            type={this.state.isLuisConsumptionKeyVisible ? "text" : "password"}
                            onKeyDown={this.onKeyDown}
                            value={this.state.luisConsumptionKeyVal}
                        />
                        <OF.PrimaryButton
                            onClick={this.onClickToggleLuisConsumptionKeyVisibility}
                            ariaDescription={this.state.luisConsumptionKeyShowHideText}
                            text={this.state.luisConsumptionKeyShowHideText}
                        />
                    </div>
                    <OF.Dropdown
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
                            <OF.PrimaryButton
                                disabled={!this.state.appNameVal || !this.state.luisAuthoringKeyVal}
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
                            <OF.DefaultButton
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