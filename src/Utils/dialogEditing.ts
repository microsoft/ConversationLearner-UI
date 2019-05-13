
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import * as CLM from '@conversationlearner/models'
import * as Util from './util'
import * as DialogUtils from './dialogUtils'
import { Activity } from 'botframework-directlinejs'
import { SelectionType, User } from '../types'
import { EditDialogType } from '../components/modals';

export async function onInsertAction(
    trainDialog: CLM.TrainDialog,
    selectedActivity: Activity,
    isLastActivity: boolean,

    entities: CLM.EntityBase[],
    actions: CLM.ActionBase[],
    appId: string,
    scoreFromHistory: (appId: string, history: CLM.TrainDialog) => Promise<CLM.UIScoreResponse>,
    clearWebChatScrollPosition: () => void,
) {
    const clData: CLM.CLChannelData = selectedActivity.channelData.clData
    const roundIndex = clData.roundIndex || 0
    const scoreIndex = clData.scoreIndex
    const definitions = {
        entities,
        actions,
        trainDialogs: []
    }

    // Created shorted version of TrainDialog at insert point
    // Copy, Remove rounds / scorer steps below insert
    const history = Util.deepCopy(trainDialog)
    history.definitions = definitions
    history.rounds = history.rounds.slice(0, roundIndex + 1)

    // Remove action-less dummy step (used for rendering) if it exits
    if (history.rounds[roundIndex].scorerSteps.length > 0 && history.rounds[roundIndex].scorerSteps[0].labelAction === undefined) {
        history.rounds[roundIndex].scorerSteps = []
    }
    else if (scoreIndex === null) {
        history.rounds[roundIndex].scorerSteps = []
    }
    // Or remove following scorer steps 
    else {
        history.rounds[roundIndex].scorerSteps = history.rounds[roundIndex].scorerSteps.slice(0, scoreIndex + 1);
    }

    // Get a score for this step
    const uiScoreResponse = await scoreFromHistory(appId, history)
    if (!uiScoreResponse.scoreResponse) {
        throw new Error("Empty Score Response")
    }

    // End session call only allowed on last turn if one doesn't exist already
    const canEndSession = isLastActivity && !DialogUtils.hasEndSession(trainDialog, actions)

    // Find top scoring Action
    let insertedAction = DialogUtils.getBestAction(uiScoreResponse.scoreResponse, actions, canEndSession)

    // None were qualified so pick the first (will show in UI as invalid)
    if (!insertedAction && uiScoreResponse.scoreResponse.unscoredActions[0]) {
        const scoredAction = { ...uiScoreResponse.scoreResponse.unscoredActions[0], score: 1 }
        delete scoredAction.reason
        insertedAction = scoredAction
    }
    if (!insertedAction) {
        throw new Error("No actions available")
    }

    const scorerStep: CLM.TrainScorerStep = {
        logicResult: undefined,
        input: uiScoreResponse.scoreInput!,
        labelAction: insertedAction.actionId,
        scoredAction: insertedAction
    }

    // Insert new Action into Full TrainDialog
    const newTrainDialog = Util.deepCopy(trainDialog)
    newTrainDialog.definitions = definitions
    const curRound = newTrainDialog.rounds[roundIndex]

    // Replace action-less dummy step (used for rendering) if it exits
    if (curRound.scorerSteps.length === 0 || curRound.scorerSteps[0].labelAction === undefined) {
        curRound.scorerSteps = [scorerStep]
    }
    // Or insert 
    else if (scoreIndex === null) {
        curRound.scorerSteps = [scorerStep, ...curRound.scorerSteps]
    }
    else {
        curRound.scorerSteps.splice(scoreIndex + 1, 0, scorerStep)
    }

    // If inserted at end of conversation, allow to scroll to bottom
    if (roundIndex === trainDialog.rounds.length - 1 &&
        (scoreIndex === null || scoreIndex === curRound.scorerSteps.length - 1)) {
        clearWebChatScrollPosition()
    }

    return newTrainDialog
}

