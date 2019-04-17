{
  "trainDialogs": [
    {
      "tags": [],
      "description": "Preliminary Training to cause some expected behavior in future Train Dialogs",
      "trainDialogId": "cd48e75b-a6e7-49d6-a151-77cbfecb56b7",
      "rounds": [
        {
          "extractorStep": {
            "textVariations": [
              {
                "text": "Hi",
                "labelEntities": []
              }
            ]
          },
          "scorerSteps": [
            {
              "input": {
                "filledEntities": [],
                "context": {},
                "maskedActions": []
              },
              "labelAction": "762354c7-8055-49e7-b062-ddc1a32b958e",
              "metrics": {
                "predictMetrics": {
                  "blisTime": 0.01125025749206543,
                  "contextDialogBlisTime": 0
                }
              }
            }
          ]
        },
        {
          "extractorStep": {
            "textVariations": [
              {
                "text": "Yo",
                "labelEntities": []
              }
            ]
          },
          "scorerSteps": [
            {
              "input": {
                "filledEntities": [],
                "context": {},
                "maskedActions": []
              },
              "labelAction": "18fbf909-45fd-44fa-91fc-1c457ef979dd",
              "metrics": {
                "predictMetrics": {
                  "blisTime": 0.006405353546142578,
                  "contextDialogBlisTime": 0
                }
              }
            }
          ]
        },
        {
          "extractorStep": {
            "textVariations": [
              {
                "text": "Bye",
                "labelEntities": []
              }
            ]
          },
          "scorerSteps": [
            {
              "input": {
                "filledEntities": [],
                "context": {},
                "maskedActions": []
              },
              "labelAction": "a1fca285-d5d2-4e3b-8ad5-f78bb50d0533",
              "metrics": {
                "predictMetrics": {
                  "blisTime": 0.011901617050170898,
                  "contextDialogBlisTime": 0
                }
              }
            }
          ]
        }
      ],
      "initialFilledEntities": [],
      "createdDateTime": "2019-03-30T18:16:27.6853997+00:00",
      "lastModifiedDateTime": "2019-03-30T18:18:03+00:00"
    },
    {
      "tags": [],
      "description": "",
      "trainDialogId": "ae35b7a5-3320-4906-b5a3-0f8792ecb2a9",
      "rounds": [
        {
          "extractorStep": {
            "textVariations": [
              {
                "text": "Yo",
                "labelEntities": []
              }
            ]
          },
          "scorerSteps": [
            {
              "input": {
                "filledEntities": [],
                "context": {},
                "maskedActions": []
              },
              "labelAction": "18fbf909-45fd-44fa-91fc-1c457ef979dd",
              "metrics": {
                "predictMetrics": {
                  "blisTime": 0.012134552001953125,
                  "contextDialogBlisTime": 0
                }
              }
            }
          ]
        },
        {
          "extractorStep": {
            "textVariations": [
              {
                "text": "Bye",
                "labelEntities": []
              }
            ]
          },
          "scorerSteps": [
            {
              "input": {
                "filledEntities": [],
                "context": {},
                "maskedActions": []
              },
              "labelAction": "a1fca285-d5d2-4e3b-8ad5-f78bb50d0533",
              "metrics": {
                "predictMetrics": {
                  "blisTime": 0.011738061904907226,
                  "contextDialogBlisTime": 0
                }
              }
            }
          ]
        }
      ],
      "initialFilledEntities": [],
      "createdDateTime": "2019-03-30T22:46:16.4315922+00:00",
      "lastModifiedDateTime": "2019-03-30T22:46:40+00:00"
    }
  ],
  "actions": [
    {
      "actionId": "762354c7-8055-49e7-b062-ddc1a32b958e",
      "createdDateTime": "2019-03-30T18:14:27.3318132+00:00",
      "actionType": "TEXT",
      "payload": "{\"json\":{\"kind\":\"value\",\"document\":{\"kind\":\"document\",\"data\":{},\"nodes\":[{\"kind\":\"block\",\"type\":\"line\",\"isVoid\":false,\"data\":{},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"Hello\",\"marks\":[]}]}]}]}}}",
      "isTerminal": true,
      "requiredEntitiesFromPayload": [],
      "requiredEntities": [],
      "negativeEntities": [],
      "requiredConditions": [],
      "negativeConditions": []
    },
    {
      "actionId": "18fbf909-45fd-44fa-91fc-1c457ef979dd",
      "createdDateTime": "2019-03-30T18:14:41.1207056+00:00",
      "actionType": "TEXT",
      "payload": "{\"json\":{\"kind\":\"value\",\"document\":{\"kind\":\"document\",\"data\":{},\"nodes\":[{\"kind\":\"block\",\"type\":\"line\",\"isVoid\":false,\"data\":{},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"Okay\",\"marks\":[]}]}]}]}}}",
      "isTerminal": true,
      "requiredEntitiesFromPayload": [],
      "requiredEntities": [],
      "negativeEntities": [],
      "requiredConditions": [],
      "negativeConditions": []
    },
    {
      "actionId": "a1fca285-d5d2-4e3b-8ad5-f78bb50d0533",
      "createdDateTime": "2019-03-30T18:14:55.2249451+00:00",
      "actionType": "END_SESSION",
      "payload": "{\"json\":{\"kind\":\"value\",\"document\":{\"kind\":\"document\",\"data\":{},\"nodes\":[{\"kind\":\"block\",\"type\":\"line\",\"isVoid\":false,\"data\":{},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"Goodbye\",\"marks\":[]}]}]}]}}}",
      "isTerminal": true,
      "requiredEntitiesFromPayload": [],
      "requiredEntities": [],
      "negativeEntities": [],
      "requiredConditions": [],
      "negativeConditions": []
    }
  ],
  "entities": [],
  "packageId": "3413463b-15b5-4458-8451-19dcecf63dc8"
}