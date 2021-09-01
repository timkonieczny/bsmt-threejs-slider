import gsap from 'gsap'
import { Color, Euler, Group, Mesh, MeshBasicMaterial, MeshStandardMaterial, Object3D, PlaneBufferGeometry, PointLight, Quaternion, RectAreaLight, SpotLight, SpotLightHelper, sRGBEncoding, TextureLoader, Vector3 } from "three"
import { CSS3DObject } from "three/examples/jsm/renderers/CSS3DRenderer"
import image0 from '../assets/0.jpg'
import image1 from '../assets/1.jpg'
import image3 from '../assets/3.jpg'
import image4 from '../assets/4.jpg'
import image5 from '../assets/5.jpg'
import image6 from '../assets/6.jpg'
import image7 from '../assets/7.jpg'
import image8 from '../assets/0.jpg'
import image9 from '../assets/0.jpg'
import * as Vibrant from 'node-vibrant'
import { RectAreaLightHelper } from "three/examples/jsm/helpers/RectAreaLightHelper"

const ARTWORK_OFFSET_X = 5
const ARTWORK_OFFSET_Z = 4
const ARTWORK_SCALE_INACTIVE = 4
const ARTWORK_ACTIVE_POINT_LIGHT_TARGET_Z = -.5

export class Slider {

    constructor(scene) {
        this.activeIndex = null
        this.leftQuaternion = new Quaternion().setFromEuler(new Euler(0, Math.PI * .5, 0))
        this.rightQuaternion = new Quaternion().setFromEuler(new Euler(0, Math.PI * -.5, 0))
        this.centerQuaternion = new Quaternion()
        this.slider = new Group()
        this.slider.position.z = 0
        const pictureGeometry = new PlaneBufferGeometry()
        const textureLoader = new TextureLoader()
        const images = [
            image0,
            image1,
            image3,
            image4,
            image5,
            image6,
            image7,
            image8,
            image9,
        ]
        this.numberOfPictures = images.length
        const slideDomElements = document.querySelector(".gallery-3d__slides").children
        for (let i = 0; i < this.numberOfPictures; i++) {
            const pictureMaterial = new MeshBasicMaterial()
            const mesh = new Mesh(pictureGeometry, pictureMaterial)
            const group = new Group()
            textureLoader.load(images[i], texture => {
                texture.encoding = sRGBEncoding
                const { width, height } = texture.image
                pictureMaterial.map = texture
                if (width < height)
                    mesh.scale.set(texture.image.width / texture.image.height, 1, 1)
                else
                    mesh.scale.set(1, texture.image.height / texture.image.width, 1)

                this.createVibrantColorLight(texture.image.src, group, scene, this.activeIndex === i)
            })
            group.add(mesh)
            const css3DObject = this.createCSS3DObject(slideDomElements[i])
            mesh.position.x = -.5
            group.add(css3DObject)
            this.slider.add(group)
        }
        scene.add(this.slider)
    }

    rearrangePictures(activeIndex, withAnimation = true) {
        this.activeIndex = activeIndex
        this.slider.children.forEach(child => {
            child.children[1].element.classList.remove('active')
        })

        const rightIndices = []
        for (let i = 0; i < Math.floor(this.slider.children.length * .5); i++) {
            rightIndices.push((activeIndex + i + 1) % this.numberOfPictures)
        }
        const leftIndices = []
        for (let i = 0; i < Math.floor(this.slider.children.length * .5); i++) {
            let index = activeIndex - i - 1
            index = index < 0 ? index + this.numberOfPictures : index
            leftIndices.push(index)
        }
        rightIndices.forEach((pictureIndex, i) => {
            const child = this.slider.children[pictureIndex]
            this.setPosition(child, ARTWORK_OFFSET_X, -1, -i * ARTWORK_SCALE_INACTIVE - ARTWORK_OFFSET_Z, withAnimation)
            this.setScale(child, 4, withAnimation)
            this.setQuaternion(child, this.rightQuaternion, withAnimation)
            this.setPointLightTargetPositionZ(child, 0, withAnimation)
        })
        leftIndices.forEach((pictureIndex, i) => {
            const child = this.slider.children[pictureIndex]
            this.setPosition(child, -ARTWORK_OFFSET_X, -1, -i * ARTWORK_SCALE_INACTIVE - ARTWORK_OFFSET_Z, withAnimation)
            this.setScale(child, 4, withAnimation)
            this.setQuaternion(child, this.leftQuaternion, withAnimation)
            this.setPointLightTargetPositionZ(child, 0, withAnimation)
        })

        const activeChild = this.slider.children[activeIndex]
        activeChild.children[1].element.classList.add('active')
        this.setPosition(activeChild, 0, 0, -4, withAnimation)
        this.setScale(activeChild, 4, withAnimation)
        this.setQuaternion(activeChild, this.centerQuaternion, withAnimation)
        this.setPointLightTargetPositionZ(activeChild, ARTWORK_ACTIVE_POINT_LIGHT_TARGET_Z, withAnimation)
    }

    setPosition(mesh, x, y, z, withAnimation = true) {
        if (withAnimation) {
            gsap.to(mesh.position, { duration: 1, x, y, z })
        } else {
            mesh.position.set(x, y, z)
        }
    }

    setScale(mesh, scale, withAnimation = true) {
        if (withAnimation) {
            gsap.to(mesh.scale, { duration: 1, x: scale, y: scale, z: scale })
        } else {
            mesh.scale.set(scale, scale, scale)
        }
    }

    setQuaternion(mesh, quaternion, withAnimation = true) {
        if (withAnimation) {
            const animationObject = { interpolator: 0 }
            gsap.to(animationObject, {
                duration: 1,
                interpolator: 1,
                onUpdateParams: [mesh.quaternion.clone()],
                onUpdate(startQuaternion) {
                    mesh.quaternion.slerpQuaternions(startQuaternion, quaternion, animationObject.interpolator)
                }
            })
        } else {
            mesh.quaternion.copy(quaternion)
        }
    }

    setPointLightTargetPositionZ(child, z, withAnimation) {
        const pointLight = child.children[3]
        if (pointLight) {
            const target = pointLight.target
            if (withAnimation) {
                gsap.to(target.position, { duration: 1, z })
            } else {
                target.position.z = z
            }
        }
    }

    createCSS3DObject(element) {
        const css3dObject = new CSS3DObject(element)
        css3dObject.position.x = .5
        css3dObject.scale.set(0.007, 0.007, 1)
        return css3dObject
    }

    createSpan(text, className) {
        const span = window.document.createElement('span')
        span.innerText = text
        span.classList.add(className)
        return span
    }

    createButton() {
        const button = window.document.createElement('button')
        button.innerText = 'Explore the shop'
        return button
    }

    createVibrantColorLight(img, group, scene, isActive) {
        Vibrant.from(img).getPalette(
            (err, palette) => {
                const color = new Color(palette.Vibrant.hex)
                const artwork = group.children[0]
                const spotLight = new SpotLight(color, 10)
                spotLight.angle = Math.PI * 0.2
                spotLight.position.copy(artwork.position)
                group.add(spotLight.target)
                spotLight.target.position.copy(artwork.position)
                spotLight.target.position.y = -1
                spotLight.decay = .3
                spotLight.penumbra = 1
                group.add(spotLight)
                if (isActive)
                    spotLight.target.position.z = ARTWORK_ACTIVE_POINT_LIGHT_TARGET_Z
            }
        )
    }
}
// TODO: (mousemove effect)
// TODO: slide z offset when right or left