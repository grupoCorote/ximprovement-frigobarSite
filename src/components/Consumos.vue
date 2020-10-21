<template lang="html">
  <div style="margin:20px; padding: 0px;" v-if="perfil">

      <q-select stack-label="Período" style="width: 170px" type="list" v-model="mesSelecionado" :options="listaMeses" v-on:input="atualizarPeriodo()"></q-select><br>
      <br>
      <table class="q-table cell-separator">
        <thead>
          <tr>
            <th>Produto</th>
            <th>Quantidade consumida</th>
            <th>Valor cobrado</th>
            <th>Valor abonado</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="produto in lista_produtos">
            <td>{{produto.des_prod}}</td>
            <td class="tac">{{produto.total_quantity}}</td>
            <td class="tad">R$ {{produto.total_cash_in.toFixed(2).replace('.',',')}}</td>
            <td class="tad">R$ {{produto.total_accredit.toFixed(2).replace('.',',')}}</td>
          </tr>
          <tr>
            <td><b>Total:</b></td>
            <td class="tac"><b>{{qtd_total_consumida}}</b></td>
            <td class="tad"><b>R$ {{total_cobrar.toFixed(2).replace('.',',')}}</b></td>
            <td class="tad"><b>R$ {{total_abonar.toFixed(2).replace('.',',')}}</b></td>
          </tr>
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
      dat_ini: new Date(),
      dat_fin: new Date(),
      listaMeses: [],
      mesSelecionado: null,
      lista_produtos: [],
      total_cobrar: 0,
      total_abonar: 0,
      qtd_total_consumida: 0
    }
  },
  mounted () {
    this.$http.get('/register').then(function (response) {
      // this.i18n = i18ns(this.$route.name)
      this.perfil = response.data.perfil
      return this.$http.get('/order/period/').then(function (response) {
        this.listaMeses = response.data
        if (this.listaMeses.length > 0) {
          this.mesSelecionado = this.listaMeses[0].value
        }
        this.atualizarPeriodo()
        return undefined
      })
    }).catch(this.tratarErro)
  },
  methods: {
    tratarErro (response) {
      if (response.status === 401) return window.location.replace('#/login')
      alert(response.message || response.data.message || ('Erro ' + response.status))
    },

    atualizarPeriodo () {
      this.lista_produtos = []
      this.total_cobrar = 0
      this.total_abonar = 0
      this.qtd_total_consumida = 0
      let dat_ini = new Date(this.mesSelecionado)
      let dat_fin = new Date(this.mesSelecionado)
      dat_fin.setMonth(dat_fin.getMonth() + 1)
      let range = dat_ini.toISOString().slice(0, 10) + ' 00:00,' + dat_fin.toISOString().slice(0, 10) + ' 00:00'
      this.$http.get('/products/consumed/', {params: {itemsProduct__order__date__range: range}}).then(function (response) {
        this.total_cobrar = 0
        this.total_abonar = 0
        this.qtd_total_consumida = 0
        for (let produto of response.data) {
          this.total_cobrar += produto.total_cash_in
          this.total_abonar += produto.total_accredit
          this.qtd_total_consumida += produto.total_quantity
        }
        this.lista_produtos = response.data
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
