<template lang="pug">
v-content#view-login(v-if="this.AppUser === null")
  v-toolbar.elevation-0(
    dark fixed
    color="transparent"
  )
    v-spacer
    v-toolbar-items
      v-btn(flat) About Us

  v-container(
    fluid
    fill-height
  )
    v-layout(
      align-center
      justify-center
    )
      v-flex(xs12 sm8 md4 lg3 xl2)
        ui-card(:loading="loading")
          v-card-title(primary-title)
            v-layout
              v-flex.shrink
                #svg-logo
                  svg(viewBox="0 0 200 250")
                    g(fill="none")
                      rect(height="50" width="50" data-y="100" y="-100" x="0" fill="#00ace7")
                      rect(height="50" width="50" data-y="150" y="-100" x="25" fill="#0397ca")
                      rect(height="50" width="50" data-y="200" y="-100" x="52" fill="#0480ab")
                      rect(height="50" width="50" data-y="250" y="-100" x="75" fill="#046486")
                      rect(height="50" width="50" data-y="200" y="-100" x="100" fill="#0480ab")
                      rect(height="50" width="50" data-y="150" y="-100" x="125" fill="#0397ca")
                      rect(height="50" width="50" data-y="100" y="-100" x="150" fill="#00ace7")
              v-flex
                .headline Managed IoT Cloud
                span.grey--text Dashboard {{ version }}

          v-card-text
            v-form
              v-text-field(
                autofocus
                prepend-icon='person'
                type='text'
                label='Username'
                v-model='username'
                :disabled="loading"
                @keyup.enter.native="login"
              )

              v-text-field#password(
                prepend-icon='lock'
                type='password'
                label='Password'
                v-model='password'
                :disabled="loading"
                @keyup.enter.native="login"
              )

          v-card-actions
            v-spacer
            v-btn(
              flat
              :disabled="loading"
              @click="login"
            ) Login
</template>

<script>
import anime from 'animejs'
import UiCard from '@/components/UiCard'
import { VERSION } from '@/config'

export default {
  name: 'Login',
  components: { UiCard },
  data: () => ({
    username: '',
    password: '',
    loading: false,
    version: VERSION
  }),
  methods: {
    async login () {
      // Simple validation
      if (this.username === '' || this.password === '') {
        return
      }

      const payload = {
        username: this.username,
        password: this.password
      }

      this.loading = true
      try {
        await this.$store.dispatch('App/login', payload)
        this.$router.push('/dashboard')
      } catch (e) {
        this.showSnackbar(e)
        this.loading = false
      }
    }
  },
  mounted () {
    if (this.AppUser !== null) {
      this.$router.push('/dashboard')
    }

    anime({
      targets: '#svg-logo rect',
      easing: 'easeOutElastic',
      elasticity: 400,
      translateY: el => { return el.getAttribute('data-y') },
      duration: () => { return anime.random(1000, 2000) },
      delay: () => { return 500 + anime.random(0, 1000) }
    })
  }
}
</script>

<style lang="stylus">
#view-login
  .container
    background url('../assets/img/splash.jpg')
    background-size cover
    background-position center

  .v-card
    background-color rgba(255, 255, 255, .75) !important

    .v-card__title
      padding-bottom 0

  #svg-logo
    width 47px
    margin-right 16px
</style>
