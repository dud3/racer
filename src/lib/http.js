import axios from 'axios'
import { setupCache } from 'axios-cache-adapter'

const cache = setupCache({
  maxAge: 15 * 60 * 1000 // 15min
})

function http (config, $q, message) {
  const key = process.env.API_GUEST_TOKEN

  const q = $q || false
  message = message || false

  config.method = config.method || 'get' // Get by default
  config.cache = config.cache || false

  if (key === null) {
    throw new Error('Api key not defined')
  }

  const createconf = {
    baseURL: process.env.API
  }

  if (config.cache) {
    createconf.adapter = cache.adapter
  }

  const client = axios.create(createconf)

  axios.defaults.baseURL = process.env.API
  // axios.defaults.headers.common.Authorization = 'Bearer ' + key
  axios.defaults.headers.post['Content-Type'] = 'application/json;charset=UTF-8'

  function onSuccess (r) {
    return new Promise((resolve, reject) => {
      if (message) {
        q.notify({
          group: false,
          position: 'top',
          color: 'info',
          message: 'Complete'
        })
      }

      resolve(r)
    })
  }

  function onError (e) {
    return new Promise((resolve, reject) => {
      if (message) {
        q.notify({
          group: false,
          position: 'top',
          color: 'red',
          message: 'Request Failed.'
        })
      }

      reject(e.response)
    })
  }

  function onFinally () {
    return new Promise((resolve, reject) => {
      resolve()

      if (q) q.loading.hide()
    })
  }

  if (q) q.loading.show()

  return client(config).then(onSuccess).catch(onError).finally(onFinally)
}

export default http
