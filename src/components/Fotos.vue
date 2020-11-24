<template lang="html">
  <div style="margin:20px; padding: 0px;" v-if="perfil">

        <table style="width: 100%;">
          <tbody style="vertical-align: top;">
            <td style="width: 50%;">
              <h5>Galeria</h5>
              <div v-if="listaProdutos.length > 0">
                <q-select stack-label="Produtos" style="width: 170px" type="list" v-model="produtoSelecionado" :options="listaProdutos" v-on:input="atualizarGaleria()"></q-select>
                <br>
              </div>
              <br>
              <div v-if="listaFotos.length > 0">
                (nenhum)
              </div>
              <div v-else>
                (nenhum)
              </div>
            </td>
          </tbody>
        </table>

  </div>
</template>

<script>
'use strict'

export default {
  components: {
    QSelect: require('quasar-framework').QSelect
  },
  data () {
    return {
      perfil: null,
      listaProdutos: [],
      listaFotos: [],
      produtoSelecionado: null
    }
  },
  mounted () {
    this.$http.get('/register').then(function (response) {
      // this.i18n = i18ns(this.$route.name)
      this.perfil = response.data.perfil

      this.pedidoSelecionado = null
      return this.$http.get('/products/productsGallery/').then(function (response) {
        this.listaProdutos = response.data
        if (this.listaProdutos.length > 0) {
          this.produtoSelecionado = this.listaProdutos[0].value
        }
        this.atualizarGaleria()
        return undefined
      })
    }).catch(this.tratarErro)
  },
  methods: {
    tratarErro (response) {
      if (response.status === 401) {
        localStorage.setItem('login_realizado', false)
        return window.location.replace('#/login')
      }
      if (!response.status) return alert('Erro de comunicação com o servidor')
      alert(response.message || response.data.message || ('Erro ' + response.status))
    },

    atualizarGaleria () {
      this.listaFotos = []
      this.$http.get('/photo/', {params: {product: this.produtoSelecionado}}).then(function (response) {
        for (let foto of response.data) {
          this.$http.get('/photo/' + foto.id + '/download/').then(function (response2) {
            let reader = new FileReader()
            reader.readAsArrayBuffer(response2.data)
            reader.onload = () => {
              this.listaFotos.push(reader.result)
            }
            return undefined
          }).catch(this.tratarErro)
        }
        return undefined
      }).catch(this.tratarErro)
    }
  }
}
</script>

<style lang="css" scoped>
  .tad {
    text-align: right;
  }
  .tac {
    text-align: center;
  }
</style>
