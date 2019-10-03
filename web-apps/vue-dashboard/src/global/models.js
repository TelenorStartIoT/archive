/* eslint-disable */
import { createModel } from '@/lib/utils'

export const USER = {
  rules: {
    userName: [
      v => !!v || 'Username is required',
      v => (v && v.length >= 3) || 'Username needs to be at least 3 characters long'
    ],
    firstName:        [v => !!v || 'First name is required'],
    lastName:         [v => !!v || 'Last name is required'],
    email: [
      v => !!v || 'E-mail is required',
      v => /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v) || 'E-mail must be valid'
    ],
    enabled:          [v => typeof v !== 'boolean' || 'Enabled must be valid'],
    phone:            [],
    locale:           [v => /^[a-z]{1}-[A-Z]{1}$/.test(v) || 'Locale must be valid'],
    company:          [],
    address:          [],
    zip:              [],
    country:          [],
    city:             [],
    roleName:         [v => /^(Read|ReadWrite)$/.test(v) || 'Role name must be valid'],
    domainName:       [v => !!v || 'Domain name is required'],
    data:             []
  }
}

export const DOMAIN = {
  rules: {
    id:               [v => !!v || 'Domain ID is required'],
    parentId:         [v => !!v || 'Parent domain ID is required'],
    name:             [v => !!v || 'Domain name is required'],
    description:      [],
    data: {
      company:        [v => !!v || 'Company name is required'],
      vat:            [v => !!v || 'VAT number is required'],
      contactPerson:  [v => !!v || 'Contact person is required'],
      address:        [v => !!v || 'Address is required'],
      city:           [v => !!v || 'City is required'],
      zip:            [v => !!v || 'ZIP code is required']
    }
  }
}

export const RULE = {
  rules: {
    id:               [v => !!v || 'Rule ID is required'],
    name:             [v => !!v || 'Rule name is required'],
    category:         [],
    description:      [],
    enabled:          [v => !!v || 'Enabled status is required'],
    filter: {
      domain:         [v => !!v || 'Domain is required'],
      thingType:      [v => !!v || 'Thing Type is required']
      // thingNames:     [],
    },
    expression:       [v => !!v || 'Expression is required'],
    actions:          [v => !!v || 'Actions are required'],
    threshold:        [],
  }
}

export const BOARD = {
  rules: {
    id:               [v => !!v || 'Domain ID is required'],
    keyPath:          [],
    item: {
      description:    [],
      label:          [v => !!v || 'Label is required'],
      timestamp:      [],
      thingWidgets:   {}
    }
  }
}

export const THING_TYPE = {
  rules: {
    label:            [v => !!v || 'Label is required'],
    domain:           [v => !!v || 'Domain name is required'],
    description:      [],
    data: {
      uplink:         [],
      downlink:       []
    }
  }
}

export const THING = {
  rules: {
    thingName:        [],
    label:            [v => !!v || 'Thing label is required'],
    thingType:        [v => !!v || 'Thing Type is required'],
    domain:           [v => !!v || 'Domain name is required'],
    externalId:       [],
    description:      [],
  }
}

export const WIDGET = {
  rules: {
    id:               [],
    // domain:           [v => !!v || 'Domain name is required'],
    layout:           [v => !!v || 'Layout is required'],
    label:            [v => !!v || 'Label is required'],
    type:             [v => !!v || 'Type is required'],
    things:           [v => !!v || 'Thing names are required'],
    observations:     [],
    options:          []
  }
}

/* Define 'model' getter to each object.
 * We do it this way since a getter on the object
 * itself is defined as:
 *
 *      get model () {}
 *
 * We cannot assign a separate function to it if we
 * use the above syntax.
 */
Object.defineProperty(USER,        'model', { get: createModel })
Object.defineProperty(DOMAIN,      'model', { get: createModel })
Object.defineProperty(RULE,        'model', { get: createModel })
Object.defineProperty(BOARD,       'model', { get: createModel })
Object.defineProperty(THING_TYPE,  'model', { get: createModel })
Object.defineProperty(THING,       'model', { get: createModel })
Object.defineProperty(WIDGET,      'model', { get: createModel })
