<template lang="html">
  <div style="margin:20px; padding: 0px;" v-if="perfil">

        <table style="width: 100%;">
          <tbody style="vertical-align: top;">
            <td style="width: 50%;">
              <h5>Meus pedidos</h5>
              <div v-if="listaMeses.length > 0">
                <q-select stack-label="Período" style="width: 170px" type="list" v-model="mesSelecionado" :options="listaMeses" v-on:input="atualizarPeriodo()"></q-select>
                <br>
              </div>
              <br>
              <div v-if="lista_pedidos.length > 0">
                <table class="q-table cell-separator">
                  <thead>
                    <tr>
                      <th>Data</th>
                      <th>Valor total</th>
                      <th>Tipo</th>
                      <th>Justificativa</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="pedido in lista_pedidos">
                      <td> <a v-on:click="detalharPedido(pedido)">{{pedido.dat_order}}</a></td>
                      <td class="tad">R$ {{pedido.valor_total.toFixed(2).replace('.', ',')}}</td>
                      <td v-html="pedido.des_use">&nbsp;</td>
                      <td>{{pedido.des_justify}}</td>
                    </tr>
                  </tbody>
                </table>
                <br>
                <p>Total a ser debitado no período: <b>R$ {{totalPedidosCobrar.toFixed(2).replace('.', ',')}}</b></p>
                <p>Total abonado no período: R$ {{totalPedidosAbonar.toFixed(2).replace('.', ',')}}</p>
              </div>
              <div v-else>
                (nenhum)
              </div>
            </td>
            <td style="width: 50%;">
              <div v-if="pedidoSelecionado">
                <h5>Detalhes do pedido:</h5>
                Data: {{pedidoSelecionado.dat_order}}<br>
                Tipo: <span v-html="pedidoSelecionado.des_use"></span><br>
                <span v-if="pedidoSelecionado.des_justify">Justificativa: {{pedidoSelecionado.des_justify}}<br></span>
                <br>
                <table class="q-table cell-separator">
                  <thead>
                    <tr>
                      <th>Produto</th>
                      <th>Quantidade</th>
                      <th>Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="item in pedidoSelecionado.itens">
                      <td>{{item.des_prod}}</td>
                      <td class="tac">{{item.num_qtd}}</td>
                      <td class="tad">R$ {{(item.num_qtd * item.val_price).toFixed(2).replace('.', ',')}}</td>
                    </tr>
                  </tbody>
                </table>
                <br>
                Total: R$ {{pedidoSelecionado.valor_total.toFixed(2).replace('.', ',')}}
              </div>
              <div v-else>
              </div>
            </td>
          </tbody>
        </table>

  </div>
</template>

<script>
'use strict'
import { Toast } from 'quasar-framework'

export default {
  components: {
    QSelect: require('quasar-framework').QSelect
  },
  data () {
    return {
      perfil: null,
      dat_abertura_de: new Date(),
      dat_abertura_ate: new Date(),
      totalPedidosCobrar: 0,
      totalPedidosAbonar: 0,
      lista_pedidos: [],
      pedidoSelecionado: null,
      listaMeses: [],
      mesSelecionado: null
    }
  },
  mounted () {
    this.$http.get('/usuarios/perfil').then(function (response) {
      // this.i18n = i18ns(this.$route.name)
      this.perfil = response.data.perfil

      this.pedidoSelecionado = null
      return this.$http.post('/order/periodos/meus', {max_meses: 12}).then(function (response) {
        this.listaMeses = response.data.rows
        if (this.listaMeses.length > 0) {
          this.mesSelecionado = this.listaMeses[0].value
        }
        this.atualizarPeriodo()
        if ((new Date(this.mesSelecionado)).toISOString().substr(0, 7) !== (new Date()).toISOString().substr(0, 7)) {
          Toast.create.warning({html: 'O mês exibido não é o atual!', timeout: 1500})
        }
        return undefined
      })
    }).catch(this.tratarErro)
  },
  methods: {
    tratarErro (response) {
      if (response.status === 401) return window.location.replace('#/login')
      if (!response.status) return alert('Erro de comunicação com o servidor')
      alert(response.message || response.data.message || ('Erro ' + response.status))
    },

    atualizarPeriodo () {
      this.lista_pedidos = []
      this.pedidoSelecionado = null
      this.totalPedidosCobrar = 0
      this.totalPedidosAbonar = 0
      let dat_fin = new Date(this.mesSelecionado)
      dat_fin.setMonth(dat_fin.getMonth() + 1)
      this.$http.post('/order/meus', {dat_ini: new Date(this.mesSelecionado), dat_fin}).then(function (response) {
        for (let pedido of response.data.rows) {
          pedido.dat_order = new Date(pedido.dat_order)
          pedido.dat_order = pedido.dat_order.toLocaleString('pt-BR')
          if (pedido.idf_charge === '1') this.totalPedidosCobrar += pedido.valor_total
          else if (pedido.cod_use !== 3) this.totalPedidosAbonar += pedido.valor_total
          if (pedido.cod_use === 3) pedido.des_use = `<span style='color: red;'><b>${pedido.des_use}</b></span>`
        }
        this.lista_pedidos = response.data.rows
        return undefined
      }).catch(this.tratarErro)
    },

    detalharPedido (pedido) {
      let inst = this
      if (pedido.itens == null) pedido.itens = []
      this.pedidoSelecionado = pedido
      this.$http.get('/oritem/dopedido/' + pedido.cod_order).then(function (response) {
        pedido.itens = response.data.rows
        inst.$forceUpdate()
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
