<template lang="pug">
v-layout(row wrap)
  v-flex.mb-1(
    v-for="(action, index) in localActions"
    v-if="action.type !== 'EVENT'"
    :key="index"
    xs12
  )
    v-layout.dim(row wrap align-center)
      v-flex.text-xs-center.pa-4(xs2)
        v-select(
          v-model="action.type"
          @change="changeAction(index)"
          :items="actionTypeOptions"
          :disabled="loading"
          dense required
        )
      v-flex.bl.br(xs9)

        //- EMAIL
        v-layout(
          v-if="action.type === 'EMAIL'"
          row wrap
        )
          v-flex(xs12)
            v-select(
              v-model="action.config.toAddresses"
              :items="emailItems"
              :disabled="loading || SettingsUsers.length === 0"
              :rules="[v => !!v || 'Addresses is required']"
              label="Addresses"
              required offset-y
              multiple dense
              small-chips
            )
          v-flex(xs12)
            v-text-field(
              v-model="action.config.subject"
              :disabled="loading"
              label="Subject"
              required
              :rules="[v => !!v || 'Subject is required']"
            )
          v-flex(xs12)
            v-text-field(
              v-model="action.config.body"
              :disabled="loading"
              label="Message"
              required
              :rules="[v => !!v || 'Message is required']"
            )

        //- WEBHOOK
        v-layout(
          v-if="action.type === 'WEBHOOK'"
          row wrap
        )
          v-flex(xs12)
            v-text-field(
              v-model="action.config.uri"
              :disabled="loading"
              label="URL"
              required
              :rules="[v => !!v || 'URL is required']"
            )
          v-flex(xs2)
            v-select(
              v-model="action.config.method"
              :items="methodOptions"
              :disabled="loading"
              dense
            )
          v-flex(xs10)
            v-text-field(
              v-model="action.config.responsePath"
              :disabled="loading"
              label="Response Path"
            )
          v-flex(xs12)
            v-text-field(
              v-model="action.config.body"
              :disabled="loading"
              label="Message"
            )
          v-flex(xs12)
            v-text-field(
              v-model="action.config.authorizationHeader"
              :disabled="loading"
              label="Authorization header value"
            )
          v-flex(
            xs12
            v-for="(header, i) in action.config.additionalHeaders"
            :key="i"
          )
            v-layout(row wrap)
              v-flex(xs5)
                v-text-field(
                  v-model="header.header"
                  :disabled="loading"
                  required
                  label="Header"
                  :rules="[v => !!v || 'Header is required']"
                )
              v-flex(xs6)
                v-text-field(
                  v-model="header.value"
                  :disabled="loading"
                  required
                  label="Value"
                  :rules="[v => !!v || 'Value is required']"
                )
              v-flex.text-xs-center(xs1)
                v-btn(
                  flat icon
                  @click="action.config.additionalHeaders.splice(i, 1)"
                )
                  v-icon delete
          v-flex.text-xs-center(xs12)
            v-btn(flat @click="addHeader(action.config.additionalHeaders)")
              v-icon(left dark) add
              span Add Custom Header

        //- SET_RESOURCE
        v-layout(
          v-if="action.type === 'SET_RESOURCE'"
          row wrap
        )
          v-flex(xs12)
            v-select(
              v-model="action.config.resource"
              :disabled="loading"
              :items="resources"
              item-text="name"
              item-value="name"
              label="Resource"
              hide-details
              dense
            )
          v-flex(xs12)
            v-text-field(
              v-model="action.config.value"
              :disabled="loading"
              placeholder="Enter value or ${expression}"
            )

        //- SMS
        v-layout(
          v-if="action.type === 'SMS'"
          row wrap
        )
          v-flex(xs12)
            v-text-field(
              v-model="action.config.message"
              :disabled="loading"
              label="Message"
              required
              :rules="[v => !!v || 'Message is required']"
            )
          v-flex(xs12)
            v-select(
              v-model="action.config.addressList"
              :items="phoneItems"
              :disabled="loading || SettingsUsers.length === 0"
              :rules="[v => !!v || 'Number is required']"
              label="Number"
              required offset-y
              multiple dense
              small-chips
            )

      //- Delete Action
      v-flex.text-xs-center(xs1)
        v-btn(
          flat icon
          @click="localActions.splice(index, 1)"
        )
          v-icon delete

  //- New Action
  v-flex.text-xs-center.pa-4(xs12)
    v-btn(flat @click="addAction")
      v-icon(left dark) add
      span New Action