export async function onInsertInput(
    trainDialog: CLM.TrainDialog,
    selectedActivity: Activity,
    inputText: string,

    appId: string,
    entities: CLM.EntityBase[],
    actions: CLM.ActionBase[],
    extractFromHistory: (appId: string, trainDialog: CLM.TrainDialog, userInput: CLM.UserInput) => Promise<CLM.ExtractResponse>,
    trainDialogReplay: (appId: string, trainDialog: CLM.TrainDialog) => Promise<CLM.TrainDialog>,
    clearWebChatScrollPosition: () => void,
) {

    if (!inputText) {
        throw new Error("inputText is null")
    }

    const clData: CLM.CLChannelData = selectedActivity.channelData.clData
    const roundIndex = clData.roundIndex!
    const scoreIndex = clData.scoreIndex || 0
    const senderType = clData.senderType

    const definitions = {
        entities,
        actions,
        trainDialogs: []
    }

    // Copy, Remove rounds / scorer steps below insert
    const partialTrainDialog = Util.deepCopy(trainDialog)
    partialTrainDialog.definitions = definitions
    partialTrainDialog.rounds = partialTrainDialog.rounds.slice(0, roundIndex + 1)
    const lastRound = partialTrainDialog.rounds[partialTrainDialog.rounds.length - 1]
    lastRound.scorerSteps = lastRound.scorerSteps.slice(0, scoreIndex)

    const userInput: CLM.UserInput = { text: inputText }

    // Get extraction
    const extractResponse = await extractFromHistory(appId, partialTrainDialog, userInput)

    if (!extractResponse) {
        throw new Error("No extract response")
    }

    const textVariations = CLM.ModelUtils.ToTextVariations([extractResponse])
    const extractorStep: CLM.TrainExtractorStep = { textVariations }

    // Copy original and insert new round for the text
    let newTrainDialog = Util.deepCopy(trainDialog)
    newTrainDialog.definitions = definitions

    let scorerSteps: CLM.TrainScorerStep[]

    if (senderType === CLM.SenderType.User) {
        // Copy scorer steps below the injected input for new Round
        scorerSteps = trainDialog.rounds[roundIndex].scorerSteps

        // Remove scorer steps above injected input from round 
        newTrainDialog.rounds[roundIndex].scorerSteps = []
    }
    else {
        // Copy scorer steps below the injected input for new Round
        scorerSteps = trainDialog.rounds[roundIndex].scorerSteps.slice(scoreIndex + 1)

        // Remove scorer steps above injected input from round 
        newTrainDialog.rounds[roundIndex].scorerSteps.splice(scoreIndex + 1, Infinity)
    }

    // Create new round
    const newRound = {
        extractorStep,
        scorerSteps
    }

    // Inject new Round
    newTrainDialog.rounds.splice(roundIndex + 1, 0, newRound)

    // Replay logic functions on train dialog
    const replayedDialog = await trainDialogReplay(appId, newTrainDialog)

    // If inserted at end of conversation, allow to scroll to bottom
    if (roundIndex === trainDialog.rounds.length - 1) {
        clearWebChatScrollPosition()
    }

    return replayedDialog
}

