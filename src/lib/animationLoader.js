const animationLoader = async () => {
  // process.env.BASE_URL = 'http://localhost:8081'

  return new Promise((resolve, reject) => {
    const arr = ['three.js', 'OrbitControls.js', 'THREEg.js', 'OBJLoader.js', 'GLTFLoader.js', 'CSS2DRenderer.js', 'RoadBuilder.js']

    let i = 0
    const load = (script) => {
      const e = document.createElement('script')

      e.src = `/animation/${script}`
      e.type = 'text/javascript'
      document.getElementsByTagName('head')[0].appendChild(e)

      if (++i < arr.length) {
        e.addEventListener('load', () => { load(arr[i]) })
      } else {
        resolve()
      }
    }

    load(arr[0])
  })
}

export default animationLoader
