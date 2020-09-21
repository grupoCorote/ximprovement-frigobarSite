'use strict'
import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

function load (component) {
  return require(`../components/${component}.vue`)
}

const router = new VueRouter({
  /*
   * NOTE! VueRouter "history" mode DOESN'T works for Cordova builds,
   * it is only to be used only for websites.
   *
   * If you decide to go with "history" mode, please also open /config/index.js
   * and set "build.publicPath" to something other than an empty string.
   * Example: '/' instead of current ''
   *
   * If switching back to default "hash" mode, don't forget to set the
   * build publicPath back to '' so Cordova builds work again.
   */

  routes: [
    {
      component: load('Login'),
      path: '/login',
      name: 'Login',
      meta: { pageTitle: 'Login', icon: 'person', menuTitle: 'Login', isPublic: true, onlyPublic: true }
    },
    {
      component: load('Home'),
      path: '/',
      name: 'Home',
      meta: { pageTitle: 'Histórico', icon: 'person', menuTitle: 'Histórico' }
    },
    {
      component: load('NovoPedido'),
      path: '/carrinho',
      name: 'NovoPedido',
      meta: { menuTitle: 'Novo Pedido', pageTitle: 'Fazer Novo Pedido', icon: 'shopping_cart' }
    },
    {
      component: load('Consumos'),
      path: '/consumos',
      name: 'Consumos',
      meta: { menuTitle: 'Consumos', pageTitle: 'Produtos Consumidos no Mês', icon: 'assessment', needAdmin: true }
    },
    {
      component: load('PedidosDetalhados'),
      path: '/pedidos',
      name: 'PedidosDetalhados',
      meta: { menuTitle: 'Detalhe Pedidos', pageTitle: 'Lista de Pedidos do Mês', icon: 'date_range', needAdmin: true }
    },
    {
      component: load('PedidosResumidos'),
      path: '/resumopedidos',
      name: 'PedidosResumidos',
      meta: { menuTitle: 'Resumo Pedidos', pageTitle: 'Pedidos do Mês por Usuário', icon: 'supervisor_account', needAdmin: true }
    },
    {
      component: load('Produtos'),
      path: '/produtos',
      name: 'Produtos',
      meta: { menuTitle: 'Lista de Produtos', pageTitle: 'Lista de Produtos', icon: 'menu', needAdmin: true }
    },

    // Always leave this last one
    {
      component: load('Error404'),
      path: '*', // Not found
      name: 'Error404',
      meta: { pageTitle: 'Não encontrado' }
    }
  ]
})

export default router
