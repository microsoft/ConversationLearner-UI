{
  "trainDialogs": [
    {
      "tags": [],
      "description": "",
      "trainDialogId": "4d02e9b3-f63f-42e4-af3e-d5c1d4479a45",
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
              "labelAction": "3959904b-7905-49e1-8e6a-7fd24d710b30",
              "metrics": {
                "predictMetrics": {
                  "blisTime": 0.005886077880859375,
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
                "text": "David",
                "labelEntities": [
                  {
                    "entityId": "251fa360-def4-4a89-aa79-eb487e432f29",
                    "startCharIndex": 0,
                    "endCharIndex": 4,
                    "entityText": "David"
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
                    "entityId": "251fa360-def4-4a89-aa79-eb487e432f29",
                    "values": [
                      {
                        "userText": "David",
                        "displayText": "David",
                        "builtinType": null,
                        "resolution": null
                      }
                    ]
                  }
                ],
                "context": {},
                "maskedActions": []
              },
              "labelAction": "2d846a6e-113e-4302-9877-d0e0a581672b",
              "metrics": {
                "predictMetrics": {
                  "blisTime": 0.013062715530395507,
                  "contextDialogBlisTime": 0
                }
              }
            }
          ]
        }
      ],
      "initialFilledEntities": [],
      "createdDateTime": "2019-03-21T02:39:58.1417409+00:00",
      "lastModifiedDateTime": "2019-03-21T02:39:58+00:00"
    },
    {
      "tags": [],
      "description": "",
      "trainDialogId": "0427088c-b615-4259-9144-e8d471a8ad33",
      "rounds": [
        {
          "extractorStep": {
            "textVariations": [
              {
                "text": "My name is David.",
                "labelEntities": [
                  {
                    "entityId": "251fa360-def4-4a89-aa79-eb487e432f29",
                    "startCharIndex": 11,
                    "endCharIndex": 15,
                    "entityText": "David"
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
                    "entityId": "251fa360-def4-4a89-aa79-eb487e432f29",
                    "values": [
                      {
                        "userText": "David",
                        "displayText": "David",
                        "builtinType": null,
                        "resolution": null
                      }
                    ]
                  }
                ],
                "context": {},
                "maskedActions": []
              },
              "labelAction": "2d846a6e-113e-4302-9877-d0e0a581672b",
              "metrics": {
                "predictMetrics": {
                  "blisTime": 0.006306886672973633,
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
                "text": "My name is Gabriella.",
                "labelEntities": [
                  {
                    "entityId": "251fa360-def4-4a89-aa79-eb487e432f29",
                    "startCharIndex": 11,
                    "endCharIndex": 19,
                    "entityText": "Gabriella",
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
                    "entityId": "251fa360-def4-4a89-aa79-eb487e432f29",
                    "values": [
                      {
                        "userText": "Gabriella",
                        "displayText": "Gabriella",
                        "builtinType": "LUIS",
                        "resolution": {}
                      }
                    ]
                  }
                ],
                "context": {},
                "maskedActions": []
              },
              "labelAction": "2d846a6e-113e-4302-9877-d0e0a581672b",
              "metrics": {
                "predictMetrics": {
                  "blisTime": 0.012497425079345703,
                  "contextDialogBlisTime": 0
                }
              }
            }
          ]
        }
      ],
      "initialFilledEntities": [],
      "createdDateTime": "2019-03-21T02:40:13.7900273+00:00",
      "lastModifiedDateTime": "2019-03-21T02:40:58+00:00"
    },
    {
      "tags": [],
      "description": "",
      "trainDialogId": "02f01ce0-cac1-4349-ab9f-d1d7f5c5edd3",
      "rounds": [
        {
          "extractorStep": {
            "textVariations": [
              {
                "text": "My name is Susan.",
                "labelEntities": [
                  {
                    "entityId": "251fa360-def4-4a89-aa79-eb487e432f29",
                    "startCharIndex": 11,
                    "endCharIndex": 15,
                    "entityText": "Susan"
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
                    "entityId": "251fa360-def4-4a89-aa79-eb487e432f29",
                    "values": [
                      {
                        "userText": "Susan",
                        "displayText": "Susan",
                        "builtinType": null,
                        "resolution": null
                      }
                    ]
                  }
                ],
                "context": {},
                "maskedActions": []
              },
              "labelAction": "2d846a6e-113e-4302-9877-d0e0a581672b",
              "metrics": {
                "predictMetrics": {
                  "blisTime": 0.0062961578369140625,
                  "contextDialogBlisTime": 0
                }
              }
            }
          ]
        }
      ],
      "initialFilledEntities": [],
      "createdDateTime": "2019-03-21T02:41:13.9163567+00:00",
      "lastModifiedDateTime": "2019-03-21T02:41:23+00:00"
    }
  ],
  "actions": [
    {
      "actionId": "3959904b-7905-49e1-8e6a-7fd24d710b30",
      "createdDateTime": "2019-03-21T02:39:58.1416699+00:00",
      "actionType": "TEXT",
      "payload": "{\"json\":{\"kind\":\"value\",\"document\":{\"kind\":\"document\",\"data\":{},\"nodes\":[{\"kind\":\"block\",\"type\":\"line\",\"isVoid\":false,\"data\":{},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"What's your name?\",\"marks\":[]}]}]}]}}}",
      "isTerminal": true,
      "requiredEntitiesFromPayload": [],
      "requiredEntities": [],
      "negativeEntities": [
        "251fa360-def4-4a89-aa79-eb487e432f29"
      ],
      "requiredConditions": [],
      "negativeConditions": [],
      "suggestedEntity": "251fa360-def4-4a89-aa79-eb487e432f29"
    },
    {
      "actionId": "2d846a6e-113e-4302-9877-d0e0a581672b",
      "createdDateTime": "2019-03-21T02:39:58.1417167+00:00",
      "actionType": "TEXT",
      "payload": "{\"json\":{\"kind\":\"value\",\"document\":{\"kind\":\"document\",\"data\":{},\"nodes\":[{\"kind\":\"block\",\"type\":\"line\",\"isVoid\":false,\"data\":{},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"Hello \",\"marks\":[]}]},{\"kind\":\"inline\",\"type\":\"mention-inline-node\",\"isVoid\":false,\"data\":{\"completed\":true,\"option\":{\"id\":\"251fa360-def4-4a89-aa79-eb487e432f29\",\"name\":\"name\"}},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"$name\",\"marks\":[]}]}]},{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"\",\"marks\":[]}]}]}]}}}",
      "isTerminal": true,
      "requiredEntitiesFromPayload": [
        "251fa360-def4-4a89-aa79-eb487e432f29"
      ],
      "requiredEntities": [
        "251fa360-def4-4a89-aa79-eb487e432f29"
      ],
      "negativeEntities": [],
      "requiredConditions": [],
      "negativeConditions": []
    }
  ],
  "entities": [
    {
      "entityId": "251fa360-def4-4a89-aa79-eb487e432f29",
      "createdDateTime": "2019-03-21T02:39:58.1416233+00:00",
      "entityName": "name",
      "entityType": "LUIS",
      "isMultivalue": false,
      "isNegatible": false,
      "resolverType": "none"
    }
  ],
  "packageId": "9927ec03-fa88-4427-ab0e-d4e403e02082"
}