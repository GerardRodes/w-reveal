class Store {
  constructor () {
    this.watchers = {}
    this.deepWatchers = {}
  }

  dispatch (name, data) {
    console.log('dis', name)

    if (Array.isArray(this.watchers[name])) {
      this.watchers[name]
        .forEach(handler => handler(data))
    }

    for (const key in this.deepWatchers) {
      if (name.startsWith(key)) {
        this.deepWatchers[key]
          .forEach(handler => handler(data))
      }
    }
  }

  subscribe (name, handler, options) {
    console.log('sub', name)

    const isDeep = !options || options.deep

    if (isDeep) {
      if (!this.deepWatchers[name]) {
        this.deepWatchers[name] = []
      }
      this.deepWatchers[name].push(handler)
    } else {
      if (!this.watchers[name]) {
        this.watchers[name] = []
      }
      this.watchers[name].push(handler)
    }
  }

  unsubscribe (name, handler, options) {
    const isDeep = !options || options.deep

    if (isDeep) {
      for (const key in this.deepWatchers) {
        if (name.startsWith(key)) {
          this.deepWatchers[key] = this.deepWatchers[key]
            .filter(h => h !== handler)
        }
      }
    } else {
      this.watchers[name] = this.watchers[name]
        .filter(h => h !== handler)
    }
  }
}

const store = new Store()

export default store
