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
                      <td> <a v-on:click="detalharUsuario(usuario)">{{usuario.des_name}}</a></td>
                      <td class="tad">R$ {{usuario.total_cobrar.toFixed(2).replace('.', ',')}}</td>
                      <td class="tad">R$ {{usuario.total_abonar.toFixed(2).replace('.', ',')}}</td>
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
                Nome: {{usuarioSelecionado.des_name}}<br>
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
                      <td>{{item.dat_order.toLocaleDateString('pt-BR')}}</td>
                      <td>{{item.des_prod}}</td>
                      <td class="tac">{{item.num_qtd}}</td>
                      <td class="tad">{{item.num_qtd_cobrar ? ('R$ ' + (item.num_qtd_cobrar * item.val_price).toFixed(2).replace('.', ',')) : ''}}</td>
                      <td class="tad" v-if="usuarioSelecionado.exibeAbonar" v-html="item.campo_abonar">&nbsp;</td>
                      <td>{{item.des_justify}}</td>
                    </tr>
                    <tr>
                      <td>&nbsp;</td>
                      <td><b>Total:</b></td>
                      <td>&nbsp;</td>
                      <td class="tac">{{usuarioSelecionado.total_cobrar ? ('R$ ' + usuarioSelecionado.total_cobrar.toFixed(2).replace('.', ',')) : ''}}</td>
                      <td class="tac" v-if="usuarioSelecionado.exibeAbonar">{{usuarioSelecionado.total_abonar ? ('R$ ' + usuarioSelecionado.total_abonar.toFixed(2).replace('.', ',')) : ''}}</td>
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

    atualizarPeriodo () {
      this.lista_pedidos = []
      let dat_ini = new Date(this.mesSelecionado)
      let dat_fin = new Date(this.mesSelecionado)
      dat_fin.setMonth(dat_fin.getMonth() + 1)

      this.$http.post('/order/valorestotais', {dat_ini, dat_fin}).then(function (response) {
        this.lista_usuarios = response.data.rows
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

      this.pedidoSelecionado = null
      this.usuarioSelecionado = usuario

      this.$http.post('/items/byUser/' + usuario.cod_uid, {dat_ini, dat_fin}).then(function (response) {
        // usuario.total_cobrar = 0
        // usuario.total_abonar = 0
        for (let item of response.data.rows) {
          // usuario.total_cobrar += item.num_qtd_cobrar * item.val_price
          // usuario.total_abonar += item.num_qtd_abonar * item.val_price
          item.dat_order = new Date(item.dat_order)
          if (item.num_qtd_abonar !== 0) usuario.exibeAbonar = true
          if (item.num_qtd_abonar === 0) item.campo_abonar = ''
          else if (item.cod_use === 3) item.campo_abonar = `<span style='color: red;'><b>${'R$ ' + (item.num_qtd_abonar * item.val_price).toFixed(2).replace('.', ',')}</b></span>`
          else item.campo_abonar = 'R$ ' + (item.num_qtd_abonar * item.val_price).toFixed(2).replace('.', ',')
        }
        usuario.itens = response.data.rows
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
              $this.$http.put('/usuarios/edit/extraInfo', data).then(function (response) {
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
