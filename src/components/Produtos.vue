<template lang="html">
  <div style="margin:20px; padding: 0px;" v-if="perfil">

      <table class="q-table cell-separator">
        <thead>
          <tr>
            <th>Ativo</th>
            <th>Produto</th>
            <th>Preço</th>
            <th>Data preço</th>
            <th>Cod. Barras</th>
            <th>Fotos</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="produto in lista_produtos">
            <td><q-icon v-on:click="trocarAtivo(produto)" name="edit" /> {{produto.status}}</td>
            <td><q-icon v-on:click="trocarDescricao(produto)" name="edit" /> {{produto.description}}</td>
            <td class="tad">R$ {{produto.price}} <q-icon v-on:click="trocarPreco(produto)" name="edit" /></td>
            <td class="tac">{{new Date(produto.priceDate).toLocaleDateString('pt-BR')}}</td>
            <td><q-icon v-on:click="trocarBarCode(produto)" name="edit" /> {{produto.barCode}}</td>
            <td><q-icon v-on:click="uploadPhoto(produto)" name="cloud_upload" /></td>
          </tr>
          <tr>
            <td><q-input style="text-align: center;" type="text" name="" v-model="novoProd.status" size="2" /></td>
            <td><q-input type="text" name="" v-model="novoProd.description" size="50" /></td>
            <td><q-input style="text-align: center;" type="text" name="" v-model="novoProd.price" size="10" /></td>
            <td><q-input type="text" name="" v-model="novoProd.barCode" size="13" /></td>
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
        status: true,
        description: '',
        price: '1,00'
      },
      lista_produtos: []
    }
  },
  mounted () {
    this.$http.get('/register').then(function (response) {
      // this.i18n = i18ns(this.$route.name)
      this.perfil = response.data.perfil
      return this.$http.get('/products/').then(function (response) {
        this.lista_produtos = response.data
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
            model: produto.status
          },
          des_prod: {
            type: 'text',
            label: 'Descrição',
            model: produto.description
          },
          val_price: {
            type: 'text',
            label: 'Preço',
            model: produto.price
          }
        },
        buttons: [
          'Cancelar',
          {
            label: 'Salvar',
            handler (data) {
              data.id = produto.id
              $this.$http.put('/products/' + produto.id, data).then(function (response) {
                for (let key of Object.keys(response.data)) {
                  produto[key] = response.data[key]
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
      let data = {id: produto.id, status: !produto.status}
      this.$http.patch('/products/' + produto.id + '/', data).then(function (response) {
        for (let key of Object.keys(response.data)) {
          produto[key] = response.data[key]
        }
        return undefined
      }).catch(this.tratarErro)
    },
    trocarDescricao (produto) {
      const $this = this
      Dialog.create({
        title: 'Alterar Descrição',
        message: produto.description,
        form: { description: {type: 'text', label: 'Descrição', model: produto.description} },
        buttons: [
          'Cancelar',
          {
            label: 'Salvar',
            handler (data) {
              data.id = produto.id
              $this.$http.patch('/products/' + produto.id + '/', data).then(function (response) {
                for (let key of Object.keys(response.data)) {
                  produto[key] = response.data[key]
                }
                return undefined
              }).catch($this.tratarErro)
            }
          }
        ]
      })
    },
    trocarBarCode (produto) {
      const $this = this
      Dialog.create({
        title: 'Alterar Código de Barras',
        message: produto.description,
        form: { barCode: {type: 'text', label: 'Cód. Barras', model: produto.barCode} },
        buttons: [
          'Cancelar',
          {
            label: 'Salvar',
            handler (data) {
              data.id = produto.id
              $this.$http.patch('/products/' + produto.id + '/', data).then(function (response) {
                for (let key of Object.keys(response.data)) {
                  produto[key] = response.data[key]
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
        message: produto.description,
        form: { price: {type: 'text', label: 'Preço', model: produto.price} },
        buttons: [
          'Cancelar',
          {
            label: 'Salvar',
            handler (data) {
              data.id = produto.id
              $this.$http.patch('/products/' + produto.id + '/', data).then(function (response) {
                for (let key of Object.keys(response.data)) {
                  produto[key] = response.data[key]
                }
                return undefined
              }).catch($this.tratarErro)
            }
          }
        ]
      })
    },

    adicionarProd () {
      this.$http.post('/products', this.novoProd).then(function (response) {
        this.novoProd.description = ''
        this.novoProd.price = '1,00'
        this.novoProd.barCode = '0'
        this.lista_produtos.push(response.data)
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
