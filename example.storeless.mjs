import { watch, reveal } from './index.storeless.mjs'

console.log()

const state = reveal({
  bar: 'the old'
})

// watch(state, function (value, old, prop) {
//   console.log('[watcher:state]', value, old, prop)
// })

watch(state, function (value, old, prop) {
  console.log('[watcher:state]', value, old, prop)
})

state.deep.bar.deep.bar.dip = 'is new'
