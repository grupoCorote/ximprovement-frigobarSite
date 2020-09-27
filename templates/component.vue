<template lang="html">
  <div style="margin:20px; padding: 0px;" v-if="perfil">


  </div>
</template>

<script>
'use strict'

export default {
  components: {
    QBtn: require('quasar-framework').QBtn
  },
  data () {
    return {
      perfil: null,
    }
  },
  mounted () {
    this.$http.get('/register').then(function (response) {
      // this.i18n = i18ns(this.$route.name)
      this.perfil = response.data.perfil
    }).catch(this.tratarErro)
  },
  methods: {
    tratarErro (response) {
      if (response.status === 401) return window.location.replace('#/login')
      alert(response.message || response.data.message || ('Erro ' + response.status))
    }
  }
}
</script>

<style lang="css" scoped>
</style>
