import './style.css'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import * as dat from 'dat.gui'
import gsap from 'gsap'
import { AmbientLight, Color, Group, Mesh, MeshBasicMaterial, PerspectiveCamera, PlaneBufferGeometry, Scene, WebGLRenderer } from "three"

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
const pictureGeometry = new PlaneBufferGeometry()
const numberOfPictures = 11
for (let i = 0; i < 11; i++) {
    const pictureMaterial = new MeshBasicMaterial({ color: new Color(Math.random(), Math.random(), Math.random()) })
    slider.add(new Mesh(pictureGeometry, pictureMaterial))
}
scene.add(slider)

const rearrangePictures = (activeIndex, withAnimation = true) => {
    const rightIndices = []
    for (let i = 0; i < Math.floor(slider.children.length * .5); i++) {
        rightIndices.push((activeIndex + i + 1) % numberOfPictures)
    }
    const leftIndices = []
    for (let i = 0; i < Math.floor(slider.children.length * .5); i++) {
        let index = activeIndex - i - 1
        index = index < 0 ? index + numberOfPictures : index
        leftIndices.push(index)
    }
    rightIndices.forEach((pictureIndex, i) => {
        const child = slider.children[pictureIndex]
        setPosition(child, 2, 0, -i - 1, withAnimation)
    })
    leftIndices.forEach((pictureIndex, i) => {
        const child = slider.children[pictureIndex]
        setPosition(child, -2, 0, -i - 1, withAnimation)
    })

    const activeChild = slider.children[activeIndex]
    setPosition(activeChild, 0, 1, 0, withAnimation)
}

const setPosition = (mesh, x, y, z, withAnimation = true) => {
    if (withAnimation) {
        gsap.to(mesh.position, { duration: 1, x, y, z })
    } else {
        mesh.position.set(x, y, z)
    }
}

const previousButton = document.querySelector(".previous")
const nextButton = document.querySelector(".next")
let activePicture = 0
previousButton.addEventListener("click", _ => {
    activePicture -= 1
    activePicture = activePicture < 0 ? activePicture + numberOfPictures : activePicture
    rearrangePictures(activePicture)
})
nextButton.addEventListener("click", _ => {
    activePicture += 1
    activePicture %= numberOfPictures
    rearrangePictures(activePicture)
})

rearrangePictures(activePicture, false)

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
gui.add(camera.position, "x", -2, 2, 0.001).name("camera x")

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