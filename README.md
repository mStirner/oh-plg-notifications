# Introduction
Allows to send notfication based on endpoint state value changes<br />

# Configuration
To enable this plugins, add labels on the endpoint you want to react upon:
```
notifications.enabled=true
notifications.target[]={"state": <state id>, "threshold": <threshold value>, "operator": <operator>}
```

Example:
```json
{
    "_id": "67c9658596013bcea8a778e0",
    "name": "Particlesensor",
    "device": "67c9658596013bcea8a778df",
    "icon": "fa-solid fa-gauge-high",
    "states": [
        {
            "name": "Particles (µg/m³)",
            "alias": "particles",
            "type": "number",
            "min": 0,
            "max": 25000,
            "_id": "67c9658596013bcea8a778e1",
            "description": null,
            "value": 12,
            "invert": false,
            "timestamps": {
                "created": 1741251973301,
                "updated": 1741255942266
            }
        }
    ],
    "labels": [
        ....
        "notifications.enabled=true",
        "notifications.target[]={\"state\":\"67c9658596013bcea8a778e1\", \"threshold\": 50, \"operator\": \"<=\"}"
    ],
    "timestamps": {
        "created": 1741251973287,
        "updated": 1741255942368
    },
    "enabled": true,
    "room": null,
    "commands": []
}
```

Operator values can be `<`, `<=`, `>`, `>=`, `==`.<br />
Where `a < b`, `a >= b` is `a` = state value, `b` threshold value.

The example above, triggers a notifiction when the state values drop below or is equal to 50. `<value> <= <threshold>`, `12 <= 50`.

# Installation
1) Create a new plugin over the OpenHaus backend HTTP API
2) Mount the plugin source code folder into the backend
3) run `npm install`

# Development
Add plugin item via HTTP API:<br />
[PUT] `http://{{HOST}}:{{PORT}}/api/plugins/`
```json
{
   "name":"Notifications",
   "version": "1.0.0",
   "intents":[
      "endpoints"
   ],
   "uuid": "a4cbb9bc-0cef-4fa2-902c-d4dfa3a3f7e7"
}
```

Mount the source code into the backend plugins folder
```sh
sudo mount --bind ~/projects/OpenHaus/plugins/oh-plg-notifications/ ~/projects/OpenHaus/backend/plugins/a4cbb9bc-0cef-4fa2-902c-d4dfa3a3f7e7/
```
