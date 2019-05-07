import store from './store'

const REVEAL_ID = '__reveal_id__'
const REVEAL_PATH = '__reveal_path__'
let watchersCounter = 0

window.store = store

export function reveal (obj) {
  const id = obj[REVEAL_ID] || `__REVEAL_ID_${watchersCounter++}__`

  return new Proxy(obj, {
    get (obj, prop, receiver) {
      if (prop === REVEAL_ID) {
        return id
      }

      const reflected = Reflect.get(...arguments)
      if (typeof reflected === 'object' && reflected != null) {
        reflected[REVEAL_PATH] = [
          obj[REVEAL_PATH], prop
        ].filter(p => !!p).join('.')
        reflected[REVEAL_ID] = id
        return reveal(reflected)
      }

      return Reflect.get(...arguments)
    },
    set (obj, prop, value) {
      console.log('set', ...arguments)

      const oldValue = obj[prop]
      const reflected = Reflect.set(...arguments)

      if (reflected && (value !== oldValue)) {
        const path = [
          obj[REVEAL_PATH], prop
        ].filter(p => !!p).join('.')
        store.dispatch(id + path, { prop: path, value, oldValue })
      }

      return reflected
    }
  })
}

export function watch (objProxy, ...params) {
  const id = objProxy[REVEAL_ID]
  let path = ''
  let handler = null
  let options = {
    deep: false
  }

  switch (params.length) {
    case 1:
      handler = params[0]
      break
    case 2:
      if (typeof params[0] === 'function') {
        handler = params[0]
        options = params[1]
      } else {
        path = params[0]
        handler = params[1]
      }
      break
    case 3:
      path = params[0]
      handler = params[1]
      options = {
        ...options,
        ...params[2]
      }
      break
    default:
      throw new Error('Invalid arguments')
  }

  if (typeof path !== 'string') {
    throw new Error('Path must be a string')
  }

  const name = id + path
  store.subscribe(name, handler, options)

  return function revoke () {
    store.unsubscribe(name, handler, options)
  }
}
