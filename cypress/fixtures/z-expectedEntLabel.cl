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
      "createdDateTime": "2019-03-21T20:51:59.8576607+00:00",
      "lastModifiedDateTime": "2019-03-21T20:51:59+00:00"
    },
    {
      "tags": [],
      "description": "",
      "trainDialogId": "702e2af3-d902-4a4c-a3c6-57fa682b1daf",
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
                  "blisTime": 0.012633323669433593,
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
                "text": "My name is Susan.",
                "labelEntities": [
                  {
                    "entityId": "251fa360-def4-4a89-aa79-eb487e432f29",
                    "startCharIndex": 11,
                    "endCharIndex": 15,
                    "entityText": "Susan",
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
                        "userText": "Susan",
                        "displayText": "Susan",
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
                  "blisTime": 0.006091117858886719,
                  "contextDialogBlisTime": 0
                }
              }
            }
          ]
        }
      ],
      "initialFilledEntities": [],
      "createdDateTime": "2019-03-21T20:52:16.1428651+00:00",
      "lastModifiedDateTime": "2019-03-21T20:52:49+00:00"
    },
    {
      "tags": [],
      "description": "",
      "trainDialogId": "45e7da87-ecf5-47f4-9903-39e9ade1fe53",
      "rounds": [
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
                    "entityText": "Gabriella"
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
                  "blisTime": 0.011754035949707031,
                  "contextDialogBlisTime": 0
                }
              }
            }
          ]
        }
      ],
      "initialFilledEntities": [],
      "createdDateTime": "2019-03-21T20:53:05.9698371+00:00",
      "lastModifiedDateTime": "2019-03-21T20:53:15+00:00"
    }
  ],
  "actions": [
    {
      "actionId": "3959904b-7905-49e1-8e6a-7fd24d710b30",
      "createdDateTime": "2019-03-21T20:51:59.8576231+00:00",
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
      "createdDateTime": "2019-03-21T20:51:59.8576455+00:00",
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
      "createdDateTime": "2019-03-21T20:51:59.857582+00:00",
      "entityName": "name",
      "entityType": "LUIS",
      "isMultivalue": false,
      "isNegatible": false,
      "resolverType": "none"
    }
  ],
  "packageId": "f91899c3-e7bc-4868-ac27-07120778b8fc"
}