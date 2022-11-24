import * as THREE from 'https://cdn.skypack.dev/three@0.132.2'
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/loaders/GLTFLoader.js'

document.getElementById('counter').addEventListener("change", () => {
  hablar(document.getElementById('counter').value);
});

function hablar(number) {
  // if (number == 0) {
  //   speechSynthesis.speak(new SpeechSynthesisUtterance(number))
  // }
  alert(number)
}

/**Class para la construccion de la experiencia Aumented Reallity */
class ARExperience {
  constructor() {
    //create the element
    this.container = document.createElement('div')

    //camera
    this.camera = new THREE.PerspectiveCamera(
      90,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    )
    this.camera.position.set(0.1, 0.1, 0.7)
    this.scene = new THREE.Scene()

    //renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
    })
    this.renderer.setPixelRatio(2)
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.renderer.setAnimationLoop(this.render.bind(this))
    this.container.appendChild(this.renderer.domElement)

    /* Controls */
    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    this.controls.enableDamping = true
    this.controls.enablePan = false

    /* resize */
    window.addEventListener('resize', this.resize.bind(this))

    /* Lights */
    this.addLights()

    /* Earth positions */
    this.earthPosition = new THREE.Vector3(0, 0, 0)

    /* Moon Group */
    this.moonGroup = new THREE.Group()
    this.scene.add(this.moonGroup)

    /* Satelite Group */
    this.sateliteGroup = new THREE.Group()
    this.scene.add(this.sateliteGroup)

    /* Add Starts */
    this.addStarts()

    /* Regresive count */
    this.counter = 3
    this.initAnimation = false

    /* Load the models */
    this.loader = new GLTFLoader().load('./planets_d.glb', (gltf) => {
      this.scene.add(gltf.scene)
      this.scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          if (child.name === 'moon') {
            //Grupo pivote para la rotacion
            //de la luna alrededor de la tierra
            child.scale.set(3, 3, 3)
            this.moonGroup.add(child)
          }

          if (child.name === 'satelite') {
            this.sateliteGroup.add(child)
          }
        }
      })
    })
  }

  initScene() {
    document.getElementById('container3D').appendChild(this.container)
    this.regresiveCounter()
  }

  regresiveCounter() {
    setTimeout(() => {
      if (this.counter < 0) {
        this.initAnimation = true
        document.getElementById('label').innerText = ''
        document.getElementById('counter').innerText = 'Despegue'
        return
      } else {
        document.getElementById('counter').innerText = `${this.counter}`
        this.counter--
        this.regresiveCounter()
      }
    }, 1000)
  }
  addLights() {
    const al = new THREE.AmbientLight(0xffffff, 0.6)
    this.scene.add(al)

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.5)
    dirLight.position.set(10, 10, 10)
    this.scene.add(dirLight)
  }

  addStarts() {
    const particles = new THREE.BufferGeometry()
    const particlesCount = 50000

    const posArray = new Float32Array(particlesCount * 3)
    //xyz xyz xyz xyz

    for (let i = 0; i < particlesCount; i++) {
      posArray[i] = (Math.random() - 0.5) * 200
    }

    particles.setAttribute('position', new THREE.BufferAttribute(posArray, 3))

    const material = new THREE.PointsMaterial({
      size: 0.005,
    })
    const particleMesh = new THREE.Points(particles, material)
    this.scene.add(particleMesh)
  }

  resize() {
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.camera.updateProjectionMatrix()
    this.camera.aspect = window.innerWidth / window.innerHeight
  }

  render() {
    this.scene.traverse((child) => {
      if (child instanceof THREE.Mesh && this.initAnimation) {
        if (child.name === 'sun') {
          child.rotation.y += 0.003
          if ((child.rotation.y += 0.003) === 0.006) {
            speechSynthesis.speak(new SpeechSynthesisUtterance("Despegue"));
          }
        }

        if (child.name === 'earth') {
          child.rotation.y += 0.005
          this.earthPosition = child.position
        }

        if (child.name === 'moon') {
          this.moonGroup.rotation.y += 0.005
          this.moonGroup.children[0].rotation.y += 0.01
        }

        if (child.name === 'satelite') {
          this.sateliteGroup.rotation.y += 0.005
            this.sateliteGroup.children[0].rotation.z += 0.01
        }
      }
      // if(this.counter < 0 && this.initAnimation) {
      //   speechSynthesis.speak(new SpeechSynthesisUtterance("Despegue"));
      // }
    })

    this.controls.update()
    this.renderer.render(this.scene, this.camera)
  }
}

window.addEventListener('DOMContentLoaded', () => {
  const app = new ARExperience()
  app.initScene()
})
