{
  "trainDialogs": [],
  "actions": [
    {
      "actionId": "3959904b-7905-49e1-8e6a-7fd24d710b30",
      "createdDateTime": "2019-09-17T00:16:33.4791739+00:00",
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
      "suggestedEntity": "251fa360-def4-4a89-aa79-eb487e432f29",
      "clientData": {
        "importHashes": []
      }
    },
    {
      "actionId": "2d846a6e-113e-4302-9877-d0e0a581672b",
      "createdDateTime": "2019-09-17T00:16:33.4792299+00:00",
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
      "negativeConditions": [],
      "clientData": {
        "importHashes": []
      }
    }
  ],
  "entities": [
    {
      "entityId": "251fa360-def4-4a89-aa79-eb487e432f29",
      "createdDateTime": "2019-09-17T00:16:33.4791189+00:00",
      "entityName": "name",
      "entityType": "LUIS",
      "isMultivalue": false,
      "isNegatible": false,
      "resolverType": "none"
    },
    {
      "entityId": "b1aa8084-dc6a-4e61-a015-049eac905df9",
      "createdDateTime": "2019-09-17T00:17:05.8552378+00:00",
      "entityName": "word",
      "entityType": "LUIS",
      "isMultivalue": false,
      "isNegatible": false,
      "resolverType": "none"
    }
  ],
  "packageId": "bbc5ccd2-0e9a-4a53-b81f-8a7b5a5bc516"
}