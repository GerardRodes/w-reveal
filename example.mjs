import { watch, reveal } from './index.mjs'

const state = reveal({
  boo: false
})

watch(state, (value, oldValue) => {
  console.log(`state changed to "${value}" from "${oldValue}"`)
}, { deep: true })
// when watching root state, watcher is deep ALWAYS

const revoke = watch(state, 'deep.dip.hola', (value, oldValue) => {
  console.log(`I only watch for deep.dip.hola: state changed to "${value}" from "${oldValue}"`)
}, { deep: false })
// when watching non-root value, watcher is not deep by default, but it can be set to deep

state.boo = 'adios'
// => state changed to "adios" from "false"
state.deep = {
  dip: {}
}

state.deep.dip.hola = 'que tal'
// => I only watch for deep.dip.hola: state changed to "que tal" from "undefined"
// => state changed to "que tal" from "undefined"
revoke()
state.deep.dip.hola = 'revoked'
// => state changed to "revoked" from "que tal"

const anotherState = reveal({
  lol: {
    lol: {
      lol: {
        lol: 'lol?'
      }
    }
  }
})

watch(anotherState, 'lol', (value, oldValue) => {
  console.log(`another state changed to "${value}" from "${oldValue}"`)
}, { deep: true })

anotherState.lol.lol.lol.lol = 'yes, lol'
