import * as CLM from '@conversationlearner/models'
import { SourceAndModelPair } from "src/types/models"
import * as uuid from 'uuid/v4'
import * as Util from './util'
import { DispatcherAlgorithmType } from 'src/components/modals/DispatcherCreator'

/**
 * Generations new source based on child sources and given algorithm
 * @param sourceModelPairs Model Sources and Model Definitions Paired with each other.
 * @param algorithmType Type of generation Algorithm
 */
export function generateDispatcherSource(
    sourceModelPairs: SourceAndModelPair[],
    algorithmType: DispatcherAlgorithmType,
) {
    // TODO: Use declarative map [Type, Fn] instead of switch case
    switch (algorithmType) {
        case DispatcherAlgorithmType.DeterministicSingleTransfer:
            return generageDeterministicDispatcherSource(sourceModelPairs, 3)
        case DispatcherAlgorithmType.RandomSingleTransfer:
            return generageRandomTransitonDispatcherSource(sourceModelPairs, defaultGetPercentageOfRoundsToTransferAt)
    }

    throw new Error(`Could not associate Dispatcher Algorithm Type with algorithm. You passed: ${algorithmType}`)
}

function defaultGetPercentageOfRoundsToTransferAt(numOfRounds: number): number {
    // If dialog is short attempt transfer at all pionts
    if (numOfRounds <= 3) {
        return numOfRounds
    }
    else if (numOfRounds <= 10) {
        return Math.round(numOfRounds * 0.4)
    }
    else if (numOfRounds <= 20) {
        return Math.round(numOfRounds * 0.2)
    }
    else {
        return Math.round(numOfRounds * 0.15)
    }
}

/**
 * Attempt to transition at first N number of rounds for each dialog in model, to a dialog in another model.
 * @param transitionAtFirstNRounds Limit on number of places to transfer between models. Defaults to 3
 */
function generageDeterministicDispatcherSource(
    sourceModelPairs: SourceAndModelPair[],
    transitionAtFirstNRounds: number,
): CLM.AppDefinition {
    generateDispatchActions(sourceModelPairs);
    const modelsTrainDialogs = associateModelDialogsWithDispatchActionsAndClean(sourceModelPairs)
    const trainDialogs = determisticSingleTransfer(modelsTrainDialogs, transitionAtFirstNRounds);
    const source: CLM.AppDefinition = {
        trainDialogs,
        actions: sourceModelPairs.map(sm => sm.action),
        entities: [],
    }

    return source
}

/**
 * Attempt to transition at random N position in rounds for each dialog in model, to a dialog in another model.
 * @param getPercentageOfRoundsToTransferAt Limit on number of places to transfer between models. Defaults to 3
 */
function generageRandomTransitonDispatcherSource(
    sourceModelPairs: SourceAndModelPair[],
    // TODO: Should be percentage of dialog instead of fixed number?
    // 2 transition in 50 round dialog isn't good coverage
    // 2 transitions in 5 step dialog is better?
    getPercentageOfRoundsToTransferAt: (x: number) => number,
): CLM.AppDefinition {
    generateDispatchActions(sourceModelPairs);
    const modelsTrainDialogs = associateModelDialogsWithDispatchActionsAndClean(sourceModelPairs)
    const trainDialogs = randomSingleTransfer(modelsTrainDialogs, getPercentageOfRoundsToTransferAt)
    const source: CLM.AppDefinition = {
        trainDialogs,
        actions: sourceModelPairs.map(sm => sm.action),
        entities: [],
    }

    return source
}

/**
 * Generate 1 Dispatch Action per model and associate with source + model pair
 *
 * Store:
 * - modelId for dispatching
 * - modelName for display
 */
function generateDispatchActions(sourceModelPairs: SourceAndModelPair[]) {
    sourceModelPairs.forEach(smp => {
        // If object already has action associated, don't create new one
        if (smp.action) {
            return
        }

        const dispatchPayload: CLM.DispatchPayload = {
            modelId: smp.model.appId,
            modelName: smp.model.appName
        }

        // TODO: Want strong typing, but this is source schema not ActionBase
        const dispatchAction = {
            actionId: uuid(),
            createdDateTime: new Date().toJSON(),
            actionType: CLM.ActionTypes.DISPATCH,
            payload: JSON.stringify(dispatchPayload),
            isTerminal: true,
            requiredEntitiesFromPayload: [],
            requiredEntities: [],
            negativeEntities: [],
            requiredConditions: [],
            negativeConditions: [],
            clientData: {
                importHashes: []
            }
        }

        smp.action = dispatchAction
    })
}

