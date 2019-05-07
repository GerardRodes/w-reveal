const REVEAL_CALLBACK = '__REVEAL_CALLBACK__'
const REVEAL_ADD_DEEP_CALLBACK = '__REVEAL_ADD_DEEP_CALLBACK__'
const REVEAL_ADD_FLAT_CALLBACK = '__REVEAL_ADD_FLAT_CALLBACK__'
const REVEAL_REMOVE_CALLBACK = '__REVEAL_REMOVE_CALLBACK__'

export function reveal (obj, emit) {
  const flatCallbaks = []
  const deepCallbaks = []
  const proxies = {}

  return new Proxy(obj, {
    get (obj, prop, receiver) {
      const reflected = Reflect.get(...arguments)

      if (typeof reflected === 'object' || !reflected) {
        return proxies[prop] || (
          proxies[prop] = reveal(reflected || {}, function (eObj, eOldObj, eProp) {
            const oldValue = {
              ...obj,
              [prop]: eOldObj
            }
            const newValue = {
              ...obj,
              [prop]: eObj
            }

            if (deepCallbaks.length) {
              deepCallbaks.forEach(c => c(newValue, reflected && oldValue, prop + '.' + eProp))
            }

            if (typeof emit === 'function') {
              emit(newValue, reflected && oldValue, prop + '.' + eProp)
            }
          })
        )
      }

      return reflected
    },
    set (obj, prop, value) {
      if (prop === REVEAL_ADD_FLAT_CALLBACK) {
        return flatCallbaks.push(value)
      }

      if (prop === REVEAL_ADD_DEEP_CALLBACK) {
        return deepCallbaks.push(value)
      }

      const oldValue = obj[prop]
      const oldObj = {
        ...obj
      }

      const reflected = Reflect.set(...arguments)

      if (reflected && (value !== oldValue)) {
        if (flatCallbaks.length) {
          flatCallbaks.forEach(c => c(obj, oldObj, prop))
        }
        if (deepCallbaks.length) {
          deepCallbaks.forEach(c => c(obj, oldObj, prop))
        }
        if (typeof emit === 'function') {
          emit(obj, oldObj, prop)
        }
      }

      return reflected
    }
  })
}

export function watch (target, ...params) {
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

  if (path === '') {
    options.deep = true
  }

  if (options.deep) {
    target[REVEAL_ADD_DEEP_CALLBACK] = handler
  } else {
    target[REVEAL_ADD_FLAT_CALLBACK] = handler
  }
}
