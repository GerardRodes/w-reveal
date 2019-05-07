import store from './store.mjs'

const REVEAL_ID = '__reveal_id__'
let watchersCounter = 0

export function reveal (obj, revealID, trail) {
  const id = revealID || `__REVEAL_ID_${watchersCounter++}__`

  return new Proxy(obj, {
    get (obj, prop, receiver) {
      if (prop === REVEAL_ID) {
        return id
      }

      const reflected = Reflect.get(...arguments)
      if (typeof reflected === 'object' && reflected != null) {
        return reveal(reflected, id, trail ? trail + '.' + prop : prop)
      }

      return Reflect.get(...arguments)
    },
    set (obj, prop, value) {
      const oldValue = obj[prop]
      const reflected = Reflect.set(...arguments)

      if (reflected && (value !== oldValue)) {
        const path = trail ? trail + '.' + prop : prop
        store.dispatch(id + path, value, oldValue)
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
