import Store from './store.mjs'

const REVEAL_STORE = '__REVEAL_STORE__'
const ROOT = '__REVEAL_STORE_PROXY_ROOT__'

export function reveal (obj, store, trail = ROOT) {
  store = store || new Store()

  return new Proxy(obj, {
    get (obj, prop, receiver) {
      if (prop === REVEAL_STORE) {
        return store
      }

      const reflected = Reflect.get(...arguments)
      if (typeof reflected === 'object' && reflected != null) {
        return reveal(reflected, store, trail ? trail + '.' + prop : prop)
      }

      return reflected
    },
    set (obj, prop, value) {
      const oldValue = obj[prop]
      const reflected = Reflect.set(...arguments)

      if (reflected && (value !== oldValue)) {
        const path = trail ? trail + '.' + prop : prop
        store.dispatch(path, value, oldValue)
      }

      return reflected
    }
  })
}

export function watch (objProxy, ...params) {
  const store = objProxy[REVEAL_STORE]
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

  path = path ? ROOT + '.' + path : ROOT

  if (path === ROOT) {
    options.deep = true
  }

  store.subscribe(path, handler, options)
  return function revoke () {
    store.unsubscribe(path, handler, options)
  }
}
