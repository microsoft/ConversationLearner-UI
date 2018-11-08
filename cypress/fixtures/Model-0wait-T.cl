{
  "trainDialogs": [
    {
      "trainDialogId": "4a8630cc-2921-416c-b4fb-0d3cf1703838",
      "rounds": [
        {
          "extractorStep": {
            "textVariations": [
              {
                "text": "Hello",
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
              "labelAction": "e3e7303f-3247-49c9-bcfa-7760c9568ee7",
              "metrics": {
                "predictMetrics": {
                  "blisTime": 0.006057024002075195,
                  "contextDialogBlisTime": 0
                }
              },
              "logicResult": null
            }
          ]
        },
        {
          "extractorStep": {
            "textVariations": [
              {
                "text": "Cow",
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
              "labelAction": "17e5d46f-b416-4edd-aeef-a7d851cd5124",
              "metrics": {
                "predictMetrics": {
                  "blisTime": 0.010661602020263672,
                  "contextDialogBlisTime": 0
                }
              },
              "logicResult": null
            },
            {
              "input": {
                "filledEntities": [],
                "context": {},
                "maskedActions": []
              },
              "labelAction": "e3e7303f-3247-49c9-bcfa-7760c9568ee7",
              "metrics": {
                "predictMetrics": {
                  "blisTime": 0.011955976486206054,
                  "contextDialogBlisTime": 0
                }
              },
              "logicResult": null
            }
          ]
        },
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
              "labelAction": "04c279da-549e-44a2-8d56-bd1617bcbe79",
              "metrics": {
                "predictMetrics": {
                  "blisTime": 0.011603355407714843,
                  "contextDialogBlisTime": 0
                }
              },
              "logicResult": null
            },
            {
              "input": {
                "filledEntities": [],
                "context": {},
                "maskedActions": []
              },
              "labelAction": "e3e7303f-3247-49c9-bcfa-7760c9568ee7",
              "metrics": {
                "predictMetrics": {
                  "blisTime": 0.005564212799072266,
                  "contextDialogBlisTime": 0
                }
              },
              "logicResult": null
            }
          ]
        }
      ],
      "initialFilledEntities": [],
      "createdDateTime": "2018-10-22T22:35:45.3039287+00:00",
      "lastModifiedDateTime": "2018-10-22T22:36:13+00:00"
    }
  ],
  "actions": [
    {
      "actionId": "e3e7303f-3247-49c9-bcfa-7760c9568ee7",
      "createdDateTime": "2018-10-22T17:57:35.6753215+00:00",
      "actionType": "TEXT",
      "payload": "{\"json\":{\"kind\":\"value\",\"document\":{\"kind\":\"document\",\"data\":{},\"nodes\":[{\"kind\":\"block\",\"type\":\"line\",\"isVoid\":false,\"data\":{},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"Which animal would you like?\",\"marks\":[]}]}]}]}}}",
      "isTerminal": true,
      "requiredEntitiesFromPayload": [],
      "requiredEntities": [],
      "negativeEntities": []
    },
    {
      "actionId": "17e5d46f-b416-4edd-aeef-a7d851cd5124",
      "createdDateTime": "2018-10-22T17:57:43.6598283+00:00",
      "actionType": "TEXT",
      "payload": "{\"json\":{\"kind\":\"value\",\"document\":{\"kind\":\"document\",\"data\":{},\"nodes\":[{\"kind\":\"block\",\"type\":\"line\",\"isVoid\":false,\"data\":{},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"Cows say moo!\",\"marks\":[]}]}]}]}}}",
      "isTerminal": false,
      "requiredEntitiesFromPayload": [],
      "requiredEntities": [],
      "negativeEntities": []
    },
    {
      "actionId": "04c279da-549e-44a2-8d56-bd1617bcbe79",
      "createdDateTime": "2018-10-22T17:57:50.8067169+00:00",
      "actionType": "TEXT",
      "payload": "{\"json\":{\"kind\":\"value\",\"document\":{\"kind\":\"document\",\"data\":{},\"nodes\":[{\"kind\":\"block\",\"type\":\"line\",\"isVoid\":false,\"data\":{},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"Ducks say quack!\",\"marks\":[]}]}]}]}}}",
      "isTerminal": false,
      "requiredEntitiesFromPayload": [],
      "requiredEntities": [],
      "negativeEntities": []
    }
  ],
  "entities": [],
  "packageId": "c56ebb52-ed26-4001-aa92-199bf47530c2"
}