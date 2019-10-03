<template lang="pug">
#view-rule-editor
  .text-xs-left
    v-btn(icon @click="$router.push({ name: 'rules' })")
      v-icon arrow_back

  .headline(v-if="isEditing === true") Edit Rule: {{ model.name }}
  .headline(v-if="isEditing === false") Create Rule
  v-stepper(
    :dark="AppTheme === 'dark'"
    v-model="el"
    alt-labels
  )
    v-progress-linear.ma-0(
      value="100"
      height="2"
      color="primary"
      :indeterminate="loading"
      v-if="loading"
    )

    v-stepper-header
      v-stepper-step(
        :complete="el > 1"
        :rules="[() => !(validStep1 === false && el >= 1)]"
        editable
        step="1"
      ) Choose Source
      v-divider
      v-stepper-step(
        :complete="el > 2"
        :rules="[() => !(validStep2 === false && el >= 2)]"
        :editable="validStep1"
        step="2"
      ) Set Rule
      v-divider
      v-stepper-step(
        :rules="[() => !(validStep3 === false && el >= 3)]"
        :editable="validStep1 && validStep2"
        step="3"
      ) Pick Action

    v-stepper-items(:class="{ 'hidden' : loading }")

      //- Source
      v-stepper-content(step="1")
        v-container(fluid)

          //- Name, description & filter
          re-source(
            :name.sync="model.name"
            :description.sync="model.description"
            :filter.sync="model.filter"
            :valid.sync="validSource"
            :loading="loading"
          )

        .text-xs-right
          v-btn(
            flat color="primary"
            :disabled="!validStep1"
            @click="el = 2"
          ) Next

      //- Rule
      v-stepper-content(step="2")
        v-container(fluid)

          //- Rule type toggle
          re-toggle(
            :category.sync="model.category"
            :is-ref.sync="isRef"
            :enabled.sync="model.enabled"
            :is-enabled="isEnabled"
            :loading="loading"
          )

          //- When
          re-when(
            :expression.sync="model.expression"
            :filter="model.filter"
            :resources="resources"
            :is-ref="isRef"
            :valid.sync="validWhen"
            :loading="loading"
          )

          //- And
          re-and(
            :count.sync="model.threshold.count"
            :valid.sync="validAnd"
            :loading="loading"
          )

          //- Then
          re-then.mt-5(
            :interval.sync="model.threshold.interval"
            :valid.sync="validThen"
            :loading="loading"
          )

        .text-xs-right
          v-btn(
            flat color="primary"
            :disabled="!validStep1 || !validStep2"
            @click="el = 3"
          ) Next

      //- Action
      v-stepper-content(step="3")
        v-container(fluid)

          //- Event Action
          re-event-action(
            :actions.sync="model.actions"
            :valid.sync="validEventAction"
            :is-ref="isRef"
            :loading="loading"
          )

          //- Actions
          re-actions(
            :actions.sync="model.actions"
            :resources="resources"
            :valid.sync="validActions"
            :loading="loading"
          )

        .text-xs-right
          v-btn(
            flat color="primary"
            :disabled="!validStep1 || !validStep2 || !validStep3"
            @click="submit"
          ) Submit
</template>

<script>
import ReSource from '@/components/re/Source'
import ReToggle from '@/components/re/Toggle'
import ReWhen from '@/components/re/When'
import ReAnd from '@/components/re/And'
import ReThen from '@/components/re/Then'
import ReEventAction from '@/components/re/EventAction'
import ReActions from '@/components/re/Actions'
import UiCard from '@/components/UiCard'
import { RULE } from '@/global/models'
import { cloneDeep } from 'lodash'

