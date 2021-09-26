import './style.css'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { ACESFilmicToneMapping, AmbientLight, Fog, Group, Mesh, MeshBasicMaterial, PerspectiveCamera, PlaneBufferGeometry, PointLight, Scene, sRGBEncoding, Vector2, WebGLRenderer } from "three"
import { Slider } from "./slider"
import { CSS3DRenderer } from "three/examples/jsm/renderers/CSS3DRenderer"
import gsap from 'gsap'

const CLEAR_COLOR = 0x000000

/**
 * Base
 */

const gltfLoader = new GLTFLoader()

gltfLoader.load("/models/Tunnel.glb", gltf => {
    const tunnel = gltf.scene
    const tunnel2 = tunnel.clone()
    tunnel.position.z = -10
    tunnel2.position.z = -45
    // sceneGroup.add(tunnel, tunnel2)
    sceneGroup.add(tunnel)
})

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new Scene()
scene.fog = new Fog(CLEAR_COLOR, 80, 120)

const sceneGroup = new Group()
sceneGroup.scale.multiplyScalar(2)
scene.add(sceneGroup)

const debug = {
    ambientLightColor: 0xff7b2f,
    ceilingLightColor: 0x706d6d,
    ceilingLightIntensity: 5
}

const ambientLight = new AmbientLight(debug.ambientLightColor, 2.0)
sceneGroup.add(ambientLight)

const lightDimensions = new Vector2(.8, 2.1)
const ceilingLightGeometry = new PlaneBufferGeometry(lightDimensions.x, lightDimensions.y, 1, 1)
const ceilingLightMaterial = new MeshBasicMaterial({ color: 0xc2d2f0 })
const createCeilingLight = () => {
    const ceilingLight = new PointLight(debug.ceilingLightColor, debug.ceilingLightIntensity)
    const ceilingLightGroup = new Group()
    ceilingLightGroup.add(ceilingLight)
    const ceilingLightMesh = new Mesh(ceilingLightGeometry, ceilingLightMaterial)
    ceilingLightGroup.add(ceilingLightMesh)
    ceilingLightGroup.rotation.x = Math.PI / 2
    ceilingLightGroup.position.set(0, 4.8, 0)
    return ceilingLightGroup
}

const ceilingLight1 = createCeilingLight()
ceilingLight1.position.z = -6.3
sceneGroup.add(ceilingLight1)
const ceilingLight2 = createCeilingLight()
ceilingLight2.position.z = -14.4
sceneGroup.add(ceilingLight2)
const ceilingLight3 = createCeilingLight()
ceilingLight3.position.z = -26.8
sceneGroup.add(ceilingLight3)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

const slider = new Slider(sceneGroup, true)
const numberOfPictures = slider.numberOfPictures

const previousButton = document.querySelector(".previous")
const nextButton = document.querySelector(".next")
let activePicture = 0
previousButton.addEventListener("click", _ => {
    activePicture -= 1
    activePicture = activePicture < 0 ? activePicture + numberOfPictures : activePicture
    slider.setActiveSlide.call(slider, activePicture)
})
nextButton.addEventListener("click", _ => {
    activePicture += 1
    activePicture %= numberOfPictures
    slider.setActiveSlide.call(slider, activePicture)
})

slider.setActiveSlide.call(slider, activePicture, false)

window.addEventListener('resize', () => {
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    css3dRenderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    // TODO: pass true here if mobile layout should be used
    // slider.onResize(sizes.width < sizes.height)
})

/**
 * Camera
 */
// Base camera
const camera = new PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(0, 0, 2)
scene.add(camera)
// TODO: remove mousemove effect if it's not needed
window.addEventListener('mousemove', event => {
    const { clientX, clientY } = event
    const x = ((clientX / sizes.width) * 2 - 1) * .1
    const y = ((clientY / sizes.height) * -2 + 1) * .1
    gsap.to(camera.position, { duration: .5, x, y })
})

/**
 * Renderer
 */
const renderer = new WebGLRenderer({
    canvas: canvas,
    antialias: window.devicePixelRatio >= 2 ? false : true
})
renderer.setClearColor(CLEAR_COLOR)
renderer.physicallyCorrectLights = true
renderer.outputEncoding = sRGBEncoding
renderer.toneMapping = ACESFilmicToneMapping
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

const css3dRenderer = new CSS3DRenderer()
css3dRenderer.setSize(sizes.width, sizes.height)
css3dRenderer.domElement.style.position = 'absolute'
css3dRenderer.domElement.style.top = '0px'
css3dRenderer.domElement.style.left = '0px'
css3dRenderer.domElement.style.pointerEvents = 'none'
document.body.appendChild(css3dRenderer.domElement)


/**
 * Animate
 */
const tick = () => {
    // Render
    renderer.render(scene, camera)
    css3dRenderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()