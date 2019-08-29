import * as CLM from '@conversationlearner/models'
import { SourceAndModelPair } from "src/types/models"
import * as uuid from 'uuid/v4'
import * as Util from './util'
import { DispatcherAlgorithmType } from 'src/components/modals/DispatcherCreator';

/**
 * Generations new source based on child sources and given algorithm
 * @param sourceModelPairs Model Sources and Model Definitions Paired with each other.
 * @param algorithmType Type of generation Algorithm
 */
export function generateDispatcherSource(
    sourceModelPairs: SourceAndModelPair[],
    algorithmType: DispatcherAlgorithmType,
) {
    switch (algorithmType) {
        case DispatcherAlgorithmType.DeterministicSingleTransfer:
            return generageDeterministicDispatcherSource(sourceModelPairs)
    }

    throw new Error(`Could not associate Dispatcher Algorithm Type with algorithm. You passed: ${algorithmType}`)
}

/**
 * Attempt to transition at first N number of rounds for each dialog in model, to a dialog in another model.
 * @param transitionRoundLimit Limit on number of places to transfer between models. Defaults to 3
 */
function generageDeterministicDispatcherSource(
    sourceModelPairs: SourceAndModelPair[],
    transitionRoundLimit: number = 3,
): CLM.AppDefinition {
    generateDispatchActions(sourceModelPairs);

    const modelsTrainDialogs = associateModelDialogsWithDispatchActionsAndClean(sourceModelPairs)

    const trainDialogs = determisticSingleTransfer(modelsTrainDialogs, transitionRoundLimit);

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
            throw new Error(`(Source + Model) pair must have dispatch action assigned at this point`);
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

            t.tags = [`model-${mIndex + 1}`, `dialog-${tIndex + 1}`];
            // t.description = `Model: ${sm.model.appName} - Dialog ${tIndex + 1}

            return t;
        });
    });
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
 */

function determisticSingleTransfer(
    modelsTrainDialogs: CLM.TrainDialog[][],
    transitionRoundLimit: number
): CLM.TrainDialog[] {
    const allTrainDialogs = modelsTrainDialogs
        .reduce((a, b) => [...a, ...b])

    const dialogsWithoutModelTransition = Util.deepCopy(allTrainDialogs)

    /**
     * Currently only tests single transition.
     * A to B or A to C
     * Could try re-entry patterns: A B A
     * Could try multi model switch: A B C
     */
    const mixRounds = modelsTrainDialogs
        .map((modelDialogs, mIndex) => {

            /**
             * Original implementation attempted transitions within same model and preserved action
             * This could be good or introduce noise. Consider it as option
             */
            const trainDialogsFromOtherModels = modelsTrainDialogs.filter((_, k) => k !== mIndex);
            return modelDialogs
                .map(t => t.rounds)
                .map((rs, i, allDialogsRounds) => {
                    // Get rounds from dialogs other than the one being dispatched
                    const otherDialogsRounds = trainDialogsFromOtherModels
                        .reduce((a, b) => [...a, ...b])
                        .map(t => t.rounds)

                    // TODO: Adapt to be able to transition at multiple points in dialog
                    // Beginning (First 4) and End (Last 4) ?
                    const possibleTransitionRounds = rs
                        // Only attempt to transition within first 4 rounds
                        // After 4, assume user will stay on task
                        .filter((_, j) => j <= transitionRoundLimit);

                    // For each round, try to transition to one of the other dialogs
                    return otherDialogsRounds
                        .map((dialogRounds) => {
                            return possibleTransitionRounds
                                .map((_, k) => {
                                    // Get rounds until index
                                    const firstRounds = rs.slice(0, k + 1)
                                    // Note: always concatenates entire dialog from start
                                    const secondRounds = dialogRounds
                                    return [...firstRounds, ...secondRounds]
                                });
                        })
                        .reduce((a, b) => [...a, ...b])
                })
                .reduce((a, b) => [...a, ...b])
        })
        .reduce((a, b) => [...a, ...b])

    const mixedDialogs = mixRounds.map<CLM.TrainDialog>(rs => {
        return {
            tags: [`generated`],
            description: "",
            trainDialogId: uuid(),
            rounds: rs,

            // Ignored fields
            clientData: {
                importHashes: []
            },
            initialFilledEntities: [],
            createdDateTime: new Date().toJSON(),
            lastModifiedDateTime: new Date().toJSON(),
        } as unknown as CLM.TrainDialog
    })

    return [
        ...dialogsWithoutModelTransition,
        ...mixedDialogs
    ]
}

