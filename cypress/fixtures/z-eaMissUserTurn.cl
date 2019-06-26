{
  "trainDialogs": [
    {
      "tags": [],
      "description": "",
      "trainDialogId": "c3805ca7-dd2d-4880-bd5e-790de95fd2b7",
      "rounds": [
        {
          "extractorStep": {
            "textVariations": [
              {
                "text": "My entity: XXYYZZ",
                "labelEntities": [
                  {
                    "entityId": "ff31242c-2956-4825-a0b2-c1fa2dbe3670",
                    "startCharIndex": 11,
                    "endCharIndex": 16,
                    "entityText": "XXYYZZ",
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
                    "entityId": "ff31242c-2956-4825-a0b2-c1fa2dbe3670",
                    "values": [
                      {
                        "userText": "XXYYZZ",
                        "displayText": "XXYYZZ",
                        "builtinType": "LUIS",
                        "resolution": {}
                      }
                    ]
                  }
                ],
                "context": {},
                "maskedActions": []
              },
              "labelAction": "2861f35c-f95d-42aa-ba11-aad48c78747f",
              "metrics": {
                "predictMetrics": {
                  "blisTime": 0.012062311172485351,
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
      "createdDateTime": "2019-06-26T20:32:27.6123399+00:00",
      "lastModifiedDateTime": "2019-06-26T20:33:07+00:00"
    },
    {
      "tags": [],
      "description": "",
      "trainDialogId": "338b9d3f-b648-478b-87bb-07aaa4f40820",
      "rounds": [
        {
          "extractorStep": {
            "textVariations": [
              {
                "text": "Delete this one",
                "labelEntities": [
                  {
                    "entityId": "ff31242c-2956-4825-a0b2-c1fa2dbe3670",
                    "startCharIndex": 12,
                    "endCharIndex": 14,
                    "entityText": "one",
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
                    "entityId": "ff31242c-2956-4825-a0b2-c1fa2dbe3670",
                    "values": [
                      {
                        "userText": "one",
                        "displayText": "one",
                        "builtinType": "LUIS",
                        "resolution": {}
                      }
                    ]
                  }
                ],
                "context": {},
                "maskedActions": []
              },
              "labelAction": "2861f35c-f95d-42aa-ba11-aad48c78747f",
              "metrics": {
                "predictMetrics": null
              }
            }
          ]
        }
      ],
      "clientData": {
        "importHashes": []
      },
      "initialFilledEntities": [],
      "createdDateTime": "2019-06-26T20:33:09.3421461+00:00",
      "lastModifiedDateTime": "2019-06-26T20:33:25+00:00"
    }
  ],
  "actions": [
    {
      "actionId": "2861f35c-f95d-42aa-ba11-aad48c78747f",
      "createdDateTime": "2019-06-26T20:32:27.612293+00:00",
      "actionType": "TEXT",
      "payload": "{\"json\":{\"kind\":\"value\",\"document\":{\"kind\":\"document\",\"data\":{},\"nodes\":[{\"kind\":\"block\",\"type\":\"line\",\"isVoid\":false,\"data\":{},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"Your entity contains: \",\"marks\":[]}]},{\"kind\":\"inline\",\"type\":\"mention-inline-node\",\"isVoid\":false,\"data\":{\"completed\":true,\"option\":{\"id\":\"ff31242c-2956-4825-a0b2-c1fa2dbe3670\",\"name\":\"entity\"}},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"$entity\",\"marks\":[]}]}]},{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"\",\"marks\":[]}]}]}]}}}",
      "isTerminal": true,
      "requiredEntitiesFromPayload": [
        "ff31242c-2956-4825-a0b2-c1fa2dbe3670"
      ],
      "requiredEntities": [
        "ff31242c-2956-4825-a0b2-c1fa2dbe3670"
      ],
      "negativeEntities": [],
      "requiredConditions": [],
      "negativeConditions": [],
      "clientData": {
        "importHashes": []
      }
    },
    {
      "actionId": "7182a7b1-3e12-4941-86d9-b66df6b27943",
      "createdDateTime": "2019-06-26T20:32:27.6123207+00:00",
      "actionType": "TEXT",
      "payload": "{\"json\":{\"kind\":\"value\",\"document\":{\"kind\":\"document\",\"data\":{},\"nodes\":[{\"kind\":\"block\",\"type\":\"line\",\"isVoid\":false,\"data\":{},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"Something extra\",\"marks\":[]}]}]}]}}}",
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
      "entityId": "ff31242c-2956-4825-a0b2-c1fa2dbe3670",
      "createdDateTime": "2019-06-26T20:32:27.6122618+00:00",
      "entityName": "entity",
      "entityType": "LUIS",
      "isMultivalue": false,
      "isNegatible": false,
      "resolverType": "none"
    }
  ],
  "packageId": "42d8acbf-8f10-4ccb-9fe2-f0577b4cff3b"
}