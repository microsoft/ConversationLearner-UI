{
  "trainDialogs": [],
  "actions": [
    {
      "actionId": "a37f46e1-fba2-4f1f-849b-9eb2ce0e1113",
      "createdDateTime": "2018-12-31T20:46:24.0087554+00:00",
      "actionType": "TEXT",
      "payload": "{\"json\":{\"kind\":\"value\",\"document\":{\"kind\":\"document\",\"data\":{},\"nodes\":[{\"kind\":\"block\",\"type\":\"line\",\"isVoid\":false,\"data\":{},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"You are leaving on \",\"marks\":[]}]},{\"kind\":\"inline\",\"type\":\"mention-inline-node\",\"isVoid\":false,\"data\":{\"completed\":true,\"option\":{\"id\":\"4a4f39b1-7596-44b7-89e4-ddd6ab58348f\",\"name\":\"departure\"}},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"$departure\",\"marks\":[]}]}]},{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\" and returning on \",\"marks\":[]}]},{\"kind\":\"inline\",\"type\":\"mention-inline-node\",\"isVoid\":false,\"data\":{\"completed\":true,\"option\":{\"id\":\"8b12551f-5cbf-4d07-b457-d5c3fbd1a925\",\"name\":\"return\"}},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"$return\",\"marks\":[]}]}]},{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"\",\"marks\":[]}]}]}]}}}",
      "isTerminal": true,
      "requiredEntitiesFromPayload": [
        "4a4f39b1-7596-44b7-89e4-ddd6ab58348f",
        "8b12551f-5cbf-4d07-b457-d5c3fbd1a925"
      ],
      "requiredEntities": [
        "4a4f39b1-7596-44b7-89e4-ddd6ab58348f",
        "8b12551f-5cbf-4d07-b457-d5c3fbd1a925"
      ],
      "negativeEntities": []
    },
    {
      "actionId": "9b261f4d-8cc8-4199-8851-97dae91f9288",
      "createdDateTime": "2018-12-31T20:46:38.1148471+00:00",
      "actionType": "TEXT",
      "payload": "{\"json\":{\"kind\":\"value\",\"document\":{\"kind\":\"document\",\"data\":{},\"nodes\":[{\"kind\":\"block\",\"type\":\"line\",\"isVoid\":false,\"data\":{},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"When are you planning to travel?\",\"marks\":[]}]}]}]}}}",
      "isTerminal": true,
      "requiredEntitiesFromPayload": [],
      "requiredEntities": [],
      "negativeEntities": [
        "4a4f39b1-7596-44b7-89e4-ddd6ab58348f",
        "8b12551f-5cbf-4d07-b457-d5c3fbd1a925"
      ]
    }
  ],
  "entities": [
    {
      "doNotMemorize": true,
      "entityId": "d64d1b02-4877-4d81-9df3-b67a0657a82d",
      "createdDateTime": "2018-12-31T20:46:01.7369411+00:00",
      "entityName": "builtin-datetimev2",
      "entityType": "datetimeV2",
      "isMultivalue": false,
      "isNegatible": false
    },
    {
      "entityId": "4a4f39b1-7596-44b7-89e4-ddd6ab58348f",
      "createdDateTime": "2018-12-31T20:46:01.6900536+00:00",
      "entityName": "departure",
      "entityType": "LUIS",
      "isMultivalue": false,
      "isNegatible": false,
      "resolverType": "datetimeV2"
    },
    {
      "entityId": "8b12551f-5cbf-4d07-b457-d5c3fbd1a925",
      "createdDateTime": "2018-12-31T20:46:09.6368416+00:00",
      "entityName": "return",
      "entityType": "LUIS",
      "isMultivalue": false,
      "isNegatible": false,
      "resolverType": "datetimeV2"
    }
  ],
  "packageId": "106fb9c2-af1f-4b66-835d-3c9ecf869318"
}