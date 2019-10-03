<template lang="pug">
v-layout(row wrap)
  v-flex.mb-1(
    v-for="(exp, index) in localExpression"
    :key="index"
    xs12
  )
    v-layout.dim(row wrap align-center)
      v-flex.text-xs-center(xs1)
        .title(v-if="index <= 0") When
        .title(v-if="index > 0") And
      v-flex.bl(
        :xs10="index > 0"
        :xs11="index === 0"
        :class="{ 'br' : index > 0 }"
      )
        v-layout(row wrap)
          v-flex(xs12)
            v-layout(row wrap)
              v-flex(xs10)
                v-select(
                  v-model="exp.resource"
                  @input="onExpressionChange"
                  :disabled="loading"
                  :items="resources"
                  item-text="name"
                  item-value="name"
                  label="Resource"
                  hide-details
                  dense required
                  :rules="[v => !!v || 'Resource is required']"
                )
              v-flex(xs2)
                v-select(
                  v-model="exp.operator"
                  @input="onExpressionChange"
                  :items="operatorOptions"
                  :disabled="loading"
                  dense required
                )
          v-flex(xs12)

            //- UNCATEGORIZED
            v-layout(
              v-if="isRef === false"
              row wrap
            )
              v-text-field(
                v-model="exp.value"
                @input="onExpressionChange"
                :disabled="loading"
                placeholder="Enter value or ${expression}"
                required
                :rules="[v => !!v || 'Value is required']"
              )

            //- REFRULE
            v-layout(
              row wrap
              v-if="isRef === true"
              v-for="(ref, i) in exp.value"
              :key="i"
            )
              v-flex(xs4)
                v-select(
                  v-model="ref.filter.thingType"
                  @input="loadThingType($event, ref)"
                  item-text="label"
                  item-value="id"
                  :rules="rules.filter.thingType"
                  :items="ThingTypesThingTypes"
                  :disabled="loading"
                  label="Thing Type"
                  dense required
                )
                  template(
                    slot="item"
                    slot-scope="type"
                  )
                    v-list-tile-content(v-text="type.item.label")
              v-flex(xs8)
                v-select(
                  v-model="ref.filter.things"
                  @input="onExpressionChange"
                  :items="getMetadataThings(ref)"
                  :disabled="loading || getMetadataThings(ref).length === 0"
                  item-text="text"
                  item-value="value"
                  offset-y
                  label="Things"
                  multiple dense
                  small-chips clearable
                )
              v-flex(xs12)
                v-layout(
                  row wrap
                  v-for="(refExp, j) in ref.expression"
                  :key="j"
                )
                  v-flex(
                    :xs10="j === 0"
                    :xs9="j > 0"
                  )
                    v-select(
                      v-model="refExp.resource"
                      @input="onExpressionChange"
                      :items="getMetadataResources(ref)"
                      :disabled="loading || getMetadataResources(ref).length === 0"
                      item-text="name"
                      item-value="name"
                      label="Resource"
                      hide-details
                      dense required
                      :rules="[v => !!v || 'Resource is required']"
                    )
                  v-flex(xs2)
                    v-select(
                      v-model="refExp.operator"
                      @input="onExpressionChange"
                      :items="operatorOptionsRef"
                      :disabled="loading"
                      dense required
                    )
                  v-flex.text-xs-center(
                    xs1
                    v-if="j > 0"
                  )
                    v-btn(
                      flat icon
                      @click="ref.expression.splice(j, 1)"
                    )
                      v-icon delete
              v-flex.text-xs-center(xs12)
                v-btn(flat @click="addRefExp(ref.expression)")
                  v-icon(left dark) add
                  span Add Reference Expression
      v-flex.text-xs-center(xs1 v-if="index > 0")
        v-btn(
          flat icon
          @click="localExpression.splice(index, 1); onExpressionChange()"
        )
          v-icon delete
  v-flex.text-xs-center.pa-4(xs12)
    v-btn(flat @click="addCondition")
      v-icon(left dark) add
      span Condition
</template>

<script>
import { RULE } from '@/global/models'
import { copyDeep } from '@/lib/utils'
import { cloneDeep } from 'lodash'

const EMPTY_EXPRESSION = {
  operator: 'gt',
  resource: null,
  value: null
}
const EMPTY_EXP_REF_EXP = {
  resource: null,
  operator: 'avg'
}
const EMPTY_EXPRESSION_REF = {
  operator: 'gt',
  resource: null,
  value: [{
    filter: {
      thingType: null,
      things: []
    },
    expression: [EMPTY_EXP_REF_EXP]
  }]
}

