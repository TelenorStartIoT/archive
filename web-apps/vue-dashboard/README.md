# Vue Dashboard
> Originally developed in cooperation with Novamar AS.

This is a fully featured Managed IoT Cloud dashboard written in Vue.js with a widget system for easily adding custom widgets.

# Before Deployment
Make sure to configure `MIC_ROOT_DOMAIN` in `src/config.js` to your desired domain. The dashboard will be constrained within this domain and all its sub-domains. Trying to login with a user not within this domain will obviously fail.


# Writing a Widget
Widgets are easy to write. Just add a new Vue Single File Component and place it in `src/components/widget`.

## Requirements and Configuration
Each component must utilize the 'widget' mixin. This mixin plugs into the Vuex store and exposes computed variables that are updated live. `widgetOptions` contains type definitions of widget options (SELECT, VALUE etc.).

```javascript
import { widget, widgetOptions } from '@/global/mixin'
export default {
  mixins: [ widget ]
}
```

## Exposed Computed Properties
this.**shadow** - An AWS IoT shadows object with the following format:

```javascript
<thingName>: {
  delta: Object,
  desired: Object,
  reported: Object
}
```

this.**resources** - An Array of resources for each data source:

```javascript
[
  {
    desired: value | null,
    reported: value | null,
    resourceName: String,
    thingName: String,
    thingType: String
  },
  ...
]
```

this.**observations** - An Array of observations for each data source. The `observations` widgetConfig must be true (see below):

```javascript
[
  {
    resourceName: String,
    thingName: String,
    thingType: String,
    data: [
      {
        value: <value>,
        timestamp: <unix timestamp>
      },
      ...
    ]
  }
]
```

this.**options** - An object containing values for each `widgetConfig.options` defined below. The property name is the `id` specified for the current `widgetConfig` option.

## Configuration
A data object called 'widgetConfig' must be defined with the following properties:

```javascript
widgetConfig: {
  type: String,               // The widget type name. Must be the name of the single file Vue component.
  label: String,              // The UI display label of the type. This value is shown in the select.
  description: String,        // Longer, free-text description of what this widget does.
  things: {                   // Data source options. Example of configurations:
                              //    (min: 1, max: 3) can have 1, 2 or 3 data sources.
                              //    (max: 3) can have 1, 2 or 3 data sources.
                              //    (min: 2) can have 2, 3, ..., Infinity data sources.
                              //    (min 4, max 4) must have 4 data sources.
    min: Number,              // Minimum number of allowed data sources (optional).
    max: Number               // Maximum number of allowed data sources (optional).
  },
  observations: Boolean,      // If true, each data source will be fetched as an observation.
  options: [
    {
      type: widgetOptions.<TYPE>, // Type definition.
      id: String,                 // ID of option that will become a variable name in this component.
      label: String,              // Label displayed to the user.
      default: Value              // The option value.
    }
  ]
}
```

### Special Widget Options
If the widget option `aggregated` option is supplied and set to true, the fetched observation data will be aggregated.

If the widget option `live` option is supplied and set to true, any new data will be appended to the observed data.
