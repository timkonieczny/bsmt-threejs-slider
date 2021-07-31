import './style.css'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import * as dat from 'dat.gui'
import gsap from 'gsap'
import { AmbientLight, Group, Mesh, MeshBasicMaterial, PerspectiveCamera, PlaneBufferGeometry, Scene, WebGLRenderer } from "three"

/**
 * Base
 */
// Debug
const gui = new dat.GUI()

const gltfLoader = new GLTFLoader()

gltfLoader.load("/models/Tunnel.glb", gltf => {
    console.log(gltf)
    scene.add(gltf.scene)
})

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new Scene()

const light = new AmbientLight(0xffffff, 5.0)
scene.add(light)

const slider = new Group()
const pictureMaterial = new MeshBasicMaterial()
const pictureGeometry = new PlaneBufferGeometry()
const numberOfPictures = 11
for (let i = 0; i < 11; i++) {
    slider.add(new Mesh(pictureGeometry, pictureMaterial))
}
scene.add(slider)

const previousPicture = _ => {
    gsap.to(slider.position, { duration: 1, x: -1 })
}
const nextPicture = _ => {
    gsap.to(slider.position, { duration: 1, x: 1 })
}

const rearrangePictures = activeIndex => {
    const leftIndices = []
    for (let i = 0; i < Math.floor(slider.children.length * .5); i++) {
        leftIndices.push((activeIndex + i + 1) % numberOfPictures)
    }
    const rightIndices = []
    for (let i = 0; i < Math.floor(slider.children.length * .5); i++) {
        let index = activeIndex - i - 1
        index = index < 0 ? index + numberOfPictures : index
        rightIndices.push(index)
    }
}

const previousButton = document.querySelector(".previous")
const nextButton = document.querySelector(".next")
let activePicture = 0
previousButton.addEventListener("click", _ => {
    activePicture -= 1
    activePicture = activePicture < 0 ? activePicture + numberOfPictures : activePicture
    rearrangePictures(activePicture)
    previousPicture()
})
nextButton.addEventListener("click", _ => {
    activePicture += 1
    activePicture %= numberOfPictures
    rearrangePictures(activePicture)
    nextPicture()
})

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
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(0, 0, 1)
scene.add(camera)

/**
 * Renderer
 */
const renderer = new WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const tick = () => {
    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()