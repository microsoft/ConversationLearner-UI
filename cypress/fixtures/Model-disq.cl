{
  "trainDialogs": [],
  "actions": [
    {
      "actionId": "27d60614-92a5-495f-9a62-1ac1f42aa8a0",
      "createdDateTime": "2018-10-18T00:14:42.5011632+00:00",
      "actionType": "TEXT",
      "payload": "{\"json\":{\"kind\":\"value\",\"document\":{\"kind\":\"document\",\"data\":{},\"nodes\":[{\"kind\":\"block\",\"type\":\"line\",\"isVoid\":false,\"data\":{},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"What's your name?\",\"marks\":[]}]}]}]}}}",
      "isTerminal": true,
      "requiredEntitiesFromPayload": [],
      "requiredEntities": [],
      "negativeEntities": [
        "4d975bfc-2f88-4c1a-8404-32b054303e8a"
      ],
      "suggestedEntity": "4d975bfc-2f88-4c1a-8404-32b054303e8a"
    },
    {
      "actionId": "e00ccbd2-f754-48e5-ae97-a899d45a96be",
      "createdDateTime": "2018-10-18T00:14:52.7880159+00:00",
      "actionType": "TEXT",
      "payload": "{\"json\":{\"kind\":\"value\",\"document\":{\"kind\":\"document\",\"data\":{},\"nodes\":[{\"kind\":\"block\",\"type\":\"line\",\"isVoid\":false,\"data\":{},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"Hey \",\"marks\":[]}]},{\"kind\":\"inline\",\"type\":\"mention-inline-node\",\"isVoid\":false,\"data\":{\"completed\":true,\"option\":{\"id\":\"4d975bfc-2f88-4c1a-8404-32b054303e8a\",\"name\":\"name\"}},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"$name\",\"marks\":[]}]}]},{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"\",\"marks\":[]}]}]}]}}}",
      "isTerminal": true,
      "requiredEntitiesFromPayload": [
        "4d975bfc-2f88-4c1a-8404-32b054303e8a"
      ],
      "requiredEntities": [
        "4d975bfc-2f88-4c1a-8404-32b054303e8a"
      ],
      "negativeEntities": [
        "9a3e3d7b-0c65-475a-9c96-a1f79791b051",
        "6fbd62be-17ee-44c6-b86a-c307a946db5b"
      ]
    },
    {
      "actionId": "201265d8-ea0d-49ca-95d5-5209458d4a87",
      "createdDateTime": "2018-10-18T00:15:06.4782921+00:00",
      "actionType": "TEXT",
      "payload": "{\"json\":{\"kind\":\"value\",\"document\":{\"kind\":\"document\",\"data\":{},\"nodes\":[{\"kind\":\"block\",\"type\":\"line\",\"isVoid\":false,\"data\":{},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"Hey \",\"marks\":[]}]},{\"kind\":\"inline\",\"type\":\"mention-inline-node\",\"isVoid\":false,\"data\":{\"completed\":true,\"option\":{\"id\":\"4d975bfc-2f88-4c1a-8404-32b054303e8a\",\"name\":\"name\"}},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"$name\",\"marks\":[]}]}]},{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\", what do you really want?\",\"marks\":[]}]}]}]}}}",
      "isTerminal": true,
      "requiredEntitiesFromPayload": [
        "4d975bfc-2f88-4c1a-8404-32b054303e8a"
      ],
      "requiredEntities": [
        "4d975bfc-2f88-4c1a-8404-32b054303e8a"
      ],
      "negativeEntities": [
        "6fbd62be-17ee-44c6-b86a-c307a946db5b",
        "9a3e3d7b-0c65-475a-9c96-a1f79791b051"
      ],
      "suggestedEntity": "6fbd62be-17ee-44c6-b86a-c307a946db5b"
    },
    {
      "actionId": "14183779-5de7-4701-b03d-41c416c4facc",
      "createdDateTime": "2018-10-18T00:15:15.430688+00:00",
      "actionType": "TEXT",
      "payload": "{\"json\":{\"kind\":\"value\",\"document\":{\"kind\":\"document\",\"data\":{},\"nodes\":[{\"kind\":\"block\",\"type\":\"line\",\"isVoid\":false,\"data\":{},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"Sorry \",\"marks\":[]}]},{\"kind\":\"inline\",\"type\":\"mention-inline-node\",\"isVoid\":false,\"data\":{\"completed\":true,\"option\":{\"id\":\"4d975bfc-2f88-4c1a-8404-32b054303e8a\",\"name\":\"name\"}},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"$name\",\"marks\":[]}]}]},{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\", I can't help you get \",\"marks\":[]}]},{\"kind\":\"inline\",\"type\":\"mention-inline-node\",\"isVoid\":false,\"data\":{\"completed\":true,\"option\":{\"id\":\"6fbd62be-17ee-44c6-b86a-c307a946db5b\",\"name\":\"want\"}},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"$want\",\"marks\":[]}]}]},{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"\",\"marks\":[]}]}]}]}}}",
      "isTerminal": true,
      "requiredEntitiesFromPayload": [
        "4d975bfc-2f88-4c1a-8404-32b054303e8a",
        "6fbd62be-17ee-44c6-b86a-c307a946db5b"
      ],
      "requiredEntities": [
        "4d975bfc-2f88-4c1a-8404-32b054303e8a",
        "6fbd62be-17ee-44c6-b86a-c307a946db5b"
      ],
      "negativeEntities": []
    }
  ],
  "entities": [
    {
      "entityId": "4d975bfc-2f88-4c1a-8404-32b054303e8a",
      "createdDateTime": "2018-10-18T00:14:21.8282455+00:00",
      "entityName": "name",
      "entityType": "LUIS",
      "isMultivalue": false,
      "isNegatible": false
    },
    {
      "entityId": "6fbd62be-17ee-44c6-b86a-c307a946db5b",
      "createdDateTime": "2018-10-18T00:14:26.9544198+00:00",
      "entityName": "want",
      "entityType": "LUIS",
      "isMultivalue": false,
      "isNegatible": false
    },
    {
      "entityId": "9a3e3d7b-0c65-475a-9c96-a1f79791b051",
      "createdDateTime": "2018-10-18T00:14:32.0150231+00:00",
      "entityName": "sweets",
      "entityType": "LUIS",
      "isMultivalue": false,
      "isNegatible": false
    }
  ],
  "packageId": "7802b628-891a-48e3-9089-4f511b0fa6ac"
}