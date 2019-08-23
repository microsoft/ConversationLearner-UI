{
  "trainDialogs": [
    {
      "tags": [],
      "description": "",
      "trainDialogId": "ee423847-6b4b-4f90-8db6-44ce8ab5789e",
      "rounds": [
        {
          "extractorStep": {
            "textVariations": [
              {
                "text": "My foot is dirty.",
                "labelEntities": [
                  {
                    "entityId": "ee6101ca-aa80-4c0e-847b-6c793c1a703e",
                    "startCharIndex": 11,
                    "endCharIndex": 15,
                    "entityText": "dirty",
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
                    "entityId": "ee6101ca-aa80-4c0e-847b-6c793c1a703e",
                    "values": [
                      {
                        "userText": "dirty",
                        "displayText": "dirty",
                        "builtinType": "LUIS",
                        "resolution": {}
                      }
                    ]
                  }
                ],
                "context": {},
                "maskedActions": []
              },
              "labelAction": "ff23a0a8-d68a-4703-b624-26c331757b39",
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
      "createdDateTime": "2019-08-23T01:15:07.654609+00:00",
      "lastModifiedDateTime": "2019-08-23T01:15:07+00:00"
    }
  ],
  "actions": [
    {
      "actionId": "3fa39598-3b3d-455c-b051-db21cd055063",
      "createdDateTime": "2019-08-23T01:15:07.6545172+00:00",
      "actionType": "TEXT",
      "payload": "{\"json\":{\"kind\":\"value\",\"document\":{\"kind\":\"document\",\"data\":{},\"nodes\":[{\"kind\":\"block\",\"type\":\"line\",\"isVoid\":false,\"data\":{},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"I don't know what to say.\",\"marks\":[]}]}]}]}}}",
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
      "actionId": "ff23a0a8-d68a-4703-b624-26c331757b39",
      "createdDateTime": "2019-08-23T01:15:07.6545784+00:00",
      "actionType": "TEXT",
      "payload": "{\"json\":{\"kind\":\"value\",\"document\":{\"kind\":\"document\",\"data\":{},\"nodes\":[{\"kind\":\"block\",\"type\":\"line\",\"isVoid\":false,\"data\":{},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"Your foot is \",\"marks\":[]}]},{\"kind\":\"inline\",\"type\":\"mention-inline-node\",\"isVoid\":false,\"data\":{\"completed\":true,\"option\":{\"id\":\"ee6101ca-aa80-4c0e-847b-6c793c1a703e\",\"name\":\"conditionOfFoot\"}},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"$conditionOfFoot\",\"marks\":[]}]}]},{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\".\",\"marks\":[]}]}]}]}}}",
      "isTerminal": true,
      "requiredEntitiesFromPayload": [
        "ee6101ca-aa80-4c0e-847b-6c793c1a703e"
      ],
      "requiredEntities": [
        "ee6101ca-aa80-4c0e-847b-6c793c1a703e"
      ],
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
      "entityId": "ee6101ca-aa80-4c0e-847b-6c793c1a703e",
      "createdDateTime": "2019-08-23T01:15:07.6544059+00:00",
      "entityName": "conditionOfFoot",
      "entityType": "LUIS",
      "isMultivalue": false,
      "isNegatible": false,
      "resolverType": "none"
    }
  ],
  "packageId": "46e6c738-3ff1-47b3-9a39-6be7289a5626"
}