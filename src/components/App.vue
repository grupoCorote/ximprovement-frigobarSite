<template lang="html">
  <!-- Don't drop "q-app" class -->
  <div id="q-app">

    <q-layout view="lhh Lpr lff">
      <!-- Left side Drawer -->
      <div slot="left">
        <div style="text-align: center; padding: 20px;">
          <img src="statics/app-icon.png" style="width: 70%;" alt="Reports"> <br>
          Frigobar
        </div>
        <hr style="border: 1px solid #ddd" />
        <q-list no-border link>

          <q-side-link v-for="rota in routes" v-if="rota.meta.showMenu" item :inset-separator="false" :to="rota.path" exact :key="rota.path" :id="'rot_' + rota.path.substr(1)" style="padding-left: 12px;">
            <q-item-side :icon="rota.meta.icon" />
            <q-item-main :label="rota.meta.menuTitle" style="margin-left: 0px;" />
          </q-side-link>

        </q-list>
      </div>
      <div class="layout-view" style="width: 100%; font-size: 0.875em;">

        <!-- Barra título -->
        <q-toolbar slot="header" class="shadow-3" v-if="$route">
          <q-toolbar-title :padding="1">
            <div class="row justify-between items-center">
              <div class="col-4" style="text-align: left;"><h5>{{$route ? $route.meta.pageTitle : ''}}</h5></div>
              <!--div class="col-4" style="text-align: center;" v-if="perfil"><q-input type="text" v-model="newDevNote" @keydown="verificarTecla" stack-label="Sugestões" /></div-->
              <div class="col-4" style="text-align: right;" v-if="perfil">
                <div class="row inline items-center">
                  <div class="inline" style="line-height: 90%;">
                    <span>{{perfil.email}}</span> <br>
                    <span style="font-size: 60%;">{{perfil.nome}}</span>
                  </div>
                  <q-btn class="on-right" id="app_btn_logout" @click="logout()" round small color="secondary" icon="power_settings_new" />
                </div>
              </div>
              <!--div class="col-8" style="text-align: right;" v-if="!perfil"><q-icon name="language" /> <q-btn type="button" @click="trocarLingua('pt-BR')">Português BR</q-btn> <q-btn type="button" @click="trocarLingua('en')">English</q-btn></div-->
            </div>
          </q-toolbar-title>
        </q-toolbar>

        <!-- Conteúdo -->
        <router-view />

      </div>
    </q-layout>

  </div>
</template>

<script>
'use strict'
import { Events } from 'quasar-framework'
import router from '../modulos/router.js'
import ws from '../modulos/ws.js'
import i18ns from '../modulos/i18n.js'
import fdat from '../modulos/formatarDatas.js'

export default {
  components: {
    QBtn: require('quasar-framework').QBtn,
    QIcon: require('quasar-framework').QIcon,
    QLayout: require('quasar-framework').QLayout,
    QList: require('quasar-framework').QList,
    QToolbar: require('quasar-framework').QToolbar,
    QToolbarTitle: require('quasar-framework').QToolbarTitle,
    QItemSide: require('quasar-framework').QItemSide,
    QItemMain: require('quasar-framework').QItemMain,
    QInput: require('quasar-framework').QInput,
    QSideLink: require('quasar-framework').QSideLink
  },
  data () {
    return {
      perfil: null,
      newDevNote: '',
      routes: router.options.routes
    }
  },
  beforeMount () { // Este método é executado antes do mount() de qualquer rota
    // Aqui ainda estamos no carregamento da página, não temos a informação se algum usuário está logado. Neste caso definimos a língua de acordo com o parâmetro query "?lang=xxxxx"
    if (this.$route.query.lang) this.trocaDeLocale(this.$route.query.lang)
    this.conferirMenuLateral()

    // Monitora alteração nas informações do usuário logado
    Events.$on('perfil', () => {
      this.perfil = ws.perfil
      if (ws.perfil && ws.perfil.locale) this.trocaDeLocale(ws.perfil.locale)
      this.conferirMenuLateral()
      this.$forceUpdate()
    })
  },
  methods: {
    trocaDeLocale (locale) {
      i18ns.setLocale(locale)
      fdat.updateLocale()
      for (let rota of this.routes) {
        let routei18n = i18ns(rota.name)
        if (routei18n) {
          rota.meta.menuTitle = routei18n.menuTitle
          rota.meta.pageTitle = routei18n.pageTitle
        }
      }
    },
    conferirMenuLateral () {
      for (let rota of this.routes) {
        // Confere ativação do menu
        if (!rota.meta.menuTitle) {
          rota.meta.showMenu = false
        }
        else if (ws.perfil == null || ws.perfil.email == null) {
          rota.meta.showMenu = rota.meta.isPublic === true
        }
        else {
          if (rota.meta.onlyPublic) rota.meta.showMenu = false
          else if (rota.meta.needAdmin && !(ws.perfil.perm_admin)) rota.meta.showMenu = false
          else rota.meta.showMenu = true
        }
      }
    },
    verificarTecla (e) {
      if (e.keyCode === 13) {
        this.$http.post('/notes', {des_tag: this.$route.meta.pageTitle, des_note: this.newDevNote}).then(function () {
          this.newDevNote = ''
          // response.row.dat_note = new Date(response.row.dat_note)
          // this.list_notes.push(response.row)
          return undefined
        }).catch((response) => alert(response.message || response.data.message || ('Erro ' + response.status)))
      }
    },
    logout () {
      this.$http.post('/logout').then(() => {
        localStorage.setItem('login_realizado', false)
        window.location.reload()
        return undefined
      }).catch(() => {
        window.location.reload()
      })
    }
  }
}
</script>

<style lang="css">
.dtpickr {
    padding:5px;
    border:2px solid #ccc;
    -webkit-border-radius: 5px;
    border-radius: 5px;
    text-align: center;
    width: 8em;
}
.dtpickr:focus {
    border-color:#333;
}
</style>
