<template lang="html">
  <div style="margin:20px; padding: 0px;" v-if="perfil">

        <table style="width: 100%;">
          <tbody style="vertical-align: top;">
            <td style="width: 50%;">
              <q-select stack-label="Período" style="width: 170px" type="list" v-model="mesSelecionado" :options="listaMeses" v-on:input="atualizarPeriodo()"></q-select>
              <br>

              <br>
              <h5>Lista de usuários:</h5>
              <div v-if="lista_usuarios.length > 0">
                <table class="q-table cell-separator">
                  <thead>
                    <tr>
                      <th>Usuário</th>
                      <th>Total particular (a cobrar)</th>
                      <th>Total visitantes (não cobrar)</th>
                      <th>Matrícula</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="usuario in lista_usuarios">
                      <td> <a v-on:click="detalharUsuario(usuario)">{{usuario.name}}</a></td>
                      <td class="tad">R$ {{usuario.total_cash_in.toFixed(2).replace('.', ',')}}</td>
                      <td class="tad">R$ {{usuario.total_accredit.toFixed(2).replace('.', ',')}}</td>
                      <td class="tac">{{usuario.des_extraInfo || ''}} <q-icon v-on:click="editarMatricula(usuario)" name="edit" /></td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div v-else>
                (nenhum)
              </div>

            </td>
            <td style="width: 50%;">

              <div v-if="usuarioSelecionado">
                <h5>Relatório do usuário:</h5>
                Nome: {{usuarioSelecionado.name}}<br>
                Data: de {{usuarioSelecionado.dat_ini.toLocaleDateString('pt-BR')}} até {{usuarioSelecionado.dat_fin.toLocaleDateString('pt-BR')}}<br>
                <br>
                <table class="q-table cell-separator" v-if="usuarioSelecionado.itens.length > 0">
                  <thead>
                    <tr>
                      <th>Data</th>
                      <th>Produto</th>
                      <th>Quantidade</th>
                      <th>Valor a cobrar</th>
                      <th v-if="usuarioSelecionado.exibeAbonar">Valor a abonar</th>
                      <th>Justificativa</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="item in usuarioSelecionado.itens">
                      <td>{{item.date.toLocaleDateString('pt-BR')}}</td>
                      <td>{{item.description}}</td>
                      <td class="tac">{{item.quantity}}</td>
                      <td class="tad">{{item.quantity_cash_in ? ('R$ ' + (item.quantity_cash_in * item.price).toFixed(2).replace('.', ',')) : ''}}</td>
                      <td class="tad" v-if="usuarioSelecionado.exibeAbonar" v-html="item.campo_abonar">&nbsp;</td>
                      <td>{{item.justification}}</td>
                    </tr>
                    <tr>
                      <td>&nbsp;</td>
                      <td><b>Total:</b></td>
                      <td>&nbsp;</td>
                      <td class="tac">{{usuarioSelecionado.total_cash_in ? ('R$ ' + usuarioSelecionado.total_cash_in.toFixed(2).replace('.', ',')) : ''}}</td>
                      <td class="tac" v-if="usuarioSelecionado.exibeAbonar">{{usuarioSelecionado.total_accredit ? ('R$ ' + usuarioSelecionado.total_accredit.toFixed(2).replace('.', ',')) : ''}}</td>
                      <td>&nbsp;</td>
                    </tr>
                  </tbody>
                </table>
                <br>
              </div>

            </td>
          </tbody>
        </table>

  </div>
</template>

<script>
'use strict'
import { Dialog } from 'quasar'

export default {
  components: {
    QIcon: require('quasar-framework').QIcon,
    QSelect: require('quasar-framework').QSelect
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
    this.usuarioSelecionado = null
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

    atualizarPeriodo () {
      this.lista_pedidos = []
      let dat_ini = new Date(this.mesSelecionado)
      let dat_fin = new Date(this.mesSelecionado)
      dat_fin.setMonth(dat_fin.getMonth() + 1)
      let ini = dat_ini.toISOString().slice(0, 10) + ' 00:00'
      let fin = dat_fin.toISOString().slice(0, 10) + ' 00:00'

      this.$http.get('/order/total/', {params: {date__lte: fin, date__gte: ini}}).then(function (response) {
        this.lista_usuarios = response.data
        return undefined
      }).catch(this.tratarErro)
    },

    detalharUsuario (usuario) {
      if (usuario.itens == null) usuario.itens = []
      // usuario.total_cobrar = 0
      // usuario.total_abonar = 0
      usuario.exibeAbonar = false

      let dat_ini = new Date(this.mesSelecionado)
      let dat_fin = new Date(this.mesSelecionado)
      dat_fin.setMonth(dat_fin.getMonth() + 1)
      usuario.dat_ini = dat_ini
      usuario.dat_fin = new Date(dat_fin.getTime() - 24 * 60 * 60 * 1000)
      let ini = dat_ini.toISOString().slice(0, 10) + ' 00:00'
      let fin = dat_fin.toISOString().slice(0, 10) + ' 00:00'

      this.pedidoSelecionado = null
      this.usuarioSelecionado = usuario

      this.$http.get('/items/byUser/' + usuario.user + '/', {params: {date__lte: fin, date__gte: ini}}).then(function (response) {
        // usuario.total_cobrar = 0
        // usuario.total_abonar = 0
        for (let item of response.data) {
          // usuario.total_cobrar += item.num_qtd_cobrar * item.val_price
          // usuario.total_abonar += item.num_qtd_abonar * item.val_price
          item.date = new Date(item.date)
          if (item.quantity_accredit !== 0) usuario.exibeAbonar = true
          if (item.quantity_accredit === 0) item.campo_abonar = ''
          else if (item.orderType === 3) item.campo_abonar = `<span style='color: red;'><b>${'R$ ' + (item.quantity_accredit * item.price).toFixed(2).replace('.', ',')}</b></span>`
          else item.quantity_accredit = 'R$ ' + (item.quantity_accredit * item.price).toFixed(2).replace('.', ',')
        }
        usuario.itens = response.data
        this.$forceUpdate()
        return undefined
      }).catch(this.tratarErro)
    },

    editarMatricula (usuario) {
      const $this = this
      Dialog.create({
        title: 'Definir matrícula',
        message: usuario.des_name,
        form: { des_extraInfo: {type: 'text', label: 'Matrícula', model: usuario.des_extraInfo || ''} },
        buttons: [
          'Cancelar',
          {
            label: 'Salvar',
            handler (data) {
              data.cod_uid = usuario.cod_uid
              $this.$http.patch('/usuarios/edit/extraInfo', data).then(function (response) {
                for (let key of Object.keys(response.data.row)) {
                  usuario[key] = response.data.row[key]
                }
                return undefined
              }).catch($this.tratarErro)
            }
          }
        ]
      })
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
