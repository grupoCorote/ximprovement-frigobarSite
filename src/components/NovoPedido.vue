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
                    <td>{{produto.description}}</td>
                    <td class="tad">R$ {{produto.price}}</td>
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
                  <td class="tac">{{item.description}}</td>
                  <td class="tac">{{item.quantity}} <a v-on:click="item_inc(item)"><q-icon name="add_circle_outline" /></a> <a v-on:click="item_dec(item)"><q-icon name="remove_circle_outline" /></a> <a v-on:click="item_rem(item)"><q-icon name="delete_forever" /></a></td>
                  <td class="tad">R$ {{(item.quantity * item.price).toFixed(2).replace('.', ',')}}</td>
                </tr>
              </tbody>
            </table>
            <br>
            <div v-if="lista_carrinho.length === 0"> &nbsp; (o carrinho está vazio)</div>
            <div v-else> &nbsp; Total: R$ {{(valor_total_carrinho).toFixed(2).replace('.', ',')}}</div>
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
    this.$http.get('/register').then(function (response) {
      // this.i18n = i18ns(this.$route.name)
      this.perfil = response.data.perfil
      return this.$http.get('/products/actives/').then(function (response) {
        this.lista_produtos = response.data
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
        this.filteredItems = this.lista_produtos.filter((item) => item.description.toLowerCase().includes(this.textSearch.toLowerCase()))
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
      for (let item of this.lista_carrinho) novoTotal += item.quantity * item.price
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
        if (item.quantity) lista_itens.push({product: item.product, quantity: item.quantity, price: item.price})
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
                  orderType: this.ckbterceiros ? 2 : 1,
                  justification: this.ckbterceiros ? this.justificativa : '',
                  user: 10,
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
      if (item.quantity === 1) this.item_rem(item)
      else if (item.quantity > 1) {
        item.quantity--
        this.valor_total_carrinho -= parseFloat(item.price)
        // recalcularValor()
      }
    },
    item_inc (item) {
      item.quantity++
      this.valor_total_carrinho += parseFloat(item.price)
      // recalcularValor()
    },
    item_rem (item) {
      for (let i = 0; i < this.lista_carrinho.length; i++) {
        if (item.produto === this.lista_carrinho[i].produto) {
          this.valor_total_carrinho -= item.quantity * item.price
          this.lista_carrinho.splice(i, 1)
          // recalcularValor()
          return
        }
      }
    },
    adicionarNoCarrinho (produto) {
      for (let item of this.lista_carrinho) {
        if (item.product === produto.id) {
          item.quantity += 1
          this.valor_total_carrinho += parseFloat(produto.price)
          // recalcularValor()
          Toast.create.positive({html: 'Adicionado: ' + produto.description, timeout: 700})
          return
        }
      }
      this.lista_carrinho.push({
        product: produto.id,
        description: produto.description,
        quantity: 1,
        price: produto.price
      })
      this.valor_total_carrinho += produto.price * 1
      // recalcularValor()
      Toast.create.positive({html: 'Adicionado: ' + produto.description, timeout: 700})
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
