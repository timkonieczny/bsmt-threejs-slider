import './style.css'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import * as dat from 'dat.gui'
import { ACESFilmicToneMapping, AmbientLight, Fog, Group, Mesh, MeshBasicMaterial, PerspectiveCamera, PlaneBufferGeometry, RectAreaLight, Scene, sRGBEncoding, Vector2, Vector3, WebGLRenderer } from "three"
import { Slider } from "./slider"
import { CSS3DRenderer } from "three/examples/jsm/renderers/CSS3DRenderer"
import { RectAreaLightHelper } from "three/examples/jsm/helpers/RectAreaLightHelper"

const clearColor = 0x000000

/**
 * Base
 */
// Debug
const gui = new dat.GUI()

const gltfLoader = new GLTFLoader()

gltfLoader.load("/models/Tunnel.glb", gltf => {
    const tunnel = gltf.scene
    const tunnel2 = tunnel.clone()
    scene.add(tunnel)
    scene.add(tunnel2)
    tunnel.position.z = -10
    tunnel2.position.z = -45
    gui.add(tunnel.position, "z", -20, 20, 0.001).name("tunnel z")
    gui.add(tunnel2.position, "z", -100, 0, 0.001).name("tunnel2 z")
})

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new Scene()
scene.fog = new Fog(clearColor, 15, 45)

const ambientLight = new AmbientLight(0xffffff, 5.0)
scene.add(ambientLight)

const lightDimensions = new Vector2(.8, 2.1)
const rectAreaLightGeometry = new PlaneBufferGeometry(lightDimensions.x, lightDimensions.y, 1, 1)
const rectAreaLightMaterial = new MeshBasicMaterial({ color: 0xffffff })
const createCeilingLight = () => {
    const rectAreaLight = new RectAreaLight(0xffffff, 1, lightDimensions.x, lightDimensions.y)
    const rectAreaLightGroup = new Group()
    rectAreaLightGroup.add(rectAreaLight)
    const rectAreaLightMesh = new Mesh(rectAreaLightGeometry, rectAreaLightMaterial)
    rectAreaLightGroup.add(rectAreaLightMesh)
    rectAreaLightGroup.rotation.x = Math.PI / 2
    rectAreaLightGroup.position.set(0, 4.8, 0)
    return rectAreaLightGroup
}

const ceilingLight1 = createCeilingLight()
ceilingLight1.position.z = -6.3
scene.add(ceilingLight1)
const ceilingLight2 = createCeilingLight()
ceilingLight2.position.z = -14.4
scene.add(ceilingLight2)
const ceilingLight3 = createCeilingLight()
ceilingLight3.position.z = -26.8
scene.add(ceilingLight3)

const slider = new Slider(scene)
const numberOfPictures = slider.numberOfPictures

const previousButton = document.querySelector(".previous")
const nextButton = document.querySelector(".next")
let activePicture = 0
previousButton.addEventListener("click", _ => {
    activePicture -= 1
    activePicture = activePicture < 0 ? activePicture + numberOfPictures : activePicture
    slider.rearrangePictures.call(slider, activePicture)
})
nextButton.addEventListener("click", _ => {
    activePicture += 1
    activePicture %= numberOfPictures
    slider.rearrangePictures.call(slider, activePicture)
})

slider.rearrangePictures.call(slider, activePicture, false)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () => {
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    cssRenderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(0, 0, 1)
scene.add(camera)
gui.add(camera.position, "x", -2, 2, 0.001).name("camera x")
gui.add(camera.position, "z", -30, 10, 0.001).name("camera z")

/**
 * Renderer
 */
const renderer = new WebGLRenderer({
    canvas: canvas
})
renderer.setClearColor(clearColor)
renderer.physicallyCorrectLights = true
renderer.outputEncoding = sRGBEncoding
renderer.toneMapping = ACESFilmicToneMapping
const cssRenderer = new CSS3DRenderer()

renderer.setSize(sizes.width, sizes.height)
cssRenderer.setSize(sizes.width, sizes.height)
cssRenderer.domElement.style.position = 'absolute'
cssRenderer.domElement.style.top = '0px'
cssRenderer.domElement.style.left = '0px'
cssRenderer.domElement.style.pointerEvents = 'none'
document.body.appendChild(cssRenderer.domElement)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))


/**
 * Animate
 */
const tick = () => {
    // Render
    renderer.render(scene, camera)
    cssRenderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()