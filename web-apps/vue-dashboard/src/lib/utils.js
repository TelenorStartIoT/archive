import {
  camelCase,
  cloneDeep,
  upperFirst,
  mapValues,
  isArray,
  isObject
} from 'lodash'

/* Dynamically register widget components.
 */
export const compiledWidgets = (() => {
  // eslint-disable-next-line
  const requireComponent = require.context('@/components/widget', false, /[A-Z]\w+\.(vue)$/)
  let widgetComponents = {}

  requireComponent.keys().forEach(fileName => {
    const componentConfig = requireComponent(fileName)
    const componentName = 'Widget' + upperFirst(camelCase(fileName.replace(/^\.\/(.*)\.\w+$/, '$1')))
    widgetComponents[componentName] = componentConfig.default || componentConfig
  })
  return widgetComponents
})()

/* Dynamically register widget configs.
 */
export const compiledWidgetConfigs = (() => {
  // eslint-disable-next-line
  const requireComponent = require.context('@/components/widget', false, /[A-Z]\w+\.(vue)$/)
  let widgetConfigs = []

  requireComponent.keys().forEach(fileName => {
    const componentConfig = requireComponent(fileName)
    const widgetComponent = componentConfig.default || componentConfig
    widgetConfigs.push(widgetComponent.data().widgetConfig)
  })
  return widgetConfigs
})()

export const copyDeep = o => JSON.parse(JSON.stringify(o))

/* Recursively map all props in an
 * object to a callback.
 */
export const mapDeep = (obj, cb) => {
  if (isArray(obj)) {
    return obj.map(innerObj => mapDeep(innerObj, cb))
  } else if (isObject(obj)) {
    return mapValues(obj, val => mapDeep(val, cb))
  } else {
    return cb(obj)
  }
}

/* Recursively set all props in an
 * object to a value. Use this to
 * create model out of a rules object.
 */
export const setPropDeep = (flat, val) => {
  for (let i in flat) {
    if ((typeof flat[i] === 'object') && !(Array.isArray(flat[i]))) {
      setPropDeep(flat[i], val)
      return
    } else {
      flat[i] = val
    }
  }
}

/* Create a new model object based on
 * rules object. Supports nested rules
 * object.
 */
export const createModel = function () {
  let model = cloneDeep(this.rules)
  setPropDeep(model, null)
  return model
}

/* Transform a phone number to adhere
 * MIC documentation requirements.
 */
export const transformPhone = p => {
  if (p !== null) {
    // Determine non-digit phone prefix (either '+' or empty string)
    let prefix = (p[0] === '+') ? '+' : ''
    // Remove all non-digits in string (RegExp \D)
    let stripped = p.replace(/\D/g, '')
    p = prefix + stripped
  }
}

/* Convert a domain ID to SysData format.
 * SysData format is the ThingType ID derived
 * from the domain ID.
 */
export const domain2sysdata = domain => {
  return 'sysdata-' + domain.toLowerCase().replace(/[^a-z0-9-]/g, '')
}
