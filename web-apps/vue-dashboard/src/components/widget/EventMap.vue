<template lang="pug">
.widget-map(:class="AppTheme")
  resize-observer(@notify="handleResize")
  .thing-map(ref="thingMap")
</template>

<script>
import L from 'leaflet'
import 'leaflet-pulse-icon'
import { ResizeObserver } from 'vue-resize'
import { widget, widgetOptions } from '@/global/mixin'
import { debounce, values } from 'lodash'
import {
  MAPBOX_PACK_LIGHT,
  MAPBOX_PACK_DARK,
  MAPBOX_API_KEY
} from '@/config'

export default {
  name: 'WidgetEventMap',
  mixins: [ widget ],
  components: { ResizeObserver },
  data: () => ({
    map: null,
    layer: null,
    markers: {},
    widgetConfig: {
      type: 'EventMap',
      label: 'Event Map',
      description: 'Display a position in a map with changin icons based on triggered events. Resource must be in the format lat,lng.',
      things: {
        min: 1
      },
      options: [
        {
          type: widgetOptions.SELECT,
          id: 'disableScrollOnMobile',
          label: 'Disable scroll on mobile',
          default: true,
          items: [
            { text: 'True', value: true },
            { text: 'False', value: false }
          ]
        }
      ]
    }
  }),
  watch: {
    resources () {
      // Update markers
      for (let resource of this.resources) {
        this.updateMarker(resource)
      }
      this.fitBounds()
    },
    AppTheme () {
      this.map.removeLayer(this.layer)
      this.generateLayer()
      this.map.addLayer(this.layer)
    }
  },
  methods: {
    handleResize: debounce(function () {
      try {
        this.map.invalidateSize()
      } catch (e) {
        return
      }
    }, 500),
    generateLayer () {
      let pack = (this.$vuetify.dark === true) ? MAPBOX_PACK_DARK : MAPBOX_PACK_LIGHT
      let url = `https://api.mapbox.com/styles/v1/mapbox/${pack}/tiles/256/{z}/{x}/{y}?access_token=${MAPBOX_API_KEY}`
      this.layer = new L.TileLayer(url)
    },
    updateMarker (resource) {
      if (resource.reported === null) {
        return
      }

      // Check if valid lat,lng
      try {
        let [lat, lng] = resource.reported.split(',')
        const latlng = new L.LatLng(lat.trim(), lng.trim())
        const markerKey = `${resource.thingType}/${resource.thingName}`

        if (this.markers.hasOwnProperty(markerKey)) {
          const marker = this.markers[markerKey]

          // Different pos
          if (!marker.getLatLng().equals(latlng)) {
            marker.setLatLng(latlng)
          }

        // Create new marker
        } else {
          let icon = L.icon.pulse({
            iconSize: [10, 10],
            color: 'green',
            heartbeat: 3
          })
          this.markers[markerKey] = L.marker(latlng, { icon }).addTo(this.map)
          this.markers[markerKey].bindTooltip(`${this.thingId2label(resource.thingName)}/${resource.resourceName}`, {
            direction: 'top'
          })
        }
      } catch (e) {
        return
      }
    },
    fitBounds () {
      if (Object.keys(this.markers).length === 0) {
        return
      }
      
      try {
        const group = L.featureGroup(values(this.markers))
        this.map.fitBounds(group.getBounds().pad(0.1))
      } catch (e) {
        return
      }
    }
  },
  mounted () {
    try {
      this.generateLayer()

      // Init map
      this.map = L.map(this.$refs.thingMap, {
        center: new L.LatLng(0, 0),
        zoom: 1,
        layers: this.layer,
        attributionControl: false,
        maxBoundsViscosity: 1,
        dragging: (this.options.disableScrollOnMobile === true) ? !L.Browser.mobile : true
      })
      this.map.scrollWheelZoom.disable()
      this.map.zoomControl.setPosition('topleft')

      // Set map bounds
      const southWest = L.latLng(-89.98155760646617, -180),
          northEast = L.latLng(89.99346179538875, 180)
      const bounds = L.latLngBounds(southWest, northEast)
      this.map.setMaxBounds(bounds)

      // Init markers
      for (let resource of this.resources) {
        this.updateMarker(resource)
      }
      this.fitBounds()
    } catch (e) {
      return
    }
  },
  beforeDestroy () {
    this.map.remove()
  }
}
</script>

<style lang="stylus">
.widget-map
  width 100%
  height 100%

  .thing-map
    width 100%
    height 100%

  &.light
    .leaflet-container
      background-color #FFF
  &.dark
    .leaflet-container
      background-color #424242
</style>
