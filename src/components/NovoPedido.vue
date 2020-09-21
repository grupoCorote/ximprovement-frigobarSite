<template>
  <div style="margin:20px; padding: 0px;" v-if="perfil">

      <table style="width: 100%;">
        <tbody style="vertical-align: top;">
          <td style="width: 50%;">
            <div style="font-size: 1.64rem; margin: 0.82rem 0 0.656rem;">Produtos: <q-search v-model="textSearch" class="inline" style="width: 25%; margin-left: 60px;" /> </div>
            <q-scroll-area style="width: 400px; height: calc(100vh - 190px);">
              <table class="q-table cell-separator">
                <thead>
                  <tr>
                    <th>Produto</th>
                    <th>Preço</th>
                    <th>Adicionar</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="produto in filteredItems">
                    <td>{{produto.des_prod}}</td>
                    <td class="tad">R$ {{produto.val_price.toFixed(2).replace('.', ',')}}</td>
                    <td><a v-on:click="adicionarNoCarrinho(produto)"><q-icon name="add_shopping_cart" /></a></td>
                  </tr>
                </tbody>
              </table>
            </q-scroll-area>
          </td>
          <td style="width: 50%;">
            <h5>Meu carrinho:</h5>
            <br>
            <q-checkbox type="checkbox" id="ckbter" v-model="ckbterceiros" label="Pedido para visitantes." /> <br>
            <q-input v-if="ckbterceiros" type="text" name="just" v-model="justificativa" size="20" stack-label="Justificativa" />
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
                <tr v-for="item in lista_carrinho">
                  <td class="tac">{{item.des_prod}}</td>
                  <td class="tac">{{item.num_qtd}} <a v-on:click="item_inc(item)"><q-icon name="add_circle_outline" /></a> <a v-on:click="item_dec(item)"><q-icon name="remove_circle_outline" /></a> <a v-on:click="item_rem(item)"><q-icon name="delete_forever" /></a></td>
                  <td class="tad">R$ {{(item.num_qtd * item.val_price).toFixed(2).replace('.', ',')}}</td>
                </tr>
              </tbody>
            </table>
            <br>
            <div v-if="lista_carrinho.length === 0"> &nbsp; (o carrinho está vazio)</div>
            <div v-else> &nbsp; Total: R$ {{valor_total_carrinho.toFixed(2).replace('.', ',')}}</div>
            <br>
            <div v-if="lista_carrinho.length > 0">
              <q-btn color="primary" type="button" name="button" v-on:click="confirmarPedido()">Finalizar pedido</q-btn>
              <q-btn type="button" name="button" v-on:click="limparCarrinho()">Cancelar pedido</q-btn>
            </div>
            <div v-else>
              <q-btn color="primary disabled" type="button" name="button">Finalizar pedido</q-btn>
            </div>
          </td>
        </tbody>
      </table>

  </div>
</template>

<script>
'use strict'
import { Toast, Dialog } from 'quasar-framework'

