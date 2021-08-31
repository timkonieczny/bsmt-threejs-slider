import './style.css'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import * as dat from 'dat.gui'
import { AmbientLight, Fog, PerspectiveCamera, Scene, WebGLRenderer } from "three"
import { Slider } from "./slider"
import { CSS3DRenderer } from "three/examples/jsm/renderers/CSS3DRenderer"

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

const light = new AmbientLight(0xffffff, 5.0)
scene.add(light)


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

/**
 * Renderer
 */
const renderer = new WebGLRenderer({
    canvas: canvas
})
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