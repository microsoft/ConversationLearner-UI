/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as React from 'react'
import {
    Route,
    Switch
} from 'react-router-dom'
import { RouteComponentProps } from 'react-router'
import { returntypeof } from 'react-redux-typescript'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { State } from '../../types'
import { AppBase, AppDefinition, TrainDialog } from '@conversationlearner/models'
import actions from '../../actions'
import AppIndex from './App/Index'
import AppsList from './AppsList'
import { CL_IMPORT_TUTORIALS_USER_ID } from '../../types/const'
import * as uuid from 'uuid/v4'
import * as Util from '../../Utils/util'
import { SourceModel } from '../../types/models';

class AppsIndex extends React.Component<Props> {
    updateAppsAndBot() {
        if (this.props.user.id !== null && this.props.user.id.length > 0) {
            this.props.fetchApplicationsThunkAsync(this.props.user.id)
        }
    }
    componentDidMount() {
        this.updateAppsAndBot();
    }

    componentDidUpdate(prevProps: Props, _prevState: {}) {
        // TODO: See if this code can be removed. It seems like componentWillMount is called every time the user navigates to /home route
        if (typeof (this.props.user.id) === 'string' && this.props.user.id !== prevProps.user.id) {
            this.updateAppsAndBot();
        }

        const { history, location } = this.props
        const appFromLocationState: AppBase | null = location.state && location.state.app
        if (appFromLocationState && this.props.apps && this.props.apps.length > 0) {
            const app = this.props.apps.find(a => a.appId === appFromLocationState.appId)
            if (!app) {
                console.warn(`Attempted to find selected model in list of models: ${appFromLocationState.appId} but it could not be found. This should not be possible. Contact Support.`)
                return
            }

            if (appFromLocationState !== app) {
                history.replace(location.pathname, { app })
            }
        }
    }

    onClickDeleteApp = (appToDelete: AppBase) => {
        this.props.deleteApplicationThunkAsync(appToDelete.appId)
    }

    onCreateApp = async (appToCreate: AppBase, source: AppDefinition | null = null) => {
        const app: AppBase = await (this.props.createApplicationThunkAsync(this.props.user.id, appToCreate, source) as any as Promise<AppBase>)
        const { match, history } = this.props
        history.push(`${match.url}/${app.appId}`, { app })
    }

    onCreateDispatchModel = async (appToCreate: AppBase, childrenModels: AppBase[]) => {
        if (childrenModels.length > 5) {
            throw new Error(`Must only select 5 or less models when creating a Dispatcher Model`)
        }

        /**
         * Need to add data indicating model is dispatcher for behavior change in SDK
         * Currently overload markdown, but could be separate dedicated fields in future but we need to finalize what data we need
         * Based on splitting by newline and comma should be able to reconstruct data, could go to CSV parser
         * 
         * Example:
         * dispatcher
         * 6ed9b965-611f-4949-af64-d84b4c43c610,Model Name 1
         * 57f34a81-a88b-4804-8a29-f2c0429f9250,Model Other Name 2
         * ...
         * d88b3850-ac9d-4805-a3c9-80216bf9cbfb,Model Last Name N
         */
        appToCreate.metadata.markdown = `dispatcher\n${childrenModels.map(m => `${m.appId},${m.appName}`).join('\n')}`

        /**
         * Fetch source and associate with each model
         */
        const childrenSources = await Promise.all(childrenModels.map(async model => {
            const source = await (this.props.fetchAppSourceThunkAsync(model.appId, model.devPackageId) as any) as AppDefinition
            return {
                source,
                model,
            }
        }))

        const source = generateDispatcherSource(childrenSources)
        const app = await (this.props.createApplicationThunkAsync(this.props.user.id, appToCreate, source) as any as Promise<AppBase>)
        const { match, history } = this.props
        history.push(`${match.url}/${app.appId}`, { app })
    }

    onImportTutorial = (tutorial: AppBase) => {
        const srcUserId = CL_IMPORT_TUTORIALS_USER_ID;
        const destUserId = this.props.user.id;

        // TODO: Find cleaner solution for the types.  Thunks return functions but when using them on props they should be returning result of the promise.
        this.props.copyApplicationThunkAsync(srcUserId, destUserId, tutorial.appId)
    }

    render() {
        const { match } = this.props
        return (
            <Switch>
                <Route path={`${match.url}/:appId`} component={AppIndex} />
                <Route
                    exact={true}
                    path={match.url}
                    render={() =>
                        <AppsList
                            apps={this.props.apps}
                            onCreateApp={this.onCreateApp}
                            onCreateDispatchModel={this.onCreateDispatchModel}
                            onClickDeleteApp={this.onClickDeleteApp}
                            onImportTutorial={(tutorial) => this.onImportTutorial(tutorial)}
                        />
                    }
                />
            </Switch>
        )
    }
}