export async function onChangeAction(
    trainDialog: CLM.TrainDialog,
    selectedActivity: Activity,
    trainScorerStep: CLM.TrainScorerStep,
    editType: EditDialogType,
    appId: string,
    entities: CLM.EntityBase[],
    actions: CLM.ActionBase[],
    trainDialogReplay: (appId: string, trainDialog: CLM.TrainDialog) => Promise<CLM.TrainDialog>,
    editActionThunkAsync: (appId: string, action: CLM.ActionBase) => Promise<void>
) {
    const clData: CLM.CLChannelData = selectedActivity.channelData.clData
    const roundIndex = clData.roundIndex!
    const scoreIndex = clData.scoreIndex!
    const definitions = {
        entities,
        actions,
        trainDialogs: []
    }

    const newTrainDialog = Util.deepCopy(trainDialog)

    const oldTrainScorerStep = newTrainDialog.rounds[roundIndex].scorerSteps[scoreIndex]
    newTrainDialog.rounds[roundIndex].scorerSteps[scoreIndex] = trainScorerStep
    newTrainDialog.definitions = definitions;

    // Replay logic functions on train dialog
    const replayedDialog = await trainDialogReplay(appId, newTrainDialog)

    // If importing 
    if (editType === EditDialogType.IMPORT) {

        // If replacing step with import text
        if (oldTrainScorerStep.importText) {
            // Attach hash of import text to selected action for future lookups
            const action = actions.find(a => a.actionId === trainScorerStep.labelAction)
            if (action) {
                // Substitue entityIds back into import text to build import hash lookup
                const filledEntityIdMap = DialogUtils.filledEntityIdMap(trainScorerStep.input.filledEntities, entities)
                const importText = DialogUtils.importTextWithEntities(oldTrainScorerStep.importText, filledEntityIdMap)
                const importHash = Util.hashText(importText)

                // Add new hash to action and save it
                const newAction = Util.deepCopy(action)
                if (!newAction.clientData || !newAction.clientData.importHashes) {
                    newAction.clientData = { importHashes: []}
                }
                newAction.clientData!.importHashes!.push(importHash)
                await editActionThunkAsync(appId, newAction)

                // Test if new lookup can be used on any other imported actions
                DialogUtils.replaceImportActions(replayedDialog, [...actions, newAction], entities)
            }
        }
        else {
            // Attempt to replace import actions with real actions
            DialogUtils.replaceImportActions(replayedDialog, actions, entities)
        }
    }

    return replayedDialog
}

export async function onChangeExtraction(
    trainDialog: CLM.TrainDialog,
    selectedActivity: Activity,
    textVariations: CLM.TextVariation[],
    editType: EditDialogType,
    appId: string,
    entities: CLM.EntityBase[],
    actions: CLM.ActionBase[],
    trainDialogReplay: (appId: string, trainDialog: CLM.TrainDialog) => Promise<CLM.TrainDialog>,
) {
    const clData: CLM.CLChannelData = selectedActivity.channelData.clData
    const roundIndex = clData.roundIndex!
    const definitions = {
        entities,
        actions,
        trainDialogs: []
    }

    const newTrainDialog = Util.deepCopy(trainDialog)
    newTrainDialog.definitions = definitions;
    newTrainDialog.rounds[roundIndex].extractorStep.textVariations = textVariations;

    // Replay logic functions on train dialog
    const replayedDialog = await trainDialogReplay(appId, newTrainDialog)

    // If importing attempt to replace any stub actions
    if (editType === EditDialogType.IMPORT) {
        DialogUtils.replaceImportActions(replayedDialog, actions, entities)
    }

    return replayedDialog
}

export async function onDeleteTurn(
    trainDialog: CLM.TrainDialog,
    selectedActivity: Activity,

    appId: string,
    entities: CLM.EntityBase[],
    actions: CLM.ActionBase[],
    trainDialogReplay: (appId: string, trainDialog: CLM.TrainDialog) => Promise<CLM.TrainDialog>,
) {
    const clData: CLM.CLChannelData = selectedActivity.channelData.clData
    const senderType = clData.senderType
    const roundIndex = clData.roundIndex!
    const scoreIndex = clData.scoreIndex

    const newTrainDialog: CLM.TrainDialog = Util.deepCopy(trainDialog)
    newTrainDialog.definitions = {
        entities,
        actions,
        trainDialogs: []
    }

    const curRound = newTrainDialog.rounds[roundIndex]

    if (senderType === CLM.SenderType.User) {
        // If user input deleted, append scores to previous round
        if (roundIndex > 0) {
            const previousRound = newTrainDialog.rounds[roundIndex - 1]
            previousRound.scorerSteps = [...previousRound.scorerSteps, ...curRound.scorerSteps]

            // Remove action-less dummy step if it exits
            previousRound.scorerSteps = previousRound.scorerSteps.filter(ss => ss.labelAction !== undefined)
        }

        // Delete round 
        newTrainDialog.rounds.splice(roundIndex, 1)
    }
    else { //CLM.SenderType.Bot 
        if (scoreIndex === null) {
            throw new Error("Unexpected null scoreIndex")
        }
        // If Action deleted remove it
        curRound.scorerSteps.splice(scoreIndex, 1)
    }

    // Replay logic functions on train dialog
    const replayedDialog = await trainDialogReplay(appId, newTrainDialog)

    return replayedDialog
}