/**
 * For each dialog in model A set each rounds to use that models Dispatch Action
 * This means, when this input (extraction) is seen, dispatch to this model.
 *
 * Clear all entities, and ensure single scorer step
 */
function associateModelDialogsWithDispatchActionsAndClean(sourceModelPairs: SourceAndModelPair[]): CLM.TrainDialog[][] {
    return sourceModelPairs.map((sm, mIndex) => {
        if (!sm.action) {
            throw new Error(`(Source + Model) pair must have dispatch action assigned at this point`)
        }

        return sm.source.trainDialogs.map((t, tIndex) => {
            t.rounds.forEach(r => {
                // Clear label entities since this don't exist in this model
                r.extractorStep.textVariations.forEach(tv => {
                    tv.labelEntities = []
                })

                // Create clean scorer step with only labelAction id (no entities, masks, logicResult, etc)
                const scorerStep: CLM.TrainScorerStep = {
                    input: {
                        filledEntities: [],
                        context: {},
                        maskedActions: [],
                    },
                    labelAction: sm.action.actionId,
                    logicResult: undefined,
                    scoredAction: undefined,
                }

                r.scorerSteps = [
                    scorerStep
                ]
            })

            t.tags = [`model-${mIndex + 1}`, `dialog-${tIndex + 1}`]
            // t.description = `Model: ${sm.model.appName} - Dialog ${tIndex + 1}

            return t
        })
    })
}

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
 * ...
 *
 * Output:
 * [
 *  [A,D,E,F],
 *  [A,B,D,E,F],
 *  [A,B,C,D,E,F],
 *  [A,G,H,I],
 *  [A,B,G,H,I],
 *  [A,B,C,G,H,I],
 *  [D,A,B,C],
 *  [D,E,A,B,C],
 *  [D,E,F,A,B,C],
 *  [D,G,H,I],
 *  [D,E,G,H,I],
 *  [D,E,F,G,H,I],
 *  ...
 * ]
 *
 * Currently only tests single transition.
 * A to B or A to C
 * Could try re-entry patterns: A B A
 * Could try multi model switch: A B C
 */
function determisticSingleTransfer(
    modelsTrainDialogs: CLM.TrainDialog[][],
    transitionAtFirstNRounds: number
): CLM.TrainDialog[] {
    const allTrainDialogs = modelsTrainDialogs
        .reduce((a, b) => [...a, ...b])

    const dialogsWithoutModelTransition = Util.deepCopy(allTrainDialogs)
    const dialogTransitionGroups = generateDeterministicDialogTransitionGroups(modelsTrainDialogs, transitionAtFirstNRounds)
    const dialogsWithModelTransition = concatTransitionDialogsWithOtherDialogs(dialogTransitionGroups)
        .map(generateDispatchDialog)

    return [
        ...dialogsWithoutModelTransition,
        ...dialogsWithModelTransition
    ]
}


/**
 * Similar to deterministic transfer except try to transition and random N positions within dialog
 *
 * Array of rounds (with random transition points)
 *      1   2          3    4
 * [1,2,3,4,5,6,7,8,9,10,11,12,13,...]
 *  1   2         3            4
 * [1,2,3,4,5,6,7,8,9,10,11,12,13,...]
 */
function randomSingleTransfer(
    modelsTrainDialogs: CLM.TrainDialog[][],
    getPercentageOfRoundsToTransferAt: (x: number) => number,
): CLM.TrainDialog[] {
    const allTrainDialogs = modelsTrainDialogs.reduce((a, b) => [...a, ...b])
    const dialogsWithoutModelTransition = Util.deepCopy(allTrainDialogs)
    const dialogTransitionGroups = generateRandomDialogTransitionGroups(modelsTrainDialogs, getPercentageOfRoundsToTransferAt)
    const dialogsWithModelTransition = concatTransitionDialogsWithOtherDialogs(dialogTransitionGroups)
        .map(generateDispatchDialog)

    return [
        ...dialogsWithoutModelTransition,
        ...dialogsWithModelTransition
    ]
}

