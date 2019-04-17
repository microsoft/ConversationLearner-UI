{
  "trainDialogs": [
    {
      "trainDialogId": "112a4a2a-118f-4494-b1db-1acfc27ea5c6",
      "rounds": [
        {
          "extractorStep": {
            "textVariations": [
              {
                "text": "Hey",
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
              "labelAction": "4b790d93-867b-4c08-bf63-b9e1ab241e3f",
              "metrics": {
                "predictMetrics": {
                  "blisTime": 0.0064601898193359375,
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
                "text": "Sam",
                "labelEntities": [
                  {
                    "entityId": "404f9cd3-46ec-4924-9324-226db8823a9b",
                    "startCharIndex": 0,
                    "endCharIndex": 2,
                    "entityText": "Sam"
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
                    "entityId": "404f9cd3-46ec-4924-9324-226db8823a9b",
                    "values": [
                      {
                        "userText": "Sam",
                        "displayText": "Sam",
                        "builtinType": null,
                        "resolution": null
                      }
                    ]
                  }
                ],
                "context": {},
                "maskedActions": []
              },
              "labelAction": "b0aa963e-fcb6-438f-93d3-5e6ed233c43f",
              "metrics": {
                "predictMetrics": {
                  "blisTime": 0.012094259262084961,
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
                "text": "Hey",
                "labelEntities": []
              }
            ]
          },
          "scorerSteps": [
            {
              "input": {
                "filledEntities": [
                  {
                    "entityId": "404f9cd3-46ec-4924-9324-226db8823a9b",
                    "values": [
                      {
                        "userText": "Sam",
                        "displayText": "Sam",
                        "builtinType": null,
                        "resolution": null
                      }
                    ]
                  }
                ],
                "context": {},
                "maskedActions": []
              },
              "labelAction": "3fcee609-770b-46af-b9d8-d938c3a0cc5d",
              "metrics": {
                "predictMetrics": {
                  "blisTime": 0.010582923889160156,
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
                "text": "world peace",
                "labelEntities": [
                  {
                    "entityId": "5848b1fb-c443-4b92-841d-ba96f0e8c7b3",
                    "startCharIndex": 0,
                    "endCharIndex": 10,
                    "entityText": "world peace"
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
                    "entityId": "404f9cd3-46ec-4924-9324-226db8823a9b",
                    "values": [
                      {
                        "userText": "Sam",
                        "displayText": "Sam",
                        "builtinType": null,
                        "resolution": null
                      }
                    ]
                  },
                  {
                    "entityId": "5848b1fb-c443-4b92-841d-ba96f0e8c7b3",
                    "values": [
                      {
                        "userText": "world peace",
                        "displayText": "world peace",
                        "builtinType": null,
                        "resolution": null
                      }
                    ]
                  }
                ],
                "context": {},
                "maskedActions": []
              },
              "labelAction": "f164a42c-6887-402e-9196-0af0028e5ac4",
              "metrics": {
                "predictMetrics": {
                  "blisTime": 0.00603938102722168,
                  "contextDialogBlisTime": 0
                }
              }
            }
          ]
        }
      ],
      "initialFilledEntities": [],
      "createdDateTime": "2019-01-04T00:52:58.9670729+00:00",
      "lastModifiedDateTime": "2019-01-04T01:18:20+00:00"
    }
  ],
  "actions": [
    {
      "actionId": "4b790d93-867b-4c08-bf63-b9e1ab241e3f",
      "createdDateTime": "2019-01-04T00:52:39.4540895+00:00",
      "actionType": "TEXT",
      "payload": "{\"json\":{\"kind\":\"value\",\"document\":{\"kind\":\"document\",\"data\":{},\"nodes\":[{\"kind\":\"block\",\"type\":\"line\",\"isVoid\":false,\"data\":{},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"What's your name?\",\"marks\":[]}]}]}]}}}",
      "isTerminal": true,
      "requiredEntitiesFromPayload": [],
      "requiredEntities": [],
      "negativeEntities": [
        "404f9cd3-46ec-4924-9324-226db8823a9b"
      ],
      "suggestedEntity": "404f9cd3-46ec-4924-9324-226db8823a9b"
    },
    {
      "actionId": "b0aa963e-fcb6-438f-93d3-5e6ed233c43f",
      "createdDateTime": "2019-01-04T00:52:39.4540895+00:00",
      "actionType": "TEXT",
      "payload": "{\"json\":{\"kind\":\"value\",\"document\":{\"kind\":\"document\",\"data\":{},\"nodes\":[{\"kind\":\"block\",\"type\":\"line\",\"isVoid\":false,\"data\":{},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"Hey \",\"marks\":[]}]},{\"kind\":\"inline\",\"type\":\"mention-inline-node\",\"isVoid\":false,\"data\":{\"completed\":true,\"option\":{\"id\":\"404f9cd3-46ec-4924-9324-226db8823a9b\",\"name\":\"name\"}},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"$name\",\"marks\":[]}]}]},{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"\",\"marks\":[]}]}]}]}}}",
      "isTerminal": true,
      "requiredEntitiesFromPayload": [
        "404f9cd3-46ec-4924-9324-226db8823a9b"
      ],
      "requiredEntities": [
        "404f9cd3-46ec-4924-9324-226db8823a9b"
      ],
      "negativeEntities": [
        "f823b377-e2a3-4352-a9ce-ab0021e5e04f",
        "5848b1fb-c443-4b92-841d-ba96f0e8c7b3"
      ]
    },
    {
      "actionId": "3fcee609-770b-46af-b9d8-d938c3a0cc5d",
      "createdDateTime": "2019-01-04T00:52:39.4540895+00:00",
      "actionType": "TEXT",
      "payload": "{\"json\":{\"kind\":\"value\",\"document\":{\"kind\":\"document\",\"data\":{},\"nodes\":[{\"kind\":\"block\",\"type\":\"line\",\"isVoid\":false,\"data\":{},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"Hey \",\"marks\":[]}]},{\"kind\":\"inline\",\"type\":\"mention-inline-node\",\"isVoid\":false,\"data\":{\"completed\":true,\"option\":{\"id\":\"404f9cd3-46ec-4924-9324-226db8823a9b\",\"name\":\"name\"}},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"$name\",\"marks\":[]}]}]},{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\", what do you really want?\",\"marks\":[]}]}]}]}}}",
      "isTerminal": true,
      "requiredEntitiesFromPayload": [
        "404f9cd3-46ec-4924-9324-226db8823a9b"
      ],
      "requiredEntities": [
        "404f9cd3-46ec-4924-9324-226db8823a9b"
      ],
      "negativeEntities": [
        "5848b1fb-c443-4b92-841d-ba96f0e8c7b3",
        "f823b377-e2a3-4352-a9ce-ab0021e5e04f"
      ],
      "suggestedEntity": "5848b1fb-c443-4b92-841d-ba96f0e8c7b3"
    },
    {
      "actionId": "f164a42c-6887-402e-9196-0af0028e5ac4",
      "createdDateTime": "2019-01-04T00:52:39.4540895+00:00",
      "actionType": "TEXT",
      "payload": "{\"json\":{\"kind\":\"value\",\"document\":{\"kind\":\"document\",\"data\":{},\"nodes\":[{\"kind\":\"block\",\"type\":\"line\",\"isVoid\":false,\"data\":{},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"Sorry \",\"marks\":[]}]},{\"kind\":\"inline\",\"type\":\"mention-inline-node\",\"isVoid\":false,\"data\":{\"completed\":true,\"option\":{\"id\":\"404f9cd3-46ec-4924-9324-226db8823a9b\",\"name\":\"name\"}},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"$name\",\"marks\":[]}]}]},{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\", I can't help you get \",\"marks\":[]}]},{\"kind\":\"inline\",\"type\":\"mention-inline-node\",\"isVoid\":false,\"data\":{\"completed\":true,\"option\":{\"id\":\"5848b1fb-c443-4b92-841d-ba96f0e8c7b3\",\"name\":\"want\"}},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"$want\",\"marks\":[]}]}]},{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"\",\"marks\":[]}]}]}]}}}",
      "isTerminal": true,
      "requiredEntitiesFromPayload": [
        "404f9cd3-46ec-4924-9324-226db8823a9b",
        "5848b1fb-c443-4b92-841d-ba96f0e8c7b3"
      ],
      "requiredEntities": [
        "404f9cd3-46ec-4924-9324-226db8823a9b",
        "5848b1fb-c443-4b92-841d-ba96f0e8c7b3"
      ],
      "negativeEntities": []
    }
  ],
  "entities": [
    {
      "entityId": "404f9cd3-46ec-4924-9324-226db8823a9b",
      "createdDateTime": "2019-01-04T00:52:39.4540895+00:00",
      "entityName": "name",
      "entityType": "LUIS",
      "isMultivalue": false,
      "isNegatible": false,
      "resolverType": "none"
    },
    {
      "entityId": "5848b1fb-c443-4b92-841d-ba96f0e8c7b3",
      "createdDateTime": "2019-01-04T00:52:39.4540895+00:00",
      "entityName": "want",
      "entityType": "LUIS",
      "isMultivalue": false,
      "isNegatible": false,
      "resolverType": "none"
    },
    {
      "entityId": "f823b377-e2a3-4352-a9ce-ab0021e5e04f",
      "createdDateTime": "2019-01-04T00:52:39.4540895+00:00",
      "entityName": "sweets",
      "entityType": "LUIS",
      "isMultivalue": false,
      "isNegatible": false,
      "resolverType": "none"
    }
  ],
  "packageId": "67a2ff9f-710b-428e-9738-b0cd80d65d46"
}