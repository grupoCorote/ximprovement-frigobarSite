<template>
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
            </td>
          </tbody>
        </table>
        <div v-if="listaFotos.length > 0">
        <q-card inline v-for="foto in this.listaFotos" v-bind:key="foto.id">
          <q-card-media>
            <img :src=foto.url>
          </q-card-media>
          <q-card-actions align="around">
            <q-btn flat round small color="green" v-on:click="aprovarFoto(foto.id)"><q-icon name="done" /></q-btn>
            <q-btn flat round small color="primary" v-on:click="mostrarFoto(foto.url)"><q-icon name="image" /></q-btn>
            <q-btn flat round small v-on:click="deletarFoto(foto.id)"><q-icon name="delete" /></q-btn>
          </q-card-actions>
        </q-card>
        </div>
  </div>
 
</template>

<script>
'use strict'
import {
  QCard,
  QCardTitle,
  QCardMedia,
  QCardActions,
  QCardSeparator,
  QCardMain,
  QList,
  QItem,
  QItemMain,
  QItemSide,
  QItemTile,
  QCollapsible,
  QRating,
  QBtn,
  QParallax,
  QIcon,
  QPopover,
  QVideo
} from 'quasar'

export default {
  components: {
    QSelect: require('quasar-framework').QSelect,
    QCard,
    QCardTitle,
    QCardMedia,
    QCardActions,
    QCardSeparator,
    QCardMain,
    QList,
    QItem,
    QItemMain,
    QItemSide,
    QItemTile,
    QCollapsible,
    QRating,
    QBtn,
    QParallax,
    QIcon,
    QPopover,
    QVideo
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
      let aux = null
      this.$http.get('/photo/', {params: {product: this.produtoSelecionado}}).then(function (response) {
        for (let foto of response.data) {
          aux = {id: foto.id, url: 'http://127.0.0.1:8000/photo/' + foto.id + '/download/', photoType: foto.photoType}
          this.listaFotos.push(aux)
        }
        return undefined
      }).catch(this.tratarErro)
    },

    definirCor (photoType) {
      if (photoType === 'data') {
        return 'green'
      }
      else {
        return 'grey'
      }
    },

    deletarFoto (photoId) {
      this.$http.delete('/photo/' + photoId + '/').then(function (response) {
        this.atualizarGaleria()
        return undefined
      }).catch(this.tratarErro)
    },

    aprovarFoto (photoId) {
      let data = {photoType: 1}
      this.$http.patch('/photo/' + photoId + '/', data).then(function (response) {
        this.atualizarGaleria()
        return undefined
      }).catch(this.tratarErro)
    }

    // mostrarFoto (photoUrl) {
    //   w2popup.open({
    //     title: 'Image',
    //     body: '<div class="w2ui-centered"><img src="' + photoUrl + '"></img></div>'
    //   })
    // }
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
  .q-card{
    width: 300px;
  }
</style>
