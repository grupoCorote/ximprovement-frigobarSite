<template>
  <div style="margin:20px; padding: 0px;" v-if="perfil">

        <table style="width: 100%;">
          <tbody style="vertical-align: top;">
            <td style="width: 50%;">
              <div style="font-size: 1.64rem; margin: 0.82rem 0 0.656rem;">Lista de pedidos: <q-select stack-label="Período" class="inline" style="width: 170px; margin-left: 50px;" type="list" v-model="mesSelecionado" :options="listaMeses" v-on:input="atualizarPeriodo()"></q-select> </div>
              <q-scroll-area style="width: calc(100% - 40px); height: calc(100vh - 190px);">
                <div v-if="lista_pedidos.length > 0">
                  <table class="q-table cell-separator">
                    <thead>
                      <tr>
                        <th>Excluir</th>
                        <th @click="ordenar('data')">Data</th>
                        <th @click="ordenar('usuario')">Usuário</th>
                        <th>Valor total</th>
                        <th>Tipo</th>
                        <th>Justificativa</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="pedido in lista_pedidos" :key="pedido.id">
                        <td class="tac"><b><a v-on:click="excluirPedido(pedido)"><q-icon style="color: red;" name="clear" /></a></b></td>
                        <td> <a v-on:click="detalharPedido(pedido)">{{pedido.date.toLocaleDateString('pt-BR')}}</a></td>
                        <td>{{pedido.name}}</td>
                        <td class="tad">R$ {{pedido.total.toFixed(2).replace('.', ',')}}</td>
                        <td v-html="pedido.orderType">&nbsp;</td>
                        <td>{{pedido.justification}}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div v-else>
                  (nenhum)
                </div>
              </q-scroll-area>
            </td>
            <td style="width: 50%;">

              <div v-if="pedidoSelecionado">
                <h5>Detalhes do pedido:</h5>
                Data: {{pedidoSelecionado.date.toLocaleDateString('pt-BR')}}<br>
                Tipo: <span v-html="pedidoSelecionado.orderType"></span><br>
                <span v-if="pedidoSelecionado.justification">Justificativa: {{pedidoSelecionado.justification}}<br></span>
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
                      <td>{{item.description}}</td>
                      <td class="tac">{{item.quantity}}</td>
                      <td class="tad">R$ {{(item.quantity * item.price).toFixed(2).replace('.', ',')}}</td>
                    </tr>
                  </tbody>
                </table>
                <br>
                Total: R$ {{pedidoSelecionado.total.toFixed(2).replace('.', ',')}}
              </div>

            </td>
          </tbody>
        </table>

  </div>
</template>

<script>
'use strict'
import { Dialog } from 'quasar-framework'

export default {
  components: {
    QSelect: require('quasar-framework').QSelect,
    QIcon: require('quasar-framework').QIcon,
    QScrollArea: require('quasar-framework').QScrollArea
  },
  data () {
    return {
      perfil: null,
      dat_ini: new Date(),
      dat_fin: new Date(),
      lista_pedidos: [],
      pedidoSelecionado: null,
      usuarioSelecionado: null,
      listaMeses: [],
      lista_usuarios: [],
      mesSelecionado: null
    }
  },
  mounted () {
    this.$http.get('/register').then(function (response) {
      // this.i18n = i18ns(this.$route.name)
      this.perfil = response.data.perfil
      return this.$http.get('/order/period/', {max_meses: 12}).then(function (response) {
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
    ordenar (campo) {
      if (campo === 'data') {
        this.lista_pedidos.sort((a, b) => {
          if (a.date > b.date) return 1
          if (a.date < b.date) return -1
          return 0
        })
      }
      if (campo === 'usuario') {
        this.lista_pedidos.sort((a, b) => {
          if (a.name > b.name) return 1
          if (a.name < b.name) return -1
          return 0
        })
      }
    },
    atualizarPeriodo () {
      this.lista_pedidos = []
      this.pedidoSelecionado = null
      let dat_ini = new Date(this.mesSelecionado)
      let dat_fin = new Date(this.mesSelecionado)
      dat_fin.setMonth(dat_fin.getMonth() + 1)
      let ini = dat_ini.toISOString().slice(0, 10) + ' 00:00'
      let fin = dat_fin.toISOString().slice(0, 10) + ' 00:00'

      this.$http.get('/order/all/', {params: {date__lte: fin, date__gte: ini}}).then(function (response) {
        for (let pedido of response.data) {
          pedido.date = new Date(pedido.date)
          if (pedido.orderType === 3) pedido.justification = `<span style='color: red;'><b>${pedido.justification}</b></span>`
        }
        this.lista_pedidos = response.data
        return undefined
      }).catch(this.tratarErro)
    },
    detalharPedido (pedido) {
      if (pedido.itens == null) pedido.itens = []
      this.usuarioSelecionado = null
      this.pedidoSelecionado = pedido
      this.$http.get('/items/byOrder/' + pedido.id + '/').then(function (response) {
        pedido.itens = response.data
        this.$forceUpdate()
        return undefined
      }).catch(this.tratarErro)
    },

    excluirPedido (pedido) {
      const $this = this
      Dialog.create({
        title: 'Excluir pedido',
        message: `<b>Data:</b> ${pedido.date.toLocaleString('pt-BR')}<br>` +
          `<b>Usuário:</b> ${pedido.name}<br>` +
          `<b>Total:</b> R$ ${pedido.total.toFixed(2).replace('.', ',')}<br>` +
          `<b>Tipo:</b> ${pedido.orderType}<br>` +
          `<b>Justificativa:</b> ${pedido.justification}`,
        form: { justification: {type: 'text', label: 'Justificativa', model: ''} },
        buttons: [
          'Cancelar',
          {
            label: 'Excluir',
            classes: 'negative',
            preventClose: true,
            handler (data, close) {
              if (!data.justification) {
                alert('É necessário justificar a exclusão')
              }
              else {
                data.id = pedido.id
                data.orderType = 3
                $this.$http.patch('/order/' + data.id + '/', data).then(function (response) {
                  for (let key of Object.keys(response.data)) {
                    if (key.startsWith('date')) {
                      pedido[key] = new Date(response.data[key])
                    }
                    else {
                      pedido[key] = response.data[key]
                    }
                  }
                  if (pedido.orderType === 3) pedido.orderType = `<span style='color: red;'><b>Excluído</b></span>`
                  close()
                  return undefined
                }).catch($this.tratarErro)
              }
            }
          }
        ]
      })
    },

    detalharUsuario (usuario) {
      if (usuario.itens == null) usuario.itens = []
      usuario.total_cobrar = 0
      usuario.total_abonar = 0
      usuario.exibeAbonar = false

      let dat_ini = new Date(this.mesSelecionado)
      let dat_fin = new Date(this.mesSelecionado)
      dat_fin.setMonth(dat_fin.getMonth() + 1)
      usuario.dat_ini = dat_ini
      usuario.dat_fin = new Date(dat_fin.getTime() - 24 * 60 * 60 * 1000)

      this.pedidoSelecionado = null
      this.usuarioSelecionado = usuario

      this.$http.post('/items/ByUser/' + usuario.id + '/', {dat_ini, dat_fin}).then(function (response) {
        usuario.total_cobrar = 0
        usuario.total_abonar = 0
        for (let item of response.data) {
          usuario.total_cobrar += item.quantity_cash_in * item.price
          usuario.total_abonar += item.quantity_accredit * item.price
          item.date = new Date(item.date)
          if (item.quantity_accredit !== 0) usuario.exibeAbonar = true
        }
        usuario.itens = response.data
        this.$forceUpdate()
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