export async function onReplayTrainDialog(
    trainDialog: CLM.TrainDialog,
    appId: string,
    entities: CLM.EntityBase[],
    actions: CLM.ActionBase[],
    trainDialogReplay: (appId: string, trainDialog: CLM.TrainDialog) => Promise<CLM.TrainDialog>
): Promise<CLM.TrainDialog> {
    const newTrainDialog = Util.deepCopy(trainDialog)
    newTrainDialog.definitions = {
        entities,
        actions,
        trainDialogs: []
    }

    // I've replayed so warning status goes away (but not invalid)
    if (trainDialog.validity === CLM.Validity.WARNING
        || trainDialog.validity === CLM.Validity.UNKNOWN) {
        newTrainDialog.validity = CLM.Validity.VALID
    }

    // Replay logic functions on train dialog
    const replayedDialog = await trainDialogReplay(appId, newTrainDialog)

    return replayedDialog
}

export async function onUpdateHistory(
    newTrainDialog: CLM.TrainDialog,
    selectedActivity: Activity | null,
    selectionType: SelectionType,

    appId: string,
    user: User,
    fetchHistoryAsync: (appId: string, trainDialog: CLM.TrainDialog, userName: string, userId: string) => Promise<CLM.TeachWithHistory>
) {
    const teachWithHistory = await fetchHistoryAsync(appId, newTrainDialog, user.name, user.id)

    let activityIndex: number | null = null

    // If activity was selected, calculate activity to select after update
    if (selectedActivity !== null) {
        // LogDialogs used state:
        // activityIndex = selectedActivity ? DialogUtils.matchedActivityIndex(selectedActivity, this.state.history) : null
        activityIndex = selectedActivity ? DialogUtils.matchedActivityIndex(selectedActivity, teachWithHistory.history) : null
        if (activityIndex !== null && selectionType === SelectionType.NEXT) {
            // Select next activity, useful for when inserting a step
            activityIndex = activityIndex + 1
        }
        // If was a delete action, activity won't exist any more, so select by index
        else if (activityIndex === null && selectionType === SelectionType.CURRENT) {

            const clData: CLM.CLChannelData = selectedActivity.channelData.clData
            if (clData && clData.activityIndex) {
                activityIndex = clData.activityIndex
            }
        }
        else if (selectionType === SelectionType.NONE) {
            activityIndex = null
        }
    }

    return {
        teachWithHistory,
        activityIndex
    }
}

export interface EditHandlerArgs {
    userInput?: string,
    extractResponse?: CLM.ExtractResponse,
    textVariations?: CLM.TextVariation[],
    trainScorerStep?: CLM.TrainScorerStep
    selectionType?: SelectionType
    isLastActivity?: boolean
}

export async function onEditTeach(
    historyIndex: number | null,
    args: EditHandlerArgs | undefined,
    tags: string[],
    description: string,
    editHandler: (trainDialog: CLM.TrainDialog, activity: Activity, args?: EditHandlerArgs) => any,
    teachSession: CLM.Teach,
    app: CLM.AppBase,
    user: User,
    actions: CLM.ActionBase[],
    entities: CLM.EntityBase[],
    fetchTrainDialogAsync: (appId: string, trainDialogId: string, replaceLocal: boolean) => Promise<CLM.TrainDialog>,
    deleteTeachSessionAsync: (
        teachSession: CLM.Teach,
        app: CLM.AppBase,
        save?: boolean,
        sourceLogDialogId?: string | null,
        sourceTrainDialogId?: string | null,
    ) => Promise<CLM.TrainDialog>,
    fetchHistoryAsync: (appId: string, trainDialog: CLM.TrainDialog, userName: string, userId: string) => Promise<CLM.TeachWithHistory>
) {
    // Get train dialog associated with the teach session
    const trainDialog = await fetchTrainDialogAsync(app.appId, teachSession.trainDialogId, false)
    trainDialog.tags = tags
    trainDialog.description = description
    trainDialog.definitions = {
        entities: entities,
        actions: actions,
        trainDialogs: []
    }

    // Delete the teach session w/o saving
    await deleteTeachSessionAsync(teachSession, app)

    // Generate history
    const teachWithHistory = await fetchHistoryAsync(app.appId, trainDialog, user.name, user.id)
    // If no index given, select last activity
    const selectedActivity = historyIndex ? teachWithHistory.history[historyIndex] : teachWithHistory.history[teachWithHistory.history.length - 1]
    const clData: CLM.CLChannelData = { ...selectedActivity.channelData.clData, activityIndex: historyIndex }
    selectedActivity.channelData.clData = clData

    await editHandler(trainDialog, selectedActivity, args)
} 