export default {
  components: {
    QInput: require('quasar-framework').QInput,
    QCheckbox: require('quasar-framework').QCheckbox,
    QIcon: require('quasar-framework').QIcon,
    QBtn: require('quasar-framework').QBtn,
    QSearch: require('quasar-framework').QSearch,
    QScrollArea: require('quasar-framework').QScrollArea
  },
  data () {
    return {
      perfil: null,
      ckbterceiros: false,
      justificativa: '',
      lista_produtos: [],
      filteredItems: [],
      lista_carrinho: [],
      valor_total_carrinho: 0,
      textSearch: ''
    }
  },
  mounted () {
    this.$http.get('/usuarios/perfil').then(function (response) {
      // this.i18n = i18ns(this.$route.name)
      this.perfil = response.data.perfil
      return this.$http.get('/prod/ativos').then(function (response) {
        this.lista_produtos = response.data.rows
        this.setFilter()
        return undefined
      })
    }).catch(this.tratarErro)
  },
  watch: {
    textSearch (value) {
      this.setFilter(value)
    }
  },
  methods: {
    tratarErro (response) {
      if (response.status === 401) return window.location.replace('#/login')
      alert(response.message || response.data.message || ('Erro ' + response.status))
    },

    setFilter () {
      if (!this.textSearch) {
        this.filteredItems = this.lista_produtos
      }
      else {
        this.filteredItems = this.lista_produtos.filter((item) => item.des_prod.toLowerCase().includes(this.textSearch.toLowerCase()))
      }
    },

    limparCarrinho () {
      this.lista_carrinho = []
      this.valor_total_carrinho = 0
      this.justificativa = ''
      this.ckbterceiros = false
      // recalcularValor()
    },

    recalcularValor () {
      let novoTotal = 0
      for (let item of this.lista_carrinho) novoTotal += item.num_qtd * item.val_price
      if (Math.abs(this.valor_total_carrinho - novoTotal) > 0.005) {
        this.valor_total_carrinho = novoTotal
        alert('O valor total do pedido estava errado e foi atualizado')
        return true
      }
      else {
        return false
      }
    },

    confirmarPedido () {
      let lista_itens = []
      if (this.recalcularValor()) {
        return
      }
      for (let item of this.lista_carrinho) {
        if (item.num_qtd) lista_itens.push({cod_prod: item.cod_prod, num_qtd: item.num_qtd, val_price: item.val_price})
      }
      if (lista_itens.length === 0) {
        alert('Nenhum item no pedido')
      }
      else if (this.ckbterceiros && (!this.justificativa)) {
        alert('É necessário preencher uma justificativa quando o pedido é para visitantes')
      }
      else {
        Dialog.create({
          title: 'Confirmar pedido',
          message: 'Deseja registrar o pedido?',
          buttons: [
            {
              label: 'Cancelar'
            },
            {
              label: 'Confirmar',
              handler: () => {
                let params = {
                  cod_use: this.ckbterceiros ? 2 : 1,
                  des_justify: this.ckbterceiros ? this.justificativa : '',
                  lista_itens
                }
                this.$http.post('/order', params).then(function (response) {
                  alert('Adicionado!')
                  this.limparCarrinho()
                  // recalcularValor()
                  window.location.replace('#/')
                  return undefined
                }).catch(this.tratarErro)
              }
            }
          ]
        })
      }
    },

    item_dec (item) {
      if (item.num_qtd === 1) this.item_rem(item)
      else if (item.num_qtd > 1) {
        item.num_qtd--
        this.valor_total_carrinho -= item.val_price
        // recalcularValor()
      }
    },
    item_inc (item) {
      item.num_qtd++
      this.valor_total_carrinho += item.val_price
      // recalcularValor()
    },
    item_rem (item) {
      for (let i = 0; i < this.lista_carrinho.length; i++) {
        if (item.cod_prod === this.lista_carrinho[i].cod_prod) {
          this.valor_total_carrinho -= item.num_qtd * item.val_price
          this.lista_carrinho.splice(i, 1)
          // recalcularValor()
          return
        }
      }
    },
    adicionarNoCarrinho (produto) {
      for (let item of this.lista_carrinho) {
        if (item.cod_prod === produto.cod_prod) {
          item.num_qtd += 1
          this.valor_total_carrinho += produto.val_price
          // recalcularValor()
          Toast.create.positive({html: 'Adicionado: ' + produto.des_prod, timeout: 700})
          return
        }
      }
      this.lista_carrinho.push({
        cod_prod: produto.cod_prod,
        des_prod: produto.des_prod,
        num_qtd: 1,
        val_price: produto.val_price
      })
      this.valor_total_carrinho += produto.val_price
      // recalcularValor()
      Toast.create.positive({html: 'Adicionado: ' + produto.des_prod, timeout: 700})
    }
  }
}
</script>

<style lang="css" scoped>
.tad {
  text-align: right;
}
.tad {
  text-align: center;
}
</style>
