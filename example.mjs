
import { watch, reveal } from './index.mjs'

const state = reveal()

const revoke = watch(state, function (value, old, prop) {
  console.log('[watcher:state]', value, old, prop)
}, { deep: true, immediate: true })

state.deep.bar.deep.bar.dip = 'is new'
revoke()
state.deep.bar.deep.bar.dip = 'is new new'