</template>

<script>
import { copyDeep } from '@/lib/utils'
import { cloneDeep } from 'lodash'

const ACTION_CONFIGS = {
  'EMAIL': {
    type: 'EMAIL',
    config: {
      toAddresses: [],
      body: null,
      subject: null
    }
  },
  'WEBHOOK': {
    type: 'WEBHOOK',
    config: {
      uri: null,
      method: 'POST',
      includeAllEventData: false,
      body: null,
      authorizationHeader: null,
      additionalHeaders: [],
      responsePath: null
    }
  },
  'SET_RESOURCE': {
    type: 'SET_RESOURCE',
    config: {
      resource: null,
      value: null
    }
  },
  'ADDITIONAL_HEADER': {
    header: null,
    value: null
  },
  'SMS': {
    type: 'SMS',
    config: {
      message: null,
      addressList: []
    }
  }
}

export default {
  name: 'ReActions',
  props: {
    actions: {
      type: Array,
      default: () => ([])
    },
    resources: Array,
    valid: Boolean,
    loading: Boolean
  },
  data: () => ({
    localActions: [],
    actionTypeOptions: [
      { text: 'Email', value: 'EMAIL' },
      { text: 'Webhook', value: 'WEBHOOK' },
      { text: 'Set Resource', value: 'SET_RESOURCE' },
      { text: 'SMS', value: 'SMS' }
    ],
    methodOptions: [
      { text: 'GET', value: 'GET' },
      { text: 'POST', value: 'POST' },
      { text: 'PUT', value: 'PUT' },
      { text: 'DELETE', value: 'DELETE' },
      { text: 'HEAD', value: 'HEAD' }
    ]
  }),
  computed: {
    computedValid () {
      try {
        if (this.localActions.length < 1) {
          return false
        }

        for (let action of this.localActions) {
          if (action.type === '' || action.type === null) {
            return false
          }

          if (action.type === 'EVENT') {
            continue
          }

          for (let i in action.config) {
            let config = action.config[i]
            if (config === '' || config === null) {
              return false
            }

            if (i === 'additionalHeaders') {
              for (let header of config) {
                if (header.header === '' || header.header === null ||
                    header.value === '' || header.value === null) {
                  return false
                }
              }
            }
          }
        }

        return true
      } catch (e) {
        return false
      }
    },
    phoneItems () {
      return this.SettingsUsers
        .filter(i => i.hasOwnProperty('phone'))
        .map(i => {
          const phone = i.phone.replace('+', '')
          return {
            text: `${i.firstName} ${i.lastName} (${phone})`,
            value: phone
          }
        })
    },
    emailItems () {
      return this.SettingsUsers
        .filter(i => i.hasOwnProperty('email'))
        .map(i => {
          return {
            text: `${i.firstName} ${i.lastName} (${i.email})`,
            value: i.email
          }
        })
    }
  },
  watch: {
    actions: {
      handler: function (value) {
        this.localActions = value
        this.$emit('update:valid', this.computedValid)
      },
      deep: true
    }
  },
  methods: {
    addAction () {
      this.localActions.push(copyDeep(ACTION_CONFIGS['WEBHOOK']))
    },
    addHeader (additionalHeaders) {
      additionalHeaders.push(copyDeep(ACTION_CONFIGS['ADDITIONAL_HEADER']))
    },
    changeAction (index) {
      const type = this.localActions[index].type
      this.localActions[index] = Object.assign({}, copyDeep(ACTION_CONFIGS[type]))
      this.localActions = cloneDeep(this.localActions)
      //this.onActionsChange()
      this.$emit('update:actions', this.localActions)
    }
  }
}
</script>