export default {
  name: 'RuleEditor',
  components: {
    UiCard,
    ReSource,
    ReToggle,
    ReWhen,
    ReAnd,
    ReThen,
    ReEventAction,
    ReActions
  },
  data: () => ({
    validSource: false,
    validWhen: false,
    validAnd: false,
    validThen: false,
    validEventAction: false,
    validActions: false,
    isRef: null,
    isEnabled: true,
    resources: [],

    rules: RULE.rules,
    model: RULE.model,
    loading: true,
    ruleId: null,
    rule: null,
    el: null
  }),
  computed: {
    validStep1 () {
      return this.validSource
    },
    validStep2 () {
      return (this.validWhen && this.validAnd && this.validThen)
    },
    validStep3 () {
      return (this.validEventAction && this.validActions)
    },
    isEditing () {
      return (this.ruleId !== 'new' && this.ruleId !== null)
    }
  },
  watch: {
    // Applies to direct load
    SettingsRules (value) {
      if (value === null || this.isEditing === false) {
        return
      }

      // Didn't find rule
      const rule = value.find(r => r.id === this.ruleId)
      if (value.length > 0 && typeof rule === 'undefined') {
        this.$router.push({ name: 'rules' })

      // Found rule
      } else {
        this.initRule(rule)
      }
    },
    'model.filter.thingType': {
      handler: async function (thingType) {
        try {
          if (thingType !== null) {
            this.resources = await this.$store.dispatch('Boards/findResources', thingType)
          }
        } catch (e) {
          this.showSnackbar(e)
        }
      },
      deep: true
    }
  },
  methods: {
    async submit () {
      this.el = 3

      this.loading = true
      try {
        // Set category and stringify if neccessary
        if (this.isRef === true) {
          this.model.expression.map(exp => {
            exp.value = JSON.stringify(exp.value)
          })
        }

        // Convert emails array to string if neccessary
        this.model.actions
          .filter(a => a.type === 'EMAIL')
          .map(a => a.config.toAddresses = a.config.toAddresses.join(','))

        // Remove thingNames from filter if list is empty
        if (this.model.filter.hasOwnProperty('thingNames')) {
          if (this.model.filter.thingNames.length === 0) {
            delete this.model.filter.thingNames
          }
        }

        if (this.isEditing === true) {
          await this.$store.dispatch('Settings/updateRule', this.model)

        // Submit new rule
        } else {
          // Filter away invalid data
          delete this.model.id

          await this.$store.dispatch('Settings/createRule', this.model)
        }

        await this.$store.dispatch('Settings/loadRules')
        this.loading = false
        this.$router.push({ name: 'rules' })
      } catch (e) {
        this.loading = false
        this.showSnackbar(e)
      }
    },
    async initParams (params) {
      try {
        this.ruleId = params.ruleId

        // Init new clean rule
        if (this.isEditing === false) {
          this.initRule()
          return
        }

        // Editing existing rule
        if (this.SettingsRules !== null) {
          const rule = this.SettingsRules.find(r => r.id === this.ruleId)
          if (rule !== 'undefined') {
            this.initRule(rule)
          }
        }
      } catch (e) {
        this.$router.push({ name: 'rules' })
      }
    },
    async initRule (rule = null) {
      try {
        // Editing existing rule
        if (rule !== null) {
          this.model = Object.assign(RULE.model, cloneDeep(rule))
          this.isEnabled = this.model.enabled

          // Refrule fix
          this.isRef = (this.model.category === 'REFRULE_DISABLED' || this.model.category === 'REFRULE_ENABLED')
          if (this.isRef === true) {
            // Enforce schema types
            for (let exp of this.model.expression) {
              for (let v of exp.value) {
                v.filter.thingType = String(v.filter.thingType)
              }
            }
            this.isEnabled = (this.model.category === 'REFRULE_DISABLED') ? false : true
          }

        // Adding new rule, prefill necessary fields
        } else {
          this.isRef = false
          this.model = Object.assign(RULE.model, cloneDeep(rule))
          this.model.enabled = true
          this.model.category = 'UNCATEGORIZED'
          this.model.expression = []
          this.model.actions = []
          /*this.model.filter = {
            thingType: null,
            domain: null
          }*/
          this.model.threshold = {
            count: 1,
            interval: 0
          }
          this.isEnabled = this.model.enabled
        }

        await this.$store.dispatch('ThingTypes/loadThingTypes')
        this.loading = false
      } catch (e) {
        throw e
      }
    }
  },
  async mounted () {
    this.initParams(this.$route.params)
  }
}
</script>

<style lang="stylus">
@import '../../../assets/styles/domain-padding'

#view-rule-editor
  .v-stepper__header
    box-shadow: none !important
    -webkit-box-shadow: none !important
  
  .hidden
    visibility hidden

  .v-stepper
    .dim
      background #ededed
      border-left 4px solid var(--primary-color)
    .bl
      border-left 5px solid #FFF
    .br
      border-right 5px solid #FFF
    .bl, .br
      padding 10px 20px
    .center
      text-align center
      input
        font-size 25px
        text-align center !important

    &.theme--dark
      .dim
        background #424242
      .bl, .br
        border-color #333
</style>