function generateDispatcherSource(sourceModels: SourceModel[]): AppDefinition {
    /**
     * Generate new Text Actions 1 per model, with text as format modelId:modelName
     */
    const actions = sourceModels.map<any>(sourceModel => ({
        "actionId": uuid(),
        "createdDateTime": new Date().toJSON(),
        "actionType": "DISPATCH",
        "payload": `{\"modelId\": \"${sourceModel.model.appId}\", \"modelName\": \"${sourceModel.model.appName}\"}`,
        "isTerminal": true,
        "requiredEntitiesFromPayload": [],
        "requiredEntities": [],
        "negativeEntities": [],
        "requiredConditions": [],
        "negativeConditions": [],
        "clientData": {
            "importHashes": []
        }
    }))

    /**
     * Current train dialogs are still associated with their model
     * Overwrite label action and filled entities to that model's enum action
     */
    const modelTrainDialogs = sourceModels.map((sm, mIndex) => {
        return sm.source.trainDialogs.map((t, tIndex) => {
            t.rounds.forEach(r => {
                r.scorerSteps.forEach(s => {
                    s.input = {
                        filledEntities: [],
                        context: {},
                        maskedActions: [],
                    }
                    // Bad to rely on index association here, but it's consistent between action types
                    s.labelAction = actions[mIndex].actionId
                })
            })

            t.tags = [`model-${mIndex + 1}`, `dialog-${tIndex + 1}`]

            return t
        })
    })

    /**
     * Intermix rounds from different dialogs to implicitly demonstrate dispatching/context switching to other model
     * 
     * Example
     * Dialogs:
     *  ModelA: 
     *   [A,B,C]
     *  ModelB:
     *   [D,E,F]
     *  ModelC:
     *   [G,H,I]
     * ..,
     * 
     * Output:
     * [A,D,E,F]
     * [A,B,D,E,F]
     * [A,B,C,D,E,F]
     * [A,G,H,I]
     * [A,B,G,H,I]
     * [A,B,C,G,H,I]
     * [D,A,B,C]
     * [D,E,A,B,C]
     * [D,E,F,A,B,C]
     * [D,G,H,I]
     * [D,E,G,H,I]
     * [D,E,F,G,H,I]
     * ...
     */

    // Flatten dialogs from models
    const allTrainDialogs = modelTrainDialogs
        .reduce((a, b) => [...a, ...b])

    // Ensure the filled entities of first scorer step are empty
    const unmodifiedTrainDialogs = removeFilledEntitiesOfScorerStep(allTrainDialogs)

    const mixRounds = allTrainDialogs.map(t => t.rounds)
        .map((x, i, ys) => {
            const others = ys.filter((_, j) => j !== i)
            return others
                .map((other) => {
                    // for each item in array
                    return x.map((_, k) => {
                        // slice array until item
                        const first = x.slice(0, k + 1)
                        const second = other
                        return [...first, ...second]
                    })
                })
                .reduce((a, b) => [...a, ...b])
        })
        .reduce((a, b) => [...a, ...b])

    const mixedDialogs = mixRounds.map(rs => ({
        tags: [],
        description: "",
        trainDialogId: uuid(),
        rounds: rs,
        clientData: {
            importHashes: []
        },
        initialFilledEntities: [],
    }))

    const mixedDialogsCorrected = removeFilledEntitiesOfScorerStep(mixedDialogs as unknown as TrainDialog[])

    const source = {
        trainDialogs: [
            ...unmodifiedTrainDialogs,
            ...mixedDialogsCorrected
        ],
        actions,
        entities: [],
        packageId: uuid()
    }

    return source as AppDefinition
}

function removeFilledEntitiesOfScorerStep(trainDialogs: TrainDialog[]): TrainDialog[] {
    return Util.deepCopy(trainDialogs).map(t => {
        t.rounds.forEach((r, rIndex) => {
            if (rIndex === 0) {
                r.scorerSteps[0].input.filledEntities = []
            }
        })

        return t
    })
}

const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
        fetchApplicationsThunkAsync: actions.app.fetchApplicationsThunkAsync,
        fetchAppSourceThunkAsync: actions.app.fetchAppSourceThunkAsync,
        fetchBotInfoThunkAsync: actions.bot.fetchBotInfoThunkAsync,
        createApplicationThunkAsync: actions.app.createApplicationThunkAsync,
        deleteApplicationThunkAsync: actions.app.deleteApplicationThunkAsync,
        copyApplicationThunkAsync: actions.app.copyApplicationThunkAsync,
    }, dispatch)
}

const mapStateToProps = (state: State) => {
    if (!state.user.user) {
        throw new Error(`You attempted to render AppsIndex but the user was not defined. This is likely a problem with higher level component. Please open an issue.`)
    }

    return {
        apps: state.apps.all,
        display: state.display,
        user: state.user.user,
        browserId: state.bot.browserId
    }
}

// Props types inferred from mapStateToProps & dispatchToProps
const stateProps = returntypeof(mapStateToProps)
const dispatchProps = returntypeof(mapDispatchToProps)
type Props = typeof stateProps & typeof dispatchProps & RouteComponentProps<any>

export default connect<typeof stateProps, typeof dispatchProps, RouteComponentProps<any>>(mapStateToProps, mapDispatchToProps)(AppsIndex)