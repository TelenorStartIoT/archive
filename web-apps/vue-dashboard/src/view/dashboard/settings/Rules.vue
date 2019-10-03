<template lang="pug">
#view-rules
  delete-rule(
    :show.sync="dialogDeleteRule"
    :selected="selected"
  )

  .text-xs-right
    v-btn(
      flat
      :to="{ name: 'ruleeditor', params: { ruleId: 'new' } }"
    )
      v-icon(left dark) add
      span New Rule

  .headline Rules
  ui-card(:loading="SettingsRules === null || loading === true")
    v-card-text
      .pb-4
        v-btn(
          icon small
          absolute right
          v-if="selected.length > 0"
          @click="dialogDeleteRule = true"
        )
          v-icon delete
      v-data-table(
        v-if="SettingsRules !== null"
        :headers="headers"
        :items="SettingsRules"
        v-model="selected"
        item-key="name"
        hide-actions
      )
        template(
          slot="items"
          slot-scope="props"
        )
          td
            v-checkbox(
              @click="props.selected = !props.selected"
              :input-value="props.selected"
              primary hide-details
              v-model="props.selected"
              color="primary"
            )
          td.text-xs-left(@click="goTo(props.item.id)") {{ props.item.name }}
          td.text-xs-left {{ props.item.description }}
          td.text-xs-left
            v-switch(
              hide-details
              color="primary"
              v-model="enabled[props.index]"
              @change="toggleEnable(props.index)"
            )
</template>

<script>
import UiCard from '@/components/UiCard'
import DeleteRule from '@/components/dialog/DeleteRule'
import { cloneDeep } from 'lodash'
import * as t from '@/store/types'

export default {
  name: 'Rules',
  components: {
    UiCard,
    DeleteRule
  },
  data: () => ({
    selected: [],
    loading: false,
    headers: [
      { text: '', value: 'select', sortable: false, align: 'left' },
      { text: 'Name', value: 'rule', sortable: true, align: 'left' },
      { text: 'Description', value: 'description', sortable: true, align: 'left' },
      { text: 'Enabled', value: 'enabled', sortable: false, align: 'left' }
    ],
    dialogDeleteRule: false,
    enabled: []
  }),
  watch: {
    selected: function (val) {
      if (this.selected.length > 1) {
        this.selected = [val.pop()]
      }
    },
    SettingsRules () {
      this.initEnabled()
    }
  },
  methods: {
    goTo (ruleId) {
      this.$router.push({
        name: 'ruleeditor',
        params: {
          ruleId
        }
      })
    },
    async toggleEnable (index) {
      this.loading = true
      try {
        let payload = cloneDeep(this.SettingsRules[index])

        // Refrule
        if (payload.category === 'REFRULE_ENABLED' || payload.category === 'REFRULE_DISABLED') {
          const category = (this.enabled[index] === true) ? 'REFRULE_ENABLED' : 'REFRULE_DISABLED'
          payload.category = category
          payload.enabled = false
        } else {
          payload.enabled = this.enabled[index]
        }

        await this.$store.dispatch('Settings/updateRule', payload)
        this.$store.commit(`Settings/${t.SETTINGS_SET_RULE_ENABLED}`, payload)
        this.loading = false
      } catch (e) {
        this.loading = false
      }
    },
    initEnabled () {
      this.enabled = []

      for (let i in this.SettingsRules) {
        const rule = this.SettingsRules[i]
        const isEnabled = (rule.enabled === true ||
                           rule.category === 'REFRULE_ENABLED')
        this.enabled[i] = isEnabled
      }
    }
  },
  created () {
    this.eventBus.$on('ui:clear', () => {
      if (this.selected !== null) {
        this.selected.length = 0
      }
    })
  },
  mounted () {
    this.initEnabled()
  },
  beforeDestroy () {
    this.eventBus.$off('ui:clear')
  }
}
</script>

<style lang="stylus">
#view-rules
  .v-datatable
    th:first-child
      width 1px
    tr
      td:nth-child(2)
        cursor pointer
</style>
