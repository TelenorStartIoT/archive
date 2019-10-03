<template lang="pug">
.widget-map(:class="AppTheme")
  resize-observer(@notify="handleResize")
  .thing-map(ref="thingMap")
</template>

<script>
import L from 'leaflet'
import 'leaflet-defaulticon-compatibility'
import { ResizeObserver } from 'vue-resize'
import { widget, widgetOptions } from '@/global/mixin'
import { debounce } from 'lodash'
import {
  MAPBOX_PACK_LIGHT,
  MAPBOX_PACK_DARK,
  MAPBOX_API_KEY
} from '@/config'
import '@/components/widget/deps/L.HeatLayer'

export default {
  name: 'WidgetTraceMap',
  mixins: [ widget ],
  components: { ResizeObserver },
  data: () => ({
    map: null,
    layer: null,
    markers: null,
    markerColors: ['#00a0e5', '#b40dda', '#e5003c', '#00e5b4', '#d3e500'],
    line: null,
    heat: null,
    widgetConfig: {
      type: 'TraceMap',
      label: 'Trace Map',
      description: 'Display positions in a map over time. Resources must be in the format lat,lng.',
      things: {
        min: 1,
        max: 5
      },
      observations: true,
      options: [
        {
          type: widgetOptions.SELECT,
          id: 'connected',
          label: 'Connected Lines',
          default: false,
          items: [
            { text: 'True', value: true },
            { text: 'False', value: false }
          ]
        },
        {
          type: widgetOptions.SELECT,
          id: 'merged',
          label: 'Merge multiple Things',
          default: false,
          items: [
            { text: 'True', value: true },
            { text: 'False', value: false }
          ]
        },
        {
          type: widgetOptions.SELECT,
          id: 'heatmap',
          label: 'Heatmap',
          default: false,
          items: [
            { text: 'True', value: true },
            { text: 'False', value: false }
          ]
        },
        {
          type: widgetOptions.SELECT,
          id: 'disableScrollOnMobile',
          label: 'Disable scroll on mobile',
          default: true,
          items: [
            { text: 'True', value: true },
            { text: 'False', value: false }
          ]
        },
        {
          type: widgetOptions.SELECT,
          id: 'live',
          label: 'Update Live',
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
    observations () {
      try {
        // Update markers
        this.updateMarkers()
        this.fitBounds()
      } catch (e) {
        return
      }
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
    updateMarkers () {
      // Remove any previous markers
      this.markers.clearLayers()

      // Store the coords array of points
      let coords = []

      for (let [i, observation] of this.observations.entries()) {
        // Fetch marker pos trace for each data source
        const markersPos = observation.data.map(o => o.value)

        for (let j in markersPos) {
          const pos = markersPos[j]

          // Check if valid lat,lng
          try {
            let [lat, lng] = pos.split(',')
            const latlng = new L.LatLng(lat.trim(), lng.trim())
            coords.push(latlng)

            const color = (this.options.merged === true) ? this.markerColors[0] : this.markerColors[i]

            // Create new marker and add to markers
            const newMarker = L.circleMarker(latlng, {
              radius: 3,
              stroke: false,
              fillColor: color,
              fillOpacity: 1,
              interactive: false
            })

            // Only add markers if heatmap is disabled
            if (this.options.heatmap !== true) {
              this.markers.addLayer(newMarker)
            }
          } catch (e) {
            return
          }
        }
      }

      // Apply connected lines and heat (if configured to)
      const coords_line = (this.options.connected === true) ? coords : []
      const coords_heat = (this.options.heatmap === true) ? coords : []
      this.line.setLatLngs(coords_line).redraw()
      this.heat.setLatLngs(coords_heat)
    },
    fitBounds () {
      try {
        let bounds = null

        if (this.markers.getLayers().length > 0) {
          bounds = this.markers.getBounds().pad(0.1)
        } else if (this.heat._latlngs.length > 0) {
          bounds = this.heat._latlngs
        } else {
          return
        }

        this.map.fitBounds(bounds)
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
      this.markers = L.featureGroup().addTo(this.map)
      this.line = L.polyline([[0,0]], {
        color: this.markerColors[0],
        weight: 1
      }).addTo(this.map)
      this.heat = L.heatLayer([[0,0]], {
        radius: 25,
        minOpacity: 0.2,
      }).addTo(this.map)

      // Set map bounds
      const southWest = L.latLng(-89.98155760646617, -180),
          northEast = L.latLng(89.99346179538875, 180)
      const bounds = L.latLngBounds(southWest, northEast)
      this.map.setMaxBounds(bounds)

      // Init markers
      this.updateMarkers()
      this.fitBounds()
    } catch (e) {
      throw e
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
