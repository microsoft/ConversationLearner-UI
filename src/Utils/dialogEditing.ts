
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import * as CLM from '@conversationlearner/models'
import * as Util from './util'
import * as DialogUtils from './dialogUtils'
import * as OBIUtils from './obiUtils'
import * as BB from 'botbuilder'
import { SelectionType, User } from '../types'
import { EditDialogType } from '../types/const'

export async function onInsertAction(
    trainDialog: CLM.TrainDialog,
    selectedActivity: BB.Activity,
    isLastActivity: boolean,

    entities: CLM.EntityBase[],
    actions: CLM.ActionBase[],
    appId: string,
    scoreFromTrainDialog: (appId: string, trainDialog: CLM.TrainDialog) => Promise<CLM.UIScoreResponse>,
    clearWebChatScrollPosition: () => void,
) {
    const clData: CLM.CLChannelData = selectedActivity.channelData.clData
    const roundIndex = clData.roundIndex ?? 0
    const scoreIndex = clData.scoreIndex
    const definitions = {
        entities,
        actions,
        trainDialogs: []
    }

    // Created shorted version of TrainDialog at insert point
    // Copy, Remove rounds / scorer steps below insert
    const trainDialogCopy = Util.deepCopy(trainDialog)
    trainDialogCopy.definitions = definitions
    trainDialogCopy.rounds = trainDialogCopy.rounds.slice(0, roundIndex + 1)

    // Remove action-less dummy step (used for rendering) if it exits
    if (trainDialogCopy.rounds[roundIndex].scorerSteps.length > 0 && trainDialogCopy.rounds[roundIndex].scorerSteps[0].labelAction === undefined) {
        trainDialogCopy.rounds[roundIndex].scorerSteps = []
    }
    else if (scoreIndex === null) {
        trainDialogCopy.rounds[roundIndex].scorerSteps = []
    }
    // Or remove following scorer steps
    else {
        trainDialogCopy.rounds[roundIndex].scorerSteps = trainDialogCopy.rounds[roundIndex].scorerSteps.slice(0, scoreIndex + 1)
    }

    // Get a score for this step
    const uiScoreResponse = await scoreFromTrainDialog(appId, trainDialogCopy)
    if (!uiScoreResponse.scoreResponse) {
        throw new Error("Empty Score Response")
    }

    // End session call only allowed on last turn if one doesn't exist already
    const canEndSession = isLastActivity && !DialogUtils.hasEndSession(trainDialog, actions)

    // Find top scoring Action
    let insertedAction = DialogUtils.getBestAction(uiScoreResponse.scoreResponse, actions, canEndSession)

    // If none were qualified, try to find a valid one in unscored action
    if (!insertedAction && uiScoreResponse.scoreResponse.unscoredActions[0]) {
        const lastRoundIndex = trainDialogCopy.rounds.length - 1
        const lastScoreIndex = trainDialogCopy.rounds[lastRoundIndex].scorerSteps.length > 0
            ? trainDialogCopy.rounds[lastRoundIndex].scorerSteps.length - 1
            : null
        const memories = DialogUtils.getPrevMemories(trainDialogCopy, entities, lastRoundIndex, lastScoreIndex)
        insertedAction = DialogUtils.getBestUnscoredAction(uiScoreResponse.scoreResponse, actions, entities, memories)
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
    selectedActivity: BB.Activity,
    inputText: string,

    appId: string,
    entities: CLM.EntityBase[],
    actions: CLM.ActionBase[],
    extractFromTrainDialog: (appId: string, trainDialog: CLM.TrainDialog, userInput: CLM.UserInput) => Promise<CLM.ExtractResponse>,
    trainDialogReplay: (appId: string, trainDialog: CLM.TrainDialog) => Promise<CLM.TrainDialog>,
    clearWebChatScrollPosition: () => void,
) {

    if (!inputText) {
        throw new Error("inputText is null")
    }

    const clData: CLM.CLChannelData = selectedActivity.channelData.clData
    const roundIndex = clData.roundIndex!
    const scoreIndex = clData.scoreIndex ?? 0
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
    const extractResponse = await extractFromTrainDialog(appId, partialTrainDialog, userInput)

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
    selectedActivity: BB.Activity,
    trainScorerStep: CLM.TrainScorerStep,
    editType: EditDialogType,
    appId: string,
    entities: CLM.EntityBase[],
    actions: CLM.ActionBase[],
    lgItems: CLM.LGItem[] | undefined,
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
    newTrainDialog.definitions = definitions

    // Replay logic functions on train dialog
    const replayedDialog = await trainDialogReplay(appId, newTrainDialog)

    // If importing a dialog
    if (editType === EditDialogType.IMPORT) {

        const replacedAction = actions.find(a => a.actionId === oldTrainScorerStep.labelAction)
        let importHash: string | null = null

        // If replacing imported action
        if (oldTrainScorerStep.importText) {
            // Substitue entityIds back into import text to build import hash lookup
            const filledEntityIdMap = DialogUtils.filledEntityIdMap(trainScorerStep.input.filledEntities, entities)
            const importText = OBIUtils.importTextWithEntityIds(oldTrainScorerStep.importText, filledEntityIdMap)
            importHash = CLM.hashText(importText)
        }
        // If replacing placeholder action
        else if (CLM.ActionBase.isPlaceholderAPI(replacedAction)) {
            const apiAction = new CLM.ApiAction(replacedAction as any)
            importHash = CLM.hashText(apiAction.name)
        }

        // Attach hash of import text to selected action for future lookups
        if (importHash) {
            const action = actions.find(a => a.actionId === trainScorerStep.labelAction)
            if (action) {
                // Add new hash and lgRef to action and save it
                const newAction = Util.deepCopy(action)

                if (!newAction.clientData?.actionHashes) {
                    newAction.clientData = { actionHashes: [] }
                }
                // Look for lgItem by checking hash
                if (oldTrainScorerStep.importText && lgItems) {
                    const lgHash = CLM.hashText(oldTrainScorerStep.importText)
                    const lgItem = lgItems.find(lg => lg.hash === lgHash)
                    if (lgItem) {
                        newAction.clientData.lgName = lgItem.lgName
                    }
                }

                newAction.clientData.actionHashes!.push(importHash)
                await editActionThunkAsync(appId, newAction)

                // Test if new lookup can be used on any other imported actions
                OBIUtils.replaceImportActions(replayedDialog, [...actions, newAction], entities)
            }
        }
        else {
            // Attempt to replace import actions with real actions
            OBIUtils.replaceImportActions(replayedDialog, actions, entities)
        }
    }
    return replayedDialog
}

export async function onChangeExtraction(
    trainDialog: CLM.TrainDialog,
    selectedActivity: BB.Activity,
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
    newTrainDialog.definitions = definitions
    newTrainDialog.rounds[roundIndex].extractorStep.textVariations = textVariations

    // Replay logic functions on train dialog
    const replayedDialog = await trainDialogReplay(appId, newTrainDialog)

    // If importing attempt to replace any stub actions
    if (editType === EditDialogType.IMPORT) {
        OBIUtils.replaceImportActions(replayedDialog, actions, entities)
    }

    return replayedDialog
}

export async function onDeleteTurn(
    trainDialog: CLM.TrainDialog,
    selectedActivity: BB.Activity,

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
    return trainDialogReplay(appId, newTrainDialog)
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
    return trainDialogReplay(appId, newTrainDialog)
}

export async function onUpdateActivities(
    newTrainDialog: CLM.TrainDialog,
    selectedActivity: BB.Activity | null,
    selectionType: SelectionType,

    appId: string,
    user: User,
    fetchActivitiesAsync: (appId: string, trainDialog: CLM.TrainDialog, userName: string, userId: string) => Promise<CLM.TeachWithActivities>
) {
    const teachWithActivities = await fetchActivitiesAsync(appId, newTrainDialog, user.name, user.id)

    let activityIndex: number | null = null

    // If activity was selected, calculate activity to select after update
    if (selectedActivity !== null) {
        // LogDialogs used state:
        // activityIndex = selectedActivity ? DialogUtils.matchedActivityIndex(selectedActivity, this.state.activities) : null
        activityIndex = selectedActivity ? DialogUtils.matchedActivityIndex(selectedActivity, teachWithActivities.activities) : null
        if (activityIndex !== null && selectionType === SelectionType.NEXT) {
            // Select next activity, useful for when inserting a step
            activityIndex = activityIndex + 1
        }
        // If was a delete action, activity won't exist any more, so select by index
        else if (activityIndex === null && selectionType === SelectionType.CURRENT) {

            const clData: CLM.CLChannelData = selectedActivity.channelData.clData
            if (clData?.activityIndex) {
                activityIndex = clData.activityIndex
            }
        }
        else if (selectionType === SelectionType.NONE) {
            activityIndex = null
        }
    }

    return {
        teachWithActivities,
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
    activityIndex: number | null,
    args: EditHandlerArgs | undefined,
    tags: string[],
    description: string,
    editHandler: (trainDialog: CLM.TrainDialog, activity: BB.Activity, args?: EditHandlerArgs) => any,
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
    fetchActivitiesAsync: (appId: string, trainDialog: CLM.TrainDialog, userName: string, userId: string) => Promise<CLM.TeachWithActivities>
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

    // Generate activities
    const teachWithActivities = await fetchActivitiesAsync(app.appId, trainDialog, user.name, user.id)
    // If no index given, select last activity
    const selectedActivity = activityIndex
        ? teachWithActivities.activities[activityIndex]
        : teachWithActivities.activities[teachWithActivities.activities.length - 1]
    const clData: CLM.CLChannelData = { ...selectedActivity.channelData.clData, activityIndex: activityIndex }
    selectedActivity.channelData.clData = clData

    await editHandler(trainDialog, selectedActivity, args)
}

/**
 * Returns placeholder if it exists, otherwise creates it if given creation action.
 * Will add the new action to `actions` if one is created.
 */
export async function getOrCreatePlaceholderAPIAction(
    appId: string,
    placeholderName: string | "",
    isTerminal: boolean,
    actions: CLM.ActionBase[],
    createActionThunkAsync: (appId: string, action: CLM.ActionBase) => Promise<CLM.ActionBase | null> | null
): Promise<CLM.ActionBase | undefined> {
    // Get the action if it has been attached to real API call.
    const apiHash = CLM.hashText(placeholderName)
    let placeholder = actions.find(a => a.clientData?.actionHashes?.find(h => h === apiHash) !== undefined)

    // Otherwise look for matching placeholder action with same name
    if (!placeholder) {
        placeholder = actions.filter(a => CLM.ActionBase.isPlaceholderAPI(a))
            .map(aa => new CLM.ApiAction(aa))
            .find(aaa => aaa.name === placeholderName)
    }
    if (placeholder) {
        return placeholder
    }

    // If create action is available create a new action
    if (createActionThunkAsync) {
        // Otherwise create new placeholder
        const newPlaceholder = CLM.ActionBase.createPlaceholderAPIAction(placeholderName, isTerminal)

        // If placeholder was created by import, add hash for future matching
        newPlaceholder.clientData = { actionHashes: [apiHash] }

        const newAction = await createActionThunkAsync(appId, newPlaceholder)
        if (!newAction) {
            throw new Error("Failed to create placeholder API")
        }
        actions.push(newAction)
        return newAction
    }
    return undefined
}

export function scorerStepFromActivity(trainDialog: CLM.TrainDialog, selectedActivity: BB.Activity): CLM.TrainScorerStep | undefined {

    if (!selectedActivity) {
        return undefined
    }

    const clData: CLM.CLChannelData = selectedActivity.channelData.clData
    // If rounds were trimmed, selectedActivity could have been in deleted rounds
    if (clData.roundIndex !== null) {
        const round = trainDialog.rounds[clData.roundIndex]
        if (round.scorerSteps.length > 0) {
            // If a score round
            if (typeof clData.scoreIndex === "number") {
                return round.scorerSteps[clData.scoreIndex]
            }
            // If user round, get filled entities from first scorer step
            return round.scorerSteps[0]
        }
    }
    return undefined
}

// Returns placeholder if it exists, otherwise creates it
export async function getAPIPlaceholderScorerStep(
    placeholderName: string,
    isTerminal: boolean,
    appId: string,
    actions: CLM.ActionBase[],
    filledEntityMap: CLM.FilledEntityMap,
    createActionThunkAsync: (appId: string, action: CLM.ActionBase) => Promise<CLM.ActionBase | null>
): Promise<CLM.TrainScorerStep> {

    const placeholderAction = await getOrCreatePlaceholderAPIAction(appId, placeholderName, isTerminal,
        actions, createActionThunkAsync)

    if (!placeholderAction) {
        throw new Error("Unable to create API placeholder Action")
    }

    const filledEntities = filledEntityMap.FilledEntities()

    // Generate placeholder
    let scoredAction: CLM.ScoredAction = {
        actionId: placeholderAction.actionId,
        payload: placeholderAction.payload,
        isTerminal: placeholderAction.isTerminal,
        actionType: CLM.ActionTypes.API_LOCAL,
        score: 1
    }
    let scoreInput: CLM.ScoreInput = {
        filledEntities: [],
        context: {},
        maskedActions: []
    }
    // Store placeholder API output in LogicResult
    let logicResult: CLM.LogicResult = {
        logicValue: undefined,
        changedFilledEntities: filledEntities,
    }
    return {
        input: scoreInput,
        labelAction: placeholderAction.actionId,
        logicResult,
        scoredAction: scoredAction
    }
}