const generateDispatchDialog = (t: CLM.TrainDialog) => ({
    tags: [`generated`],
    description: "",
    trainDialogId: uuid(),
    rounds: t.rounds,

    // Ignored fields (Irrelevant for Dispatch function)
    clientData: {
        importHashes: []
    },
    initialFilledEntities: [],
    createdDateTime: new Date().toJSON(),
    lastModifiedDateTime: new Date().toJSON(),
} as unknown as CLM.TrainDialog)

type DialogTransitionGroup = {
    trainDialogsToTransitionFrom: CLM.TrainDialog[]
    trainDialogsFromOtherModels: CLM.TrainDialog[]
}

/**
 * For each dialog to transition from, generate dialog for each of the other model dialogs with concatenation of rounds from A to B
 */
function concatTransitionDialogsWithOtherDialogs(dialogTransitionGroups: DialogTransitionGroup[]) {
    return dialogTransitionGroups
        .map(dialogTransitionGroup => {
            return dialogTransitionGroup.trainDialogsToTransitionFrom
                .map(t => {
                    return dialogTransitionGroup.trainDialogsFromOtherModels
                        .map(dialogFromOtherModel => {
                            const dialogCopy = Util.deepCopy(t)
                            dialogCopy.rounds = [
                                ...dialogCopy.rounds,
                                ...dialogFromOtherModel.rounds,
                            ]

                            return dialogCopy
                        })
                })
                .reduce((a, b) => [...a, ...b])
        })
        .reduce((a, b) => [...a, ...b])
}

function generateRandomDialogTransitionGroups(
    modelsTrainDialogs: CLM.TrainDialog[][],
    getPercentageOfRoundsToTransferAt: (x: number) => number,
) {
    return modelsTrainDialogs
        .map((modelDialogs, mIndex) => {
            /**
             * Original implementation attempted transitions within same model and preserved action
             * This could be good or introduce noise. Consider it as option
             */
            const trainDialogsFromOtherModels = modelsTrainDialogs
                .filter((_, k) => k !== mIndex)
                .reduce((a, b) => [...a, ...b])

            const trainDialogsToTransitionFrom = modelDialogs
                .map(t => {
                    const numRandomTransfersPoints = getPercentageOfRoundsToTransferAt(t.rounds.length)
                    const transitionRoundIncies = getUniqueRandomNumbers(numRandomTransfersPoints, t.rounds.length)
                    console.log({ transitionRoundIncies })

                    // For each transition point generate a new dialog with rounds up to that point
                    return transitionRoundIncies
                        .map(transitionRoundIndex => {
                            const dialogCopy = Util.deepCopy(t);
                            dialogCopy.rounds = dialogCopy.rounds.slice(0, transitionRoundIndex)
                            return dialogCopy
                        })
                })
                .reduce((a, b) => [...a, ...b])

            return {
                trainDialogsToTransitionFrom,
                trainDialogsFromOtherModels
            }
        })
}

function getUniqueRandomNumbers(length: number, max: number) {
    const numbers: number[] = []

    while (numbers.length < length) {
        const n = Math.ceil(Math.random() * max)
        if (!numbers.includes(n)) {
            numbers.push(n)
        }
    }

    return numbers
}

function generateDeterministicDialogTransitionGroups(
    modelsTrainDialogs: CLM.TrainDialog[][],
    transitionAtFirstNRounds: number
) {
    return modelsTrainDialogs
        .map((modelDialogs, mIndex) => {
            /**
             * Original implementation attempted transitions within same model and preserved action
             * This could be good or introduce noise. Consider it as option
             */
            const trainDialogsFromOtherModels = modelsTrainDialogs
                .filter((_, k) => k !== mIndex)
                .reduce((a, b) => [...a, ...b])

            const trainDialogsToTransitionFrom = modelDialogs
                .map(t => {
                    // TODO: Adapt to be able to transition at multiple points in dialog
                    // Beginning (First 4) and End (Last 4) ?
                    const possibleTransitionRounds = t.rounds.slice(0, transitionAtFirstNRounds)

                    // For each transition point generate a new dialog
                    return possibleTransitionRounds
                        .map((_, rIndex, rounds) => {
                            const dialogCopy = Util.deepCopy(t)
                            const roundsUpToTransitionPoint = rounds.slice(0, rIndex + 1)
                            dialogCopy.rounds = roundsUpToTransitionPoint
                            return dialogCopy
                        })
                })
                .reduce((a, b) => [...a, ...b])

            return {
                trainDialogsToTransitionFrom,
                trainDialogsFromOtherModels,
            }
        })
}

