import gsap from 'gsap'
import { Color, Euler, Group, Mesh, MeshBasicMaterial, PlaneBufferGeometry, Quaternion, SpotLight, sRGBEncoding, TextureLoader, Vector3 } from "three"
import { CSS3DObject } from "three/examples/jsm/renderers/CSS3DRenderer"
import image1 from '../assets/1.jpg'
import image2 from '../assets/2.jpg'
import image3 from '../assets/3.jpg'
import image4 from '../assets/4.jpg'
import image5 from '../assets/5.jpg'
import image6 from '../assets/6.jpg'
import image7 from '../assets/7.jpg'
import image8 from '../assets/8.jpg'
import image9 from '../assets/9.jpg'
import * as Vibrant from 'node-vibrant'

const ARTWORK_OFFSET_X = 5
const ARTWORK_OFFSET_Z = 4
const ARTWORK_SCALE_INACTIVE = 4
const ARTWORK_ACTIVE_POINT_LIGHT_TARGET_Z = -.5

export class Slider {

    constructor(scene, isMobile) {
        this.activeIndex = null
        this.isMobile = isMobile
        this.leftQuaternion = new Quaternion().setFromEuler(new Euler(0, Math.PI * .5, 0))
        this.rightQuaternion = new Quaternion().setFromEuler(new Euler(0, Math.PI * -.5, 0))
        this.centerQuaternion = new Quaternion()
        this.slider = new Group()
        this.slider.position.z = 0
        const pictureGeometry = new PlaneBufferGeometry()
        const textureLoader = new TextureLoader()
        const images = [
            image1,
            image2,
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
            this.createSlide(pictureGeometry, textureLoader, images, i, slideDomElements, scene)
        }
        scene.add(this.slider)
    }

    createSlide(pictureGeometry, textureLoader, images, i, slideDomElements, scene) {
        const pictureMaterial = new MeshBasicMaterial()
        const mesh = new Mesh(pictureGeometry, pictureMaterial)
        const slide = new Group()
        textureLoader.load(images[i], texture => {
            texture.encoding = sRGBEncoding
            const { width, height } = texture.image
            pictureMaterial.map = texture
            if (width < height)
                mesh.scale.set(texture.image.width / texture.image.height, 1, 1)
            else
                mesh.scale.set(1, texture.image.height / texture.image.width, 1)

            this.createVibrantColorLight(texture.image.src, slide, scene, this.activeIndex === i)
        })
        slide.add(mesh)
        const css3DObject = this.createCSS3DObject(slideDomElements[i])
        mesh.position.x = -.5
        slide.add(css3DObject)
        const spotLight = new SpotLight()
        slide.add(spotLight)
        slide.add(spotLight.target)
        this.positionCSS3DObject(slide)
        this.slider.add(slide)
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
            this.setSpotLightTargetPositionZ(child, 0, withAnimation)
            this.setArtworkCentered(child, true, withAnimation)
        })
        leftIndices.forEach((pictureIndex, i) => {
            const child = this.slider.children[pictureIndex]
            this.setPosition(child, -ARTWORK_OFFSET_X, -1, -i * ARTWORK_SCALE_INACTIVE - ARTWORK_OFFSET_Z, withAnimation)
            this.setScale(child, 4, withAnimation)
            this.setQuaternion(child, this.leftQuaternion, withAnimation)
            this.setSpotLightTargetPositionZ(child, 0, withAnimation)
            this.setArtworkCentered(child, true, withAnimation)
        })

        const activeChild = this.slider.children[activeIndex]
        activeChild.children[1].element.classList.add('active')
        this.setPosition(activeChild, 0, 0, -4, withAnimation)
        this.setScale(activeChild, 4, withAnimation)
        this.setQuaternion(activeChild, this.centerQuaternion, withAnimation)
        this.setSpotLightTargetPositionZ(activeChild, ARTWORK_ACTIVE_POINT_LIGHT_TARGET_Z, withAnimation)
        this.setArtworkCentered(activeChild, false, withAnimation)
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

    setArtworkCentered(group, isCentered, withAnimation = true) {
        const centeredPosition = new Vector3()
        const offsetPositionDesktop = new Vector3(-.5, 0, 0)
        const offsetPositionMobile = new Vector3(0, .5, 0)
        const offsetPosition = this.isMobile ? offsetPositionMobile : offsetPositionDesktop
        const targetPosition = isCentered ? centeredPosition : offsetPosition
        const mesh = group.children[0]
        const spotLight = group.children[2]
        if (withAnimation) {
            const { x, y, z } = targetPosition
            gsap.to(mesh.position, { duration: .5, x, y, z })
            if (spotLight)
                gsap.to(spotLight.position, { duration: 1, x, y, z })
        } else {
            mesh.position.copy(targetPosition)
            if (spotLight)
                spotLight.position.copy(targetPosition)
        }
    }

    setSpotLightTargetPositionZ(child, z, withAnimation) {
        const spotLight = child.children[2]
        const target = spotLight.target
        if (withAnimation) {
            gsap.to(target.position, { duration: 1, z })
        } else {
            target.position.z = z
        }
    }

    createCSS3DObject(element) {
        const css3dObject = new CSS3DObject(element)
        css3dObject.scale.set(0.007, 0.007, 1)
        return css3dObject
    }

    positionCSS3DObject(slide) {
        const offsetPositionDesktop = new Vector3(.5, 0, 0)
        const offsetPositionMobile = new Vector3(0, -.5, 0)
        const offsetPosition = this.isMobile ? offsetPositionMobile : offsetPositionDesktop
        slide.children[1].position.copy(offsetPosition)
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
                const spotLight = group.children[2]
                spotLight.color = color
                spotLight.intensity = 10
                spotLight.angle = Math.PI * 0.2
                spotLight.position.copy(artwork.position)
                spotLight.target.position.copy(artwork.position)
                spotLight.target.position.y = -1
                spotLight.decay = .3
                spotLight.penumbra = 1
                if (isActive)
                    spotLight.target.position.z = ARTWORK_ACTIVE_POINT_LIGHT_TARGET_Z
            }
        )
    }

    onResize(isMobile) {
        this.isMobile = isMobile
        this.slider.children.forEach(slide => {
            const isActiveSlide = this.slider.children[this.activeIndex] === slide
            this.positionCSS3DObject(slide)
            this.setArtworkCentered(slide, !isActiveSlide, false)
        })
    }
}