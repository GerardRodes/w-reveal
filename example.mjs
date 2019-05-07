
import { watch, reveal } from './index.mjs'

const state = reveal({
  init: {
    hi: 'hello'
  }
})
watch(
  state.init,
  (value, old, path) => {
    console.log('[watcher:state]', value, old, path)
  },
  { deep: true, immediate: true }
)
// logs => [watcher:state] { hi: 'hello' } undefined undefined

state.init.is.deep.and.works = 'hi'
// logs => [watcher:state] { hi: 'hello', is: { deep: { and: [Object] } } } { hi: 'hello', is: { deep: { and: {} } } } is.deep.and.works
