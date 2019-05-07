import { watch, reveal } from './index.mjs'

let state = reveal({
  boo: false,
  deep: {
    dip: {
      bar: 'hello'
    }
  }
})

watch(state, (value, oldValue) => {
  console.log(`state changed to "${value}" from "${oldValue}"`)
}, { deep: true })

watch(state, 'deep.dip.hola', (value, oldValue) => {
  console.log(`I only watch for deep.dip.hola: state changed to "${value}" from "${oldValue}"`)
})

state.boo = 'adios'
// => state changed to "adios" from "false"
state.deep.dip.hola = 'que tal'
// => I only watch for deep.dip.hola: state changed to "que tal" from "undefined"
// => state changed to "que tal" from "undefined"
