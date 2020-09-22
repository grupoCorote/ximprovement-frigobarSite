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
                      <tr v-for="pedido in lista_pedidos" :key="pedido.cod_order">
                        <td class="tac"><b><a v-on:click="excluirPedido(pedido)"><q-icon style="color: red;" name="clear" /></a></b></td>
                        <td> <a v-on:click="detalharPedido(pedido)">{{pedido.dat_order.toLocaleDateString('pt-BR')}}</a></td>
                        <td>{{pedido.des_name}}</td>
                        <td class="tad">R$ {{pedido.valor_total.toFixed(2).replace('.', ',')}}</td>
                        <td v-html="pedido.des_use">&nbsp;</td>
                        <td>{{pedido.des_justify}}</td>
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
                Data: {{pedidoSelecionado.dat_order.toLocaleString('pt-BR')}}<br>
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
    this.$http.get('/usuarios/perfil').then(function (response) {
      // this.i18n = i18ns(this.$route.name)
      this.perfil = response.data.perfil
      return this.$http.post('/order/periodos/todos', {max_meses: 12}).then(function (response) {
        this.listaMeses = response.data.rows
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
          if (a.dat_order > b.dat_order) return 1
          if (a.dat_order < b.dat_order) return -1
          return 0
        })
      }
      if (campo === 'usuario') {
        this.lista_pedidos.sort((a, b) => {
          if (a.des_name > b.des_name) return 1
          if (a.des_name < b.des_name) return -1
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

      this.$http.post('/order/todos', {dat_ini, dat_fin}).then(function (response) {
        for (let pedido of response.data.rows) {
          pedido.dat_order = new Date(pedido.dat_order)
          if (pedido.cod_use === 3) pedido.des_use = `<span style='color: red;'><b>${pedido.des_use}</b></span>`
        }
        this.lista_pedidos = response.data.rows
        return undefined
      }).catch(this.tratarErro)
    },
    detalharPedido (pedido) {
      if (pedido.itens == null) pedido.itens = []
      this.usuarioSelecionado = null
      this.pedidoSelecionado = pedido
      this.$http.get('/items/byOrder/' + pedido.cod_order).then(function (response) {
        pedido.itens = response.data.rows
        this.$forceUpdate()
        return undefined
      }).catch(this.tratarErro)
    },

    excluirPedido (pedido) {
      const $this = this
      Dialog.create({
        title: 'Excluir pedido',
        message: `<b>Data:</b> ${pedido.dat_order.toLocaleString('pt-BR')}<br>` +
          `<b>Usuário:</b> ${pedido.des_name}<br>` +
          `<b>Total:</b> R$ ${pedido.valor_total.toFixed(2).replace('.', ',')}<br>` +
          `<b>Tipo:</b> ${pedido.des_use}<br>` +
          `<b>Justificativa:</b> ${pedido.des_justify}`,
        form: { des_justify: {type: 'text', label: 'Justificativa', model: ''} },
        buttons: [
          'Cancelar',
          {
            label: 'Excluir',
            classes: 'negative',
            preventClose: true,
            handler (data, close) {
              if (!data.des_justify) {
                alert('É necessário justificar a exclusão')
              }
              else {
                data.cod_order = pedido.cod_order
                $this.$http.put('/order/excluir', data).then(function (response) {
                  for (let key of Object.keys(response.data.row)) {
                    if (key.startsWith('dat_')) pedido[key] = new Date(response.data.row[key])
                    else pedido[key] = response.data.row[key]
                  }
                  if (pedido.cod_use === 3) pedido.des_use = `<span style='color: red;'><b>${pedido.des_use}</b></span>`
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

      this.$http.post('/items/ByUser/' + usuario.cod_uid, {dat_ini, dat_fin}).then(function (response) {
        usuario.total_cobrar = 0
        usuario.total_abonar = 0
        for (let item of response.data.rows) {
          usuario.total_cobrar += item.num_qtd_cobrar * item.val_price
          usuario.total_abonar += item.num_qtd_abonar * item.val_price
          item.dat_order = new Date(item.dat_order)
          if (item.num_qtd_abonar !== 0) usuario.exibeAbonar = true
        }
        usuario.itens = response.data.rows
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
