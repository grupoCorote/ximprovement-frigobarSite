<template lang="html">
  <div style="margin:20px; padding: 0px;">

    <br>
    <form class="form-signin" v-on:submit.prevent="submit()" style="text-align: center;">
      <q-input type="text" id="inputEmail" name="inputEmail" class="form-control" placeholder="Email" required autofocus v-model="USER_LOGIN" style="width: 100%;" />
      <q-input type="password" id="inputPassword" name="inputPassword" class="form-control" placeholder="Senha (*use a senha do email)" required v-model="USER_PASSW" style="width: 100%;" />
      <q-btn color="primary" id="log_btn_entrar" type="submit">Entrar</q-btn><br>
    </form>

  </div>
</template>

<script>
'use strict'

export default {
  components: {
    QInput: require('quasar-framework').QInput,
    QBtn: require('quasar-framework').QBtn
  },
  data () {
    return {
      USER_LOGIN: '',
      USER_PASSW: ''
    }
  },
  mounted () {
    this.$http.get('/register').then(() => window.location.replace(window.location.pathname + '#/carrinho')).catch(() => {})
  },
  methods: {
    tratarErro (response) {
      if (response.status === 401) return alert('Não foi possível fazer login com o usuário/senha informados')
      alert(response.message || response.data.message || ('Erro ' + response.status))
    },
    submit () {
      let parametros = {
        username: this.USER_LOGIN,
        password: this.USER_PASSW
      }
      this.$http.post('/login', parametros).then(function (response) {
        this.USER_LOGIN = ''
        this.USER_PASSW = ''
        localStorage.setItem('access_token', response.body.token)
        return window.location.replace(window.location.pathname + '#/carrinho')
        // window.location.replace(window.location.pathname)
        // window.location.reload()
      }).catch(this.tratarErro)
    }
  }
}
</script>

<style lang="css" scoped>
  .form-signin {
  max-width: 330px;
  padding: 15px;
  margin: 0 auto;
  }
  .form-signin .form-control {
  position: relative;
  height: auto;
  padding: 10px;
  font-size: 16px;
  }
  .form-signin input[type="email"] {
  margin-bottom: -1px;
  }
  .form-signin input[type="password"] {
  margin-bottom: 10px;
  }
</style>
