# W-Reveal
Proof of concept of exposing an object to allow observe its properties changes using ES6 Proxy

## Install
```shell
npm i -s w-reveal
```

## Usage
### Predicted usage
```javascript
import { watch, reveal } from 'w-reveal'

// state is a proxy
const state = reveal({
  bar: 'what'
})

const revoke = watch(state, function (value, old, path) {
  console.log('[watcher:state]', value, old, path)
})

state.bar = 'hello'
// logs => "[watcher:state] { bar: 'hello' } { bar: 'what' } bar"

// removes watcher
revoke()

state.bar = 'HELLO?!'
```

### No need for initializing
```javascript
const state = reveal()
watch(
  state.not.even.initialized,
  function (value, old, prop) {
    console.log('[watcher:state]', value, old, prop)
  }
)

state.not.even.initialized.butItWorks = 'hi'
// logs => [watcher:state] { butItWorks: 'hi' } {} butItWorks
```

### Deep and immediate
```javascript
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
// logs => [watcher:state]
//  { hi: 'hello', is: { deep: { and: [Object] } } }
//  { hi: 'hello', is: { deep: { and: {} } } }
//  is.deep.and.works
```