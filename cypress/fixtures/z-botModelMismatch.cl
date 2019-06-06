{
  "trainDialogs": [
    {
      "tags": [],
      "description": "",
      "trainDialogId": "d11015b1-745b-4ccf-81fb-e68eb301689c",
      "rounds": [
        {
          "extractorStep": {
            "textVariations": [
              {
                "text": "Lets have that greeting.",
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
              "labelAction": "ec61fcb8-19b0-4039-9977-4ae4ee7bd503",
              "metrics": {
                "predictMetrics": {
                  "blisTime": 0.006799936294555664,
                  "contextDialogBlisTime": 0
                }
              },
              "logicResult": {
                "logicValue": null,
                "changedFilledEntities": []
              }
            }
          ]
        }
      ],
      "clientData": {
        "importHashes": []
      },
      "initialFilledEntities": [],
      "createdDateTime": "2019-06-05T02:34:56.2155698+00:00",
      "lastModifiedDateTime": "2019-06-05T02:35:24+00:00"
    }
  ],
  "actions": [
    {
      "actionId": "ec61fcb8-19b0-4039-9977-4ae4ee7bd503",
      "createdDateTime": "2019-06-05T02:22:16.6955317+00:00",
      "actionType": "API_LOCAL",
      "payload": "{\"payload\":\"RandomGreeting\",\"logicArguments\":[],\"renderArguments\":[]}",
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
      "entityId": "40360606-c080-424e-9c9e-1bc14d3cfb92",
      "createdDateTime": "2019-06-05T02:22:16.6952675+00:00",
      "entityName": "one",
      "entityType": "LUIS",
      "isMultivalue": false,
      "isNegatible": false,
      "resolverType": "none"
    }
  ],
  "packageId": "4dbfea7b-82cf-446a-bf17-443cb63a01b8"
}