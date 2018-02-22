import * as React from 'react';
import { returntypeof } from 'react-redux-typescript';
import { editBLISApplicationAsync } from '../../../actions/updateActions';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { State } from '../../../types';
import * as OF from 'office-ui-fabric-react';
import { BlisAppBase, TrainingStatusCode } from 'blis-models'
import './Settings.css'
import { BLIS_SAMPLE_ID } from '../../../types/const'
import { FM } from '../../../react-intl-messages'
import ErrorInjectionEditor from '../../../components/modals/ErrorInjectionEditor'
import { injectIntl, InjectedIntlProps, defineMessages, FormattedMessage } from 'react-intl'

const messages = defineMessages({
    fieldErrorRequired: {
        id: FM.SETTINGS_FIELDERROR_REQUIREDVALUE,
        defaultMessage: "Required Value"
    },
    fieldErrorAlphanumeric: {
        id: FM.SETTINGS_FIELDERROR_ALPHANUMERIC,
        defaultMessage: 'Application name may only contain alphanumeric characters'
    },
    fieldErrorDistinct: {
        id: FM.SETTINGS_FIELDERROR_DISTINCT,
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
    botFrameworkAppIdFieldLabel: {
        id: FM.SETTINGS_BOTFRAMEWORKAPPIDFIELDLABEL,
        defaultMessage: 'Application ID'
    },
    botFrameworkAddBotButtonText: {
        id: FM.SETTINGS_BOTFRAMEWORKADDBOTBUTTONTEXT,
        defaultMessage: 'Add'
    },
    saveChanges: {
        id: FM.SETTINGS_SAVECHANGES,
        defaultMessage: 'Save Changes'
    },
    discard: {
        id: FM.SETTINGS_DISCARD,
        defaultMessages: 'Discard'
    }
})

const styles = {
    shown: {
        visibility: "visible"
    },
    hidden: {
        visibility: "hidden"
    }
}

interface ComponentState {
    localeVal: string
    appIdVal: string
    appNameVal: string
    markdownVal: string
    videoVal: string
    edited: boolean
    botFrameworkAppsVal: any[],
    newBotVal: string,
    isLuisAuthoringKeyVisible: boolean,
    luisAuthoringKeyShowHideText: string,
    luisAuthoringKeyVal: string
    isLuisConsumptionKeyVisible: boolean,
    luisConsumptionKeyShowHideText: string,
    luisConsumptionKeyVal: string,
    debugErrorsOpen: boolean
}

class Settings extends React.Component<Props, ComponentState> {
    constructor(p: Props) {
        super(p)

        this.state = {
            localeVal: '',
            appIdVal: '',
            appNameVal: '',
            markdownVal: '',
            videoVal: '',
            edited: false,
            botFrameworkAppsVal: [],
            newBotVal: "",
            isLuisAuthoringKeyVisible: false,
            luisAuthoringKeyShowHideText: this.props.intl.formatMessage(messages.passwordHidden),
            luisAuthoringKeyVal: '',
            isLuisConsumptionKeyVisible: false,
            luisConsumptionKeyShowHideText: this.props.intl.formatMessage(messages.passwordHidden),
            luisConsumptionKeyVal: '',
            debugErrorsOpen: false,
        }

        this.onChangedVideo = this.onChangedVideo.bind(this)
        this.onChangedMarkdown = this.onChangedMarkdown.bind(this)
        this.onChangedLuisAuthoringKey = this.onChangedLuisAuthoringKey.bind(this)
        this.onChangedLuisConsumptionKey = this.onChangedLuisConsumptionKey.bind(this)
        this.onChangedBotId = this.onChangedBotId.bind(this)
        this.onChangedName = this.onChangedName.bind(this)
        this.onRenderBotListRow = this.onRenderBotListRow.bind(this)
        this.onClickToggleLuisAuthoringKey = this.onClickToggleLuisAuthoringKey.bind(this)
        this.onClickToggleLuisConsumptionKey = this.onClickToggleLuisConsumptionKey.bind(this)
        this.onClickAddBot = this.onClickAddBot.bind(this)
        this.onClickSave = this.onClickSave.bind(this)
        this.onClickDiscard = this.onClickDiscard.bind(this)
    }
    componentWillMount() {
        let app = this.props.app
        this.setState({
            localeVal: app.locale,
            appIdVal: app.appId,
            appNameVal: app.appName,
            luisAuthoringKeyVal: app.luisKey,
            luisConsumptionKeyVal: '', // TODO: When apps schema allows saving consumption key use it here
            markdownVal: app.metadata ? app.metadata.markdown : null,
            videoVal: app.metadata ? app.metadata.video : null,
            botFrameworkAppsVal: app.metadata.botFrameworkApps,
            newBotVal: ''
        })
    }
    componentDidUpdate() {
        let app = this.props.app
        if (this.state.edited == false && (this.state.localeVal !== app.locale ||
            this.state.appIdVal !== app.appId ||
            this.state.appNameVal !== app.appName ||
            this.state.luisAuthoringKeyVal !== app.luisKey ||
            this.state.markdownVal !== app.metadata.markdown ||
            this.state.videoVal !== app.metadata.video ||
            this.state.botFrameworkAppsVal !== app.metadata.botFrameworkApps)) {
            this.setState({
                localeVal: app.locale,
                appIdVal: app.appId,
                appNameVal: app.appName,
                luisAuthoringKeyVal: app.luisKey,
                markdownVal: app.metadata ? app.metadata.markdown : null,
                videoVal: app.metadata ? app.metadata.video : null,
                botFrameworkAppsVal: app.metadata.botFrameworkApps
            })
        }
    }
    onChangedName(text: string) {
        this.setState({
            appNameVal: text,
            edited: true
        })
    }
    onChangedBotId(text: string) {
        this.setState({
            newBotVal: text,
            edited: true
        })
    }
    onChangedLuisAuthoringKey(text: string) {
        this.setState({
            luisAuthoringKeyVal: text,
            edited: true
        })
    }
    onChangedLuisConsumptionKey(text: string) {
        this.setState({
            luisConsumptionKeyVal: text,
            edited: true
        })
    }
    onChangedMarkdown(text: string) {
        this.setState({
            markdownVal: text,
            edited: true
        })
    }
    onChangedVideo(text: string) {
        this.setState({
            videoVal: text,
            edited: true
        })
    }
    onClickAddBot() {
        let newBotApps = this.state.botFrameworkAppsVal.concat(this.state.newBotVal);
        this.setState({
            botFrameworkAppsVal: newBotApps,
            newBotVal: ""
        })
    }
    onRenderBotListRow(item?: any, index?: number) {
        return (
            <div>
                <OF.TextField className={OF.FontClassNames.mediumPlus} disabled={true} value={item} />
            </div>
        )
    }
    onClickDiscard() {
        let app = this.props.app
        this.setState({
            localeVal: app.locale,
            appIdVal: app.appId,
            appNameVal: app.appName,
            luisAuthoringKeyVal: app.luisKey,
            markdownVal: app.metadata ? app.metadata.markdown : null,
            videoVal: app.metadata ? app.metadata.video : null,
            botFrameworkAppsVal: app.metadata.botFrameworkApps,
            edited: false,
            newBotVal: ''
        })
    }
    onClickSave() {
        let app = this.props.app
        let modifiedApp: BlisAppBase = {
            appName: this.state.appNameVal,
            appId: app.appId,
            luisKey: this.state.luisAuthoringKeyVal,
            // TODO: Enable when updated app schema allows consumption keys
            // luisAuthoringKey: this.state.luisAuthoringKeyVal,
            // luisConsumptionKey: this.state.luisConsumptionKeyVal,
            locale: app.locale,
            metadata: {
                botFrameworkApps: this.state.botFrameworkAppsVal,
                markdown: this.state.markdownVal,
                video: this.state.videoVal,
            },
            trainingFailureMessage: undefined,
            trainingStatus: TrainingStatusCode.Completed,
            datetime: new Date()
        }
        this.props.editBLISApplicationAsync(this.props.user.id, modifiedApp);
        this.setState({
            localeVal: app.locale,
            appIdVal: app.appId,
            appNameVal: app.appName,
            luisAuthoringKeyVal: app.luisKey,
            markdownVal: app.metadata ? app.metadata.markdown : null,
            videoVal: app.metadata ? app.metadata.video : null,
            botFrameworkAppsVal: app.metadata.botFrameworkApps,
            edited: false,
            newBotVal: ''
        })
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
        let foundApp = this.props.apps.find(a => (a.appName == value && a.appId != this.props.app.appId));
        if (foundApp) {
            return intl.formatMessage(messages.fieldErrorDistinct)
        }

        return ""
    }

    onClickToggleLuisAuthoringKey() {
        this.setState((prevState: ComponentState) => ({
            isLuisAuthoringKeyVisible: !prevState.isLuisAuthoringKeyVisible,
            luisAuthoringKeyShowHideText: !prevState.isLuisAuthoringKeyVisible
                ? this.props.intl.formatMessage(messages.passwordVisible)
                : this.props.intl.formatMessage(messages.passwordHidden)
        }))
    }

    onClickToggleLuisConsumptionKey() {
        this.setState((prevState: ComponentState) => ({
            isLuisConsumptionKeyVisible: !prevState.isLuisConsumptionKeyVisible,
            luisConsumptionKeyShowHideText: !prevState.isLuisConsumptionKeyVisible
                ? this.props.intl.formatMessage(messages.passwordVisible)
                : this.props.intl.formatMessage(messages.passwordHidden)
        }))
    }

    onCloseDebugErrors() {
        this.setState({
            debugErrorsOpen: false
        })
    }

    onOpenDebugErrors() {
        this.setState({
            debugErrorsOpen: true
        })
    }

    render() {
        const { intl } = this.props
        let options = [{
            key: this.state.localeVal,
            text: this.state.localeVal,
        }]
        let buttonsDivStyle = this.state.edited === true ? styles.shown : styles.hidden;
        return (
            <div className="blis-page">
                <span className={OF.FontClassNames.xxLarge}>
                    <FormattedMessage
                        id={FM.SETTINGS_TITLE}
                        defaultMessage="Settings"
                    />
                </span>
                <span className={OF.FontClassNames.mediumPlus}>
                    <FormattedMessage
                        id={FM.SETTINGS_SUBTITLE}
                        defaultMessage="Control your application versions, who has access to it and whether it is public or private..."
                    />
                </span>
                <div className="blis-settings-fields">
                    <OF.TextField
                        className={OF.FontClassNames.mediumPlus}
                        onChanged={(text) => this.onChangedName(text)}
                        label={intl.formatMessage({
                            id: FM.SETTINGS_FIELDS_NAMELABEL,
                            defaultMessage: "Name"
                        })}
                        onGetErrorMessage={value => this.onGetNameErrorMessage(value)}
                        value={this.state.appNameVal}
                    />
                    <OF.TextField
                        className={OF.FontClassNames.mediumPlus}
                        disabled={true}
                        label={intl.formatMessage({
                            id: FM.SETTINGS_FILEDS_APPIDLABEL,
                            defaultMessage: "App ID"
                        })}
                        value={this.state.appIdVal}
                    />
                    <div>
                        <OF.Label className={OF.FontClassNames.mediumPlus}>
                            <FormattedMessage
                                id={FM.SETTINGS_BOTFRAMEWORKLUISKEY_AUTHORING_LABEL}
                                defaultMessage="LUIS Authoring Key"
                            />
                        </OF.Label>
                        <div className="blis-settings-textfieldwithbutton">
                            <OF.TextField
                                className={OF.FontClassNames.mediumPlus}
                                onChanged={(text) => this.onChangedLuisAuthoringKey(text)}
                                type={this.state.isLuisAuthoringKeyVisible ? "text" : "password"}
                                value={this.state.luisAuthoringKeyVal}
                                placeholder={intl.formatMessage({
                                    id: FM.SETTINGS_BOTFRAMEWORKLUISKEY_AUTHORING_PLACEHOLDER,
                                    defaultMessage: "Authoring Key..."
                                })}
                            />
                            <OF.PrimaryButton
                                onClick={this.onClickToggleLuisAuthoringKey}
                                ariaDescription={this.state.luisAuthoringKeyShowHideText}
                                text={this.state.luisAuthoringKeyShowHideText}
                            />
                        </div>
                    </div>
                    <div>
                        <OF.Label className={OF.FontClassNames.mediumPlus}>
                            <FormattedMessage
                                id={FM.SETTINGS_BOTFRAMEWORKLUISKEY_CONSUMPTION_LABEL}
                                defaultMessage="LUIS Consumption Key"
                            />
                        </OF.Label>
                        <div className="blis-settings-textfieldwithbutton">
                            <OF.TextField
                                className={OF.FontClassNames.mediumPlus}
                                onChanged={(text) => this.onChangedLuisConsumptionKey(text)}
                                type={this.state.isLuisConsumptionKeyVisible ? "text" : "password"}
                                value={this.state.luisConsumptionKeyVal}
                                placeholder={intl.formatMessage({
                                    id: FM.SETTINGS_BOTFRAMEWORKLUISKEY_CONSUMPTION_PLACEHOLDER,
                                    defaultMessage: "Consumption Key..."
                                })}
                            />
                            <OF.PrimaryButton
                                onClick={this.onClickToggleLuisConsumptionKey}
                                ariaDescription={this.state.luisConsumptionKeyShowHideText}
                                text={this.state.luisConsumptionKeyShowHideText}
                            />
                        </div>
                    </div>
                    <div>
                        <OF.Label className={OF.FontClassNames.mediumPlus}>
                            <FormattedMessage
                                id={FM.SETTINGS_BOTFRAMEWORKLOCALELABEL}
                                defaultMessage="Locale"
                            />
                        </OF.Label>
                        <OF.Dropdown
                            className={OF.FontClassNames.mediumPlus}
                            options={options}
                            selectedKey={this.state.localeVal}
                            disabled={true}
                        />
                    </div>
                    <div>
                        <OF.Label className={OF.FontClassNames.mediumPlus}>
                            <FormattedMessage
                                id={FM.SETTINGS_BOTFRAMEWORKLISTLABEL}
                                defaultMessage="Bot Framework Apps"
                            />
                        </OF.Label>
                        <OF.List
                            items={this.state.botFrameworkAppsVal}
                            onRenderCell={this.onRenderBotListRow}
                        />
                        <div className="blis-settings-textfieldwithbutton">
                            <OF.TextField
                                className={OF.FontClassNames.mediumPlus}
                                onChanged={(text) => this.onChangedBotId(text)}
                                placeholder={intl.formatMessage(messages.botFrameworkAppIdFieldLabel)}
                                value={this.state.newBotVal}
                            />
                            <OF.PrimaryButton
                                onClick={this.onClickAddBot}
                                ariaDescription={intl.formatMessage(messages.botFrameworkAddBotButtonText)}
                                text={intl.formatMessage(messages.botFrameworkAddBotButtonText)}
                            />
                        </div>
                    </div>
                    {this.props.user.id === BLIS_SAMPLE_ID &&
                        <div>
                            <OF.TextField
                                className={OF.FontClassNames.mediumPlus}
                                onChanged={(text) => this.onChangedMarkdown(text)}
                                label={intl.formatMessage({
                                    id: FM.SETTINGS_FIELDS_MARKDOWNLABEL,
                                    defaultMessage: 'Markdown'
                                })}
                                value={this.state.markdownVal}
                                multiline={true}
                                rows={5}
                            />
                            <OF.TextField
                                className={OF.FontClassNames.mediumPlus}
                                onChanged={(text) => this.onChangedVideo(text)}
                                label={intl.formatMessage({
                                    id: FM.SETTINGS_FIELDS_VIDEOLABEL,
                                    defaultMessage: 'Video'
                                })}
                                value={this.state.videoVal}
                            />
                        </div>
                    }
                    <div className="blis-modal-buttons_primary" style={buttonsDivStyle}>
                        <OF.PrimaryButton
                            disabled={this.onGetNameErrorMessage(this.state.appNameVal) !== ""}
                            onClick={this.onClickSave}
                            ariaDescription={intl.formatMessage(messages.saveChanges)}
                            text={intl.formatMessage(messages.saveChanges)}
                        />
                        <OF.DefaultButton
                            onClick={this.onClickDiscard}
                            ariaDescription={intl.formatMessage(messages.discard)}
                            text={intl.formatMessage(messages.discard)}
                        />
                    </div>
                    <div className="blis-modal-buttons_secondary">
                        {this.props.user.id === BLIS_SAMPLE_ID &&
                            <OF.DefaultButton
                                onClick={() => this.onOpenDebugErrors()}
                                ariaDescription={intl.formatMessage(messages.discard)}
                                text={'Inject Errors'}
                            />
                        }
                    </div>
                    <ErrorInjectionEditor
                        open={this.state.debugErrorsOpen}
                        onClose={() => this.onCloseDebugErrors()}
                    />
                </div>
            </div>
        );
    }
}
const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
        editBLISApplicationAsync
    }, dispatch);
}
const mapStateToProps = (state: State) => {
    return {
        user: state.user,
        apps: state.apps.all
    }
}

export interface ReceivedProps {
    app: BlisAppBase
}

// Props types inferred from mapStateToProps & dispatchToProps
const stateProps = returntypeof(mapStateToProps);
const dispatchProps = returntypeof(mapDispatchToProps);
type Props = typeof stateProps & typeof dispatchProps & ReceivedProps & InjectedIntlProps;

export default connect<typeof stateProps, typeof dispatchProps, ReceivedProps>(mapStateToProps, mapDispatchToProps)(injectIntl(Settings))