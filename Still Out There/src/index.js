import './style.css'
import { ClientExposed } from './ClientExposed.js'
import { VueFuites } from './VueFuites.js'
import { Application } from './Application.js'

const client = new ClientExposed()
const vue = new VueFuites(document.querySelector('#resultats'))

const application = new Application(
  client,
  vue,
  document.querySelector('#formulaire'),
  document.querySelector('#mail'),
  document.querySelector('#tri')
)

application.demarrer()