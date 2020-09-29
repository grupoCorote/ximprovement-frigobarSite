'use strict'
import { Events } from 'quasar-framework'

const ws = {
  // servidorWS: '//ws.fw.landix.com.br:3003',
  servidorWS: 'http://127.0.0.1:8000',
  // servidorWS: '//localhost:4003',
  perfil: null // Informações do usuário logado
}

// Intercepta todas as requisições ao WebService
ws.interceptor = function (request, next) {
  // Tem que passar "credentials = true" para poder enviar o cookie de sessão
  request.credentials = true
  if (request.method === 'POST' || request.method === 'PUT' || request.method === 'PATCH') request.headers.set('Content-Type', 'application/json')

  // Intercepta a rota de solicitação de perfil se já tem informações do perfil e retorna direto sem precisar pedir do servidor
  if (request.url === '/register' && request.method === 'GET' && ws.perfil) {
    return next(request.respondWith({ perfil: ws.perfil }, { status: 200, statusText: 'OK' }))
  }

  // Verifica se a rota está solicitando as informações do usuário logado
  let aguardandoPerfil = (request.url === '/register' && request.method === 'GET')

  // Adiciona o endereço do web-service
  request.url = ws.servidorWS + request.url
  next(function (response) {
    // Verifica se as informações do usuário logado devem ser atualizadas
    if (response.status === 401 && ws.perfil != null) {
      ws.perfil = null
      Events.$emit('perfil')
    }
    else if (response.status === 200 && aguardandoPerfil) {
      ws.perfil = response.data.perfil
      Events.$emit('perfil')
    }
  })
}

export default ws
