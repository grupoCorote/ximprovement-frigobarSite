<template lang="html">
  <div style="margin:20px; padding: 0px;" v-if="perfil">

      <table class="q-table cell-separator">
        <thead>
          <tr>
            <th>Ativo</th>
            <th>Produto</th>
            <th>Preço</th>
            <th>Data preço</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="produto in lista_produtos">
            <td><q-icon v-on:click="trocarAtivo(produto)" name="edit" /> {{produto.idf_active}}</td>
            <td><q-icon v-on:click="trocarDescricao(produto)" name="edit" /> {{produto.des_prod}}</td>
            <td class="tad">R$ {{produto.val_price.toFixed(2).replace('.',',')}} <q-icon v-on:click="trocarPreco(produto)" name="edit" /></td>
            <td class="tac">{{new Date(produto.dat_price).toLocaleDateString('pt-BR')}}</td>
          </tr>
          <tr>
            <td><q-input style="text-align: center;" type="text" name="" v-model="novoProd.idf_active" size="2" /></td>
            <td><q-input type="text" name="" v-model="novoProd.des_prod" size="50" /></td>
            <td><q-input style="text-align: center;" type="text" name="" v-model="novoProd.val_price" size="10" /></td>
            <td><a v-on:click="adicionarProd()">(adicionar)</a></td>
          </tr>
        </tbody>
      </table>

  </div>
</template>

<script>
'use strict'
import { Dialog } from 'quasar'

export default {
  components: {
    QInput: require('quasar-framework').QInput,
    QIcon: require('quasar-framework').QIcon
  },
  data () {
    return {
      perfil: null,
      novoProd: {
        idf_active: '1',
        des_prod: '',
        val_price: '1,00'
      },
      lista_produtos: []
    }
  },
  mounted () {
    this.$http.get('/usuarios/perfil').then(function (response) {
      // this.i18n = i18ns(this.$route.name)
      this.perfil = response.data.perfil
      return this.$http.get('/prod/todos').then(function (response) {
        this.lista_produtos = response.data.rows
        return undefined
      })
    }).catch(this.tratarErro)
  },
  methods: {
    tratarErro (response) {
      if (response.status === 401) return window.location.replace('#/login')
      alert(response.message || response.data.message || ('Erro ' + response.status))
    },

    editarProd_antigo (produto) {
      const $this = this
      Dialog.create({
        title: 'Alterar Produto',
        message: 'Digite as informações:',
        form: {
          idf_active: {
            type: 'text',
            label: 'Ativo',
            model: produto.idf_active
          },
          des_prod: {
            type: 'text',
            label: 'Descrição',
            model: produto.des_prod
          },
          val_price: {
            type: 'text',
            label: 'Preço',
            model: produto.val_price
          }
        },
        buttons: [
          'Cancelar',
          {
            label: 'Salvar',
            handler (data) {
              data.cod_prod = produto.cod_prod
              $this.$http.put('/prod/edit', data).then(function (response) {
                for (let key of Object.keys(response.data.row)) {
                  produto[key] = response.data.row[key]
                }
                alert('Alterado!')
                return undefined
              }).catch($this.tratarErro)
            }
          }
        ]
      })
    },
    trocarAtivo (produto) {
      let data = {cod_prod: produto.cod_prod, idf_active: produto.idf_active === '0' ? '1' : '0'}
      this.$http.put('/prod/edit/ativo', data).then(function (response) {
        for (let key of Object.keys(response.data.row)) {
          produto[key] = response.data.row[key]
        }
        return undefined
      }).catch(this.tratarErro)
    },
    trocarDescricao (produto) {
      const $this = this
      Dialog.create({
        title: 'Alterar Descrição',
        message: produto.des_prod,
        form: { des_prod: {type: 'text', label: 'Descrição', model: produto.des_prod} },
        buttons: [
          'Cancelar',
          {
            label: 'Salvar',
            handler (data) {
              data.cod_prod = produto.cod_prod
              $this.$http.put('/prod/edit/descricao', data).then(function (response) {
                for (let key of Object.keys(response.data.row)) {
                  produto[key] = response.data.row[key]
                }
                return undefined
              }).catch($this.tratarErro)
            }
          }
        ]
      })
    },
    trocarPreco (produto) {
      const $this = this
      Dialog.create({
        title: 'Alterar Preço',
        message: produto.des_prod,
        form: { val_price: {type: 'text', label: 'Preço', model: produto.val_price} },
        buttons: [
          'Cancelar',
          {
            label: 'Salvar',
            handler (data) {
              data.cod_prod = produto.cod_prod
              $this.$http.put('/prod/edit/preco', data).then(function (response) {
                for (let key of Object.keys(response.data.row)) {
                  produto[key] = response.data.row[key]
                }
                return undefined
              }).catch($this.tratarErro)
            }
          }
        ]
      })
    },

    adicionarProd () {
      this.$http.post('/prod', this.novoProd).then(function (response) {
        this.novoProd.des_prod = ''
        this.novoProd.val_price = '1,00'
        this.lista_produtos.push(response.data.row)
        alert('Adicionado!')
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
