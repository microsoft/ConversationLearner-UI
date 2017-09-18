import * as models from 'blis-models';

export const logDialogs: models.LogDialog[] = [
    {
        logDialogId: "a66161f0-60a4-488b-8e43-e210cf82e962",
        dialogBeginDatetime: "2017-09-14T20:44:51.238Z",
        dialogEndDatetime: "2017-09-14T20:44:51.238Z",
        packageId: 1,
        metrics: "mock-metric",
        rounds: [
            {
                extractorStep: new models.LogExtractorStep({
                    stepBeginDatetime: "2017-09-14T20:44:51.238Z",
                    stepEndDatetime: "2017-09-14T20:44:51.238Z",
                    text: "Mock First Utterance"
                }),
                scorerSteps: [
                    {
                        input: new models.ScoreInput(),
                        predictedAction: "predictedAction",
                        predictionDetails: new models.ScoreResponse(),
                        stepBeginDatetime: "stepBeginDatetime",
                        stepEndDatetime: "stepEndDatetime",
                        metrics: new models.Metrics()
                    }
                ]
            },
            {
                extractorStep: new models.LogExtractorStep({
                    stepBeginDatetime: "2017-09-14T20:44:51.238Z",
                    stepEndDatetime: "2017-09-14T20:44:51.238Z",
                    text: "Mock Last Utterance"
                }),
                scorerSteps: [
                    {
                        input: new models.ScoreInput(),
                        predictedAction: "predictedAction",
                        predictionDetails: new models.ScoreResponse(),
                        stepBeginDatetime: "stepBeginDatetime",
                        stepEndDatetime: "stepEndDatetime",
                        metrics: new models.Metrics()
                    }
                ]
            }
        ]
    },
    {
        logDialogId: "a66161f0-60a4-488b-8e43-e210cf82e963",
        dialogBeginDatetime: "2017-09-14T20:44:51.238Z",
        dialogEndDatetime: "2017-09-14T20:44:51.238Z",
        packageId: 1,
        metrics: "mock-metric",
        rounds: [
            {
                extractorStep: new models.LogExtractorStep({
                    stepBeginDatetime: "2017-09-14T20:44:51.238Z",
                    stepEndDatetime: "2017-09-14T20:44:51.238Z",
                    text: "Mock First Utterance"
                }),
                scorerSteps: [
                    {
                        input: new models.ScoreInput(),
                        predictedAction: "predictedAction",
                        predictionDetails: new models.ScoreResponse(),
                        stepBeginDatetime: "stepBeginDatetime",
                        stepEndDatetime: "stepEndDatetime",
                        metrics: new models.Metrics()
                    }
                ]
            },
            {
                extractorStep: new models.LogExtractorStep({
                    stepBeginDatetime: "2017-09-14T20:44:51.238Z",
                    stepEndDatetime: "2017-09-14T20:44:51.238Z",
                    text: "Mock Last Utterance"
                }),
                scorerSteps: [
                    {
                        input: new models.ScoreInput(),
                        predictedAction: "predictedAction",
                        predictionDetails: new models.ScoreResponse(),
                        stepBeginDatetime: "stepBeginDatetime",
                        stepEndDatetime: "stepEndDatetime",
                        metrics: new models.Metrics()
                    }
                ]
            }
        ]
    }
]