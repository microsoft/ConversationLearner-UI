{
  "trainDialogs": [
    {
      "tags": [],
      "description": "",
      "trainDialogId": "ba8df63b-2ac7-4778-9726-abe044eb1858",
      "rounds": [
        {
          "extractorStep": {
            "textVariations": [
              {
                "text": "The user asks a silly question",
                "labelEntities": [
                  {
                    "entityId": "4680098e-10b6-4d07-93f8-c177208a09d2",
                    "startCharIndex": 4,
                    "endCharIndex": 7,
                    "entityText": "user",
                    "resolution": {},
                    "builtinType": "LUIS"
                  }
                ]
              }
            ]
          },
          "scorerSteps": [
            {
              "input": {
                "filledEntities": [
                  {
                    "entityId": "4680098e-10b6-4d07-93f8-c177208a09d2",
                    "values": [
                      {
                        "userText": "user",
                        "displayText": "user",
                        "builtinType": "LUIS",
                        "resolution": {}
                      }
                    ]
                  }
                ],
                "context": {},
                "maskedActions": []
              },
              "labelAction": "22c5ec77-a58f-4121-9f55-e864b2b92d03",
              "metrics": {
                "predictMetrics": {
                  "blisTime": 0.012001514434814453,
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
                "text": "The user asks another question",
                "labelEntities": []
              }
            ]
          },
          "scorerSteps": [
            {
              "input": {
                "filledEntities": [
                  {
                    "entityId": "4680098e-10b6-4d07-93f8-c177208a09d2",
                    "values": [
                      {
                        "userText": "user",
                        "displayText": "user",
                        "builtinType": "LUIS",
                        "resolution": {}
                      }
                    ]
                  }
                ],
                "context": {},
                "maskedActions": []
              },
              "labelAction": "237752b1-85f1-4ba6-9b17-29a3280402be",
              "metrics": {
                "predictMetrics": {
                  "blisTime": 0.012685775756835937,
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
                "text": "The user asks their final question",
                "labelEntities": [
                  {
                    "entityId": "4680098e-10b6-4d07-93f8-c177208a09d2",
                    "startCharIndex": 4,
                    "endCharIndex": 7,
                    "entityText": "user",
                    "resolution": {},
                    "builtinType": "LUIS"
                  },
                  {
                    "entityId": "f6207de3-8c54-4259-ab6b-8c7e5c3545c7",
                    "startCharIndex": 9,
                    "endCharIndex": 12,
                    "entityText": "asks",
                    "resolution": {},
                    "builtinType": "LUIS"
                  }
                ]
              }
            ]
          },
          "scorerSteps": [
            {
              "input": {
                "filledEntities": [
                  {
                    "entityId": "4680098e-10b6-4d07-93f8-c177208a09d2",
                    "values": [
                      {
                        "userText": "user",
                        "displayText": "user",
                        "builtinType": "LUIS",
                        "resolution": {}
                      }
                    ]
                  },
                  {
                    "entityId": "f6207de3-8c54-4259-ab6b-8c7e5c3545c7",
                    "values": [
                      {
                        "userText": "asks",
                        "displayText": "asks",
                        "builtinType": "LUIS",
                        "resolution": {}
                      }
                    ]
                  }
                ],
                "context": {},
                "maskedActions": []
              },
              "labelAction": "237752b1-85f1-4ba6-9b17-29a3280402be",
              "metrics": {
                "predictMetrics": {
                  "blisTime": 0.011852264404296875,
                  "contextDialogBlisTime": 0
                }
              }
            }
          ]
        }
      ],
      "clientData": {
        "importHashes": []
      },
      "initialFilledEntities": [],
      "createdDateTime": "2019-08-30T21:51:14.4925157+00:00",
      "lastModifiedDateTime": "2019-09-04T00:51:50+00:00"
    }
  ],
  "actions": [
    {
      "actionId": "22c5ec77-a58f-4121-9f55-e864b2b92d03",
      "createdDateTime": "2019-08-30T19:56:33.1449273+00:00",
      "actionType": "TEXT",
      "payload": "{\"json\":{\"kind\":\"value\",\"document\":{\"kind\":\"document\",\"data\":{},\"nodes\":[{\"kind\":\"block\",\"type\":\"line\",\"isVoid\":false,\"data\":{},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"Bot responds with a silly answer\",\"marks\":[]}]}]}]}}}",
      "isTerminal": true,
      "requiredEntitiesFromPayload": [],
      "requiredEntities": [],
      "negativeEntities": [],
      "requiredConditions": [],
      "negativeConditions": [],
      "clientData": {
        "importHashes": []
      }
    },
    {
      "actionId": "237752b1-85f1-4ba6-9b17-29a3280402be",
      "createdDateTime": "2019-08-30T19:57:19.9045445+00:00",
      "actionType": "TEXT",
      "payload": "{\"json\":{\"kind\":\"value\",\"document\":{\"kind\":\"document\",\"data\":{},\"nodes\":[{\"kind\":\"block\",\"type\":\"line\",\"isVoid\":false,\"data\":{},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"The Bot responds once again\",\"marks\":[]}]}]}]}}}",
      "isTerminal": true,
      "requiredEntitiesFromPayload": [],
      "requiredEntities": [],
      "negativeEntities": [],
      "requiredConditions": [],
      "negativeConditions": [],
      "clientData": {
        "importHashes": []
      }
    }
  ],
  "entities": [
    {
      "entityId": "4680098e-10b6-4d07-93f8-c177208a09d2",
      "createdDateTime": "2019-08-30T19:55:03.0859742+00:00",
      "entityName": "one",
      "entityType": "LUIS",
      "isMultivalue": false,
      "isNegatible": false,
      "resolverType": "none"
    },
    {
      "entityId": "f6207de3-8c54-4259-ab6b-8c7e5c3545c7",
      "createdDateTime": "2019-08-30T19:55:08.7492653+00:00",
      "entityName": "two",
      "entityType": "LUIS",
      "isMultivalue": false,
      "isNegatible": false,
      "resolverType": "none"
    },
    {
      "entityId": "4e64208b-1450-4490-b56f-b0cc3c2bab7c",
      "createdDateTime": "2019-08-30T19:55:15.15259+00:00",
      "entityName": "three",
      "entityType": "LUIS",
      "isMultivalue": false,
      "isNegatible": false,
      "resolverType": "none"
    }
  ],
  "packageId": "55b7c078-25c5-482e-93c2-ccbefc0f5ced"
}