export default {
  name: 'ReWhen',
  props: {
    expression: {
      type: Array,
      default: () => ([])
    },
    filter: {
      type: Object,
      default: () => ({})
    },
    resources: Array,
    isRef: Boolean,
    valid: Boolean,
    loading: Boolean
  },
  data: () => ({
    init: true,
    init2: true,
    rules: RULE.rules,
    localExpression: [copyDeep(EMPTY_EXPRESSION)],
    metadata: {},
    operatorOptions: [
      { text: 'is above', value: 'gt' },
      { text: 'equals or above', value: 'gte' },
      { text: 'equals', value: 'eq' },
      { text: 'is below', value: 'lt' },
      { text: 'equals or below', value: 'lte' },
      { text: 'not equals', value: 'ne' },
    ],
    operatorOptionsRef: [
      { text: 'average', value: 'avg' },
      { text: 'sum', value: 'sum' },
      { text: 'min', value: 'min' },
      { text: 'max', value: 'max' }
    ]
  }),
  computed: {
    computedValid () {
      try {
        if (this.localExpression.length > 0) {
          // Expression existance
          for (let exp of this.localExpression) {
            if (!exp.resource || !exp.value || !exp.operator) {
              return false
            }

            // if Refrule, examine refs
            if (this.isRef === true) {
              for (let ref of exp.value) {
                if (!ref.filter.thingType) {
                  return false
                }

                for (let refexp of ref.expression) {
                  if (!refexp.resource || !refexp.operator) {
                    return false
                  }
                }
              }
            }
          }

          return true
        }
        return false
      } catch (e) {
        return false
      }
    }
  },
  watch: {
    expression (value) {
      try {
        if (value.length === 0) {
          this.localExpression = [copyDeep(EMPTY_EXPRESSION)]
        } else {
          this.localExpression = copyDeep(value)
        }
      } catch (e) {
        this.localExpression = [copyDeep(EMPTY_EXPRESSION)]
      }
    },
    localExpression: {
      handler: async function (expression) {
        try {
          if (this.isRef === true && this.init2 === true) {
            this.init2 = false

            for (let i in expression) {
              const exp = expression[i]
              for (let j in exp.value) {
                const value = exp.value[j]
                await this.loadThingType(value.filter.thingType, value)
              }
            }
          }
        } catch (e) {
          return
        }
      },
      deep: true
    },
    isRef (value) {
      if (this.init === true) {
        this.init = false

        // New toggle switch fix
        if (this.localExpression[0].value !== null) {
          return
        }
      }
      if (value === true) {
        this.localExpression = [copyDeep(EMPTY_EXPRESSION_REF)]
      } else {
        this.localExpression = [copyDeep(EMPTY_EXPRESSION)]
      }
    },
    computedValid (value) {
      this.$emit('update:valid', value)
    }
  },
  methods: {
    async loadThingType (thingType, ref) {
      if (thingType === null) {
        return
      }

      try {
        if (!this.metadata.hasOwnProperty(thingType)) {
          this.metadata[thingType] = []
        }

        // Only clean Things list if not at init
        if (this.init === false) {
          ref.filter.things = []
        }

        await this.$store.dispatch('ThingTypes/loadThings', thingType)
        this.metadata[thingType] = await this.$store.dispatch('Boards/findResources', thingType)
        this.metadata = cloneDeep(this.metadata)
        this.onExpressionChange()
      } catch (e) {
        this.showSnackbar(e)
      }
    },
    getMetadataResources (ref) {
      try {
        const thingType = ref.filter.thingType
        if (this.metadata.hasOwnProperty(thingType)) {
          return this.metadata[thingType]
        } else {
          return []
        }
      } catch (e) {
        return []
      }
    },
    getMetadataThings (ref) {
      try {
        const thingType = ref.filter.thingType
        const things = this.ThingTypesThings(thingType)

        let out = []
        for (let i in things) {
          const thingName = things[i].thingName
          const thingLabel = things[i].label

          out.push({
            text: thingLabel,
            value: thingName
          })
        }
        
        return out
      } catch (e) {
        return []
      }
    },
    addRefExp (exp) {
      exp.push(copyDeep(EMPTY_EXP_REF_EXP))
    },
    addCondition () {
      if (this.isRef === true) {
        this.localExpression.push(copyDeep(EMPTY_EXPRESSION_REF))
      } else {
        this.localExpression.push(copyDeep(EMPTY_EXPRESSION))
      }
      this.onExpressionChange()
    },
    onExpressionChange () {
      this.$emit('update:expression', this.localExpression)
    }
  },
  mounted () {
    this.localExpression = [copyDeep(EMPTY_EXPRESSION)]
  }
}
</script>
