{
  "trainDialogs": [
    {
      "trainDialogId": "97e67e44-8423-4bb7-8069-058308409d33",
      "rounds": [
        {
          "extractorStep": {
            "textVariations": [
              {
                "text": "Duck",
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
              "labelAction": "43f8f5fa-c7bf-4394-83a5-992d94e822c4",
              "metrics": {
                "predictMetrics": {
                  "blisTime": 0.0068814754486083984,
                  "contextDialogBlisTime": 0
                }
              }
            },
            {
              "input": {
                "filledEntities": [],
                "context": {},
                "maskedActions": []
              },
              "labelAction": "815f3cae-57c3-494e-ae50-7325272eaa1e",
              "metrics": {
                "predictMetrics": {
                  "blisTime": 0.01140284538269043,
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
                "text": "Fish",
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
              "labelAction": "4834181a-ab00-4b54-839a-c3880d8f0619",
              "metrics": {
                "predictMetrics": {
                  "blisTime": 0.011291265487670898,
                  "contextDialogBlisTime": 0
                }
              }
            }
          ]
        }
      ],
      "initialFilledEntities": [],
      "createdDateTime": "2019-01-11T19:01:31.7619602+00:00",
      "lastModifiedDateTime": "2019-01-11T19:02:03+00:00"
    }
  ],
  "actions": [
    {
      "actionId": "815f3cae-57c3-494e-ae50-7325272eaa1e",
      "createdDateTime": "2019-01-11T19:00:49.5486369+00:00",
      "actionType": "TEXT",
      "payload": "{\"json\":{\"kind\":\"value\",\"document\":{\"kind\":\"document\",\"data\":{},\"nodes\":[{\"kind\":\"block\",\"type\":\"line\",\"isVoid\":false,\"data\":{},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"Which animal would you like?\",\"marks\":[]}]}]}]}}}",
      "isTerminal": true,
      "requiredEntitiesFromPayload": [],
      "requiredEntities": [],
      "negativeEntities": []
    },
    {
      "actionId": "3e31c4c8-ba30-4544-9c8d-032a44006220",
      "createdDateTime": "2019-01-11T19:01:00.5164733+00:00",
      "actionType": "TEXT",
      "payload": "{\"json\":{\"kind\":\"value\",\"document\":{\"kind\":\"document\",\"data\":{},\"nodes\":[{\"kind\":\"block\",\"type\":\"line\",\"isVoid\":false,\"data\":{},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"Cows say moo!\",\"marks\":[]}]}]}]}}}",
      "isTerminal": false,
      "requiredEntitiesFromPayload": [],
      "requiredEntities": [],
      "negativeEntities": []
    },
    {
      "actionId": "43f8f5fa-c7bf-4394-83a5-992d94e822c4",
      "createdDateTime": "2019-01-11T19:01:14.9721133+00:00",
      "actionType": "TEXT",
      "payload": "{\"json\":{\"kind\":\"value\",\"document\":{\"kind\":\"document\",\"data\":{},\"nodes\":[{\"kind\":\"block\",\"type\":\"line\",\"isVoid\":false,\"data\":{},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"Ducks say quack!\",\"marks\":[]}]}]}]}}}",
      "isTerminal": false,
      "requiredEntitiesFromPayload": [],
      "requiredEntities": [],
      "negativeEntities": []
    },
    {
      "actionId": "4834181a-ab00-4b54-839a-c3880d8f0619",
      "createdDateTime": "2019-01-11T19:01:25.7780434+00:00",
      "actionType": "TEXT",
      "payload": "{\"json\":{\"kind\":\"value\",\"document\":{\"kind\":\"document\",\"data\":{},\"nodes\":[{\"kind\":\"block\",\"type\":\"line\",\"isVoid\":false,\"data\":{},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"Fish just swim.\",\"marks\":[]}]}]}]}}}",
      "isTerminal": false,
      "requiredEntitiesFromPayload": [],
      "requiredEntities": [],
      "negativeEntities": []
    }
  ],
  "entities": [],
  "packageId": "aec1cf98-b6b4-4ca1-b306-020802ad341b"
}