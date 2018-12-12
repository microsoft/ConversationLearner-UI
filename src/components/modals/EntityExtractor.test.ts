import { EntityExtractor } from './EntityExtractor'
import { TextVariation, ExtractResponse, LabeledEntity, PredictedEntity, TrainDialog, ModelUtils } from '@conversationlearner/models'

describe(`EntityExtractor`, () => {
    const labeledEntity: LabeledEntity = {
        builtinType: 'testBuiltinType',
        entityId: 'testEntityId',
        entityText: 'testEntityText',
        startCharIndex: 0,
        endCharIndex: 2,
        resolution: {}
    }
    const textVariation: TextVariation = {
        text: 'test text',
        labelEntities: []
    }
    const predictedEntity: PredictedEntity = {
        ...labeledEntity,
        score: 0
    }
    const extractResponse: ExtractResponse = {
        text: 'test text',
        predictedEntities: [],
        packageId: 'testPackageId',
        metrics: {
            wallTime: 0
        },
        definitions: {
            entities: [],
            actions: [],
            trainDialogs: []
        }
    }

    describe(`isInconsistentExtraction`, () => {
        describe(`given a textVariation and extractResponse return true if it is inconsistent`, () => {
            test(`given different texts return false`, () => {
                // Arrange
                const textVariationWithText: TextVariation = {
                    ...textVariation,
                    text: `other text`
                }
                // Act + Assert
                expect(EntityExtractor.isInconsistentExtraction(extractResponse, textVariationWithText)).toBe(false)
            })

            test(`given different number of entities return true`, () => {
                // Arrange
                const modifiedExtractResponse: ExtractResponse = {
                    ...extractResponse,
                    predictedEntities: [
                        { ...predictedEntity }
                    ]
                }

                // Arrange + Assert
                expect(EntityExtractor.isInconsistentExtraction(modifiedExtractResponse, textVariation)).toBe(true)
            })

            test(`given same number of entities but different ids`, () => {
                // Arrange
                const textVariationWithIdA: TextVariation = {
                    ...textVariation,
                    labelEntities: [
                        {
                            ...labeledEntity,
                            entityId: `testEntityId_A`
                        }
                    ]
                }

                const extractResponseWithIdB: ExtractResponse = {
                    ...extractResponse,
                    predictedEntities: [
                        {
                            ...predictedEntity,
                            entityId: `testEntityId_B`
                        }
                    ]
                }

                // Act + Assert
                expect(EntityExtractor.isInconsistentExtraction(extractResponseWithIdB, textVariationWithIdA)).toBe(true)
            })

            test(`given same number of entities and ids but different location`, () => {
                // Arrange
                const textVariationWithDifferentLocation: TextVariation = {
                    ...textVariation,
                    labelEntities: [
                        {
                            ...labeledEntity,
                            startCharIndex: 1,
                            endCharIndex: 3
                        }
                    ]
                }

                const extractResponseWithEntity: ExtractResponse = {
                    ...extractResponse,
                    predictedEntities: [
                        {
                            ...predictedEntity
                        }
                    ]
                }

                // Act + Assert
                expect(EntityExtractor.isInconsistentExtraction(extractResponseWithEntity, textVariationWithDifferentLocation)).toBe(true)
            })
        })
    })

    describe(`getInconsistentResponses`, () => {
        test(`given train dialogs with 3 rounds and user attempting submit response with inconsistency return the response.`, () => {
            // Arrange
            const trainDialogBase: TrainDialog = {
                invalid: false,
                packageCreationId: 1,
                packageDeletionId: 2,
                sourceLogDialogId: 'sourceLogId',
                trainDialogId: 'textTrainDialogId',
                rounds: [],
                definitions: {
                    entities: [],
                    actions: [],
                    trainDialogs: []
                },
                version: 0
            }
            
            const nameLabeledEntity: LabeledEntity = {
                ...labeledEntity,
                entityId: `name`,
                entityText: `Matt`
            }

            const trainDialogs: TrainDialog[] = [
                {
                    ...trainDialogBase,
                    rounds: [
                        {
                            extractorStep: {
                                textVariations: [
                                    {
                                        ...textVariation,
                                        text: `My name is Matt`,
                                        labelEntities: [
                                            {
                                                ...nameLabeledEntity,
                                                startCharIndex: 11,
                                                endCharIndex: 15
                                            }
                                        ]
                                    },
                                    {
                                        ...textVariation,
                                        text: `Call me Matt`,
                                        labelEntities: [
                                            {
                                                ...nameLabeledEntity,
                                                startCharIndex: 8,
                                                endCharIndex: 12
                                            }
                                        ]
                                    }
                                ]
                            },
                            scorerSteps: []
                        },
                        {
                            extractorStep: {
                                textVariations: [
                                    {
                                        ...textVariation,
                                        text: `I'm doing better`
                                    }
                                ]
                            },
                            scorerSteps: []
                        },
                        {
                            extractorStep: {
                                textVariations: [
                                    {
                                        ...textVariation,
                                        text: `It's raining`
                                    }
                                ]
                            },
                            scorerSteps: []
                        }
                    ]
                }
            ]

            const userAttemptedExtractResponses: ExtractResponse[] = [
                {
                    ...extractResponse,
                    text: 'Call me Matt',
                    predictedEntities: [
                        {
                            ...nameLabeledEntity,
                            score: 0,
                            startCharIndex: 0,
                            endCharIndex: 4
                        }
                    ]
                }
            ]

            const inconsistentResponses = ModelUtils.ToExtractResponses([trainDialogs[0].rounds[0].extractorStep.textVariations[1]])

            expect(EntityExtractor.getInconsistentResponses(trainDialogs, userAttemptedExtractResponses)).toEqual(inconsistentResponses)
        })
    })
})