// Returns stubAPIAction if it exists, otherwise creates it
export async function getStubAPIAction(
    appId: string,
    actions: CLM.ActionBase[],
    createActionThunkAsync: (appId: string, action: CLM.ActionBase) => Promise<CLM.ActionBase | null>

): Promise<CLM.ActionBase> {
    let stubAction = actions.find(a => CLM.ActionBase.isStubbedAPI(a))
    if (stubAction) {
        return stubAction
    }
    stubAction = CLM.ActionBase.getStubAction()
    const newAction = await createActionThunkAsync(appId, stubAction)
    if (!newAction) {
        throw new Error("Failed to create APIStub action")
    }

    return newAction
}

export function getFilledEntityMapForActivity(trainDialog: CLM.TrainDialog, selectedActivity: Activity, entities: CLM.EntityBase[]): CLM.FilledEntityMap | null {

    if (!selectedActivity) {
        return null
    }

    const clData: CLM.CLChannelData = selectedActivity.channelData.clData
    // If rounds were trimmed, selectedActivity could have been in deleted rounds

    if (clData.roundIndex !== null) {
        const round = trainDialog.rounds[clData.roundIndex]
        if (round.scorerSteps.length > 0) {
            // If a score round 
            if (typeof clData.scoreIndex === "number") {
                const scorerStep = round.scorerSteps[clData.scoreIndex];
                if (!scorerStep) {
                    throw new Error(`Cannot get score step at index: ${clData.scoreIndex} from array of length: ${round.scorerSteps.length}`)
                }
                return CLM.FilledEntityMap.FromFilledEntities(scorerStep.input.filledEntities, entities)
            }
            // If user round, get filled entities from first scorer step
            else {
                const scorerStep = round.scorerSteps[0];
                return CLM.FilledEntityMap.FromFilledEntities(scorerStep.input.filledEntities, entities)
            }
        }
    }
    return null
}

// Returns stubAPIAction if it exists, otherwise creates it
export async function getStubScorerStep(
    appId: string,
    actions: CLM.ActionBase[],
    filledEntityMap: CLM.FilledEntityMap,
    createActionThunkAsync: (appId: string, action: CLM.ActionBase) => Promise<CLM.ActionBase | null>
): Promise<CLM.TrainScorerStep> {
    
    const stubAPIAction = await getStubAPIAction(appId, actions, createActionThunkAsync)
    const filledEntities = filledEntityMap.FilledEntities()

    // Generate stub
    let scoredAction: CLM.ScoredAction = {
        actionId: undefined!,
        payload: "",
        isTerminal: false,
        actionType: CLM.ActionTypes.API_LOCAL,
        score: 1
    }
    let scoreInput: CLM.ScoreInput = {
        filledEntities: [],
        context: {},
        maskedActions: []
    }
    // Store stub API output in LogicResult
    let logicResult: CLM.LogicResult = {
        logicValue: undefined,
        changedFilledEntities: filledEntities,
    }
    return {
        input: scoreInput,
        labelAction: stubAPIAction.actionId,
        logicResult,
        scoredAction: scoredAction
    }
}
