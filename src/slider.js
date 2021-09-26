import gsap from 'gsap'
import { Color, Euler, Group, Mesh, MeshBasicMaterial, PlaneBufferGeometry, Quaternion, SpotLight, sRGBEncoding, TextureLoader, Vector3 } from "three"
import { CSS3DObject } from "three/examples/jsm/renderers/CSS3DRenderer"
// TODO: use correct image URLs
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

const INACTIVE_SLIDE_POSITION = new Vector3(5, -1, 4)
const SLIDE_SCALE = 4
const SLIDE_LIGHT_TARGET_Z = -.1
const SLIDE_LIGHT_INTENSITY_DEFAULT = 10
const SLIDE_LIGHT_INTENSITY_HIGHLIGHT = 100
const SLIDE_CTA_LIGHT_INTENSITY_HIGHLIGHT = 100
const ACTIVE_SLIDE_MESH_POSITION = {
    desktop: new Vector3(-.5, 0, 0),
    mobile: new Vector3(0, .25, 0)
}
const INACTIVE_SLIDE_MESH_POSITION = new Vector3()
const SLIDE_TEXT_POSITION = {
    desktop: new Vector3(.5, 0, 0),
    mobile: new Vector3(0, -.25, 0)
}
const ANIMATION_DURATION = 1
const SLIDE_TEXT_SCALE = 0.007

// Handles slider functionality: Creating the slider and updating the scene on slide change
export class Slider {

    constructor(scene, isMobile) {
        this.activeIndex = null
        this.isMobile = isMobile
        this.leftWallQuaternion = new Quaternion().setFromEuler(new Euler(0, Math.PI * .5, 0))
        this.rightWallQuaternion = new Quaternion().setFromEuler(new Euler(0, Math.PI * -.5, 0))
        this.activeSlideQuaternion = new Quaternion()
        this.slider = new Group()
        this.artworkGeometry = new PlaneBufferGeometry()
        this.textureLoader = new TextureLoader()
        const imageUrls = [
            image1,
            image2,
            image3,
            image4,
            image5,
            // image6,
            // image7,
            // image8,
            // image9,
        ]
        this.numberOfPictures = imageUrls.length
        // The DOM elements are grabbed here and paired with the artwork slides.
        // There should be the same number of DOM elements and images
        const slideDomElements = document.querySelector(".gallery-3d__slides").children
        for (let i = 0; i < this.numberOfPictures; i++) {
            this.createSlide(imageUrls[i], slideDomElements[i])
        }
        scene.add(this.slider)
    }

    // Creates a slide, including the artwork mesh and the spot light.
    // It also adds the DOM element so that it can be 3D transformed.
    createSlide(imageUrl, domElement) {
        const artworkMaterial = new MeshBasicMaterial()
        const artworkMesh = new Mesh(this.artworkGeometry, artworkMaterial)
        const slide = new Group()
        this.slider.add(slide)
        this.textureLoader.load(imageUrl, texture => {
            texture.encoding = sRGBEncoding
            const { width, height } = texture.image
            artworkMaterial.map = texture
            if (width < height)
                artworkMesh.scale.set(texture.image.width / texture.image.height, 1, 1)
            else
                artworkMesh.scale.set(1, texture.image.height / texture.image.width, 1)

            // This updates the spot light color after the texture has finished loading
            this.updateSlideSpotLight(imageUrl, slide, this.isActiveSlide(slide))
        })
        slide.add(artworkMesh)
        const css3DObject = this.createCSS3DObject(domElement)
        // artworkMesh.position.x = -.5
        slide.add(css3DObject)
        const spotLight = new SpotLight()
        spotLight.intensity = SLIDE_LIGHT_INTENSITY_DEFAULT
        spotLight.angle = Math.PI * 0.2
        const artwork = this.getMesh(slide)

        spotLight.position.copy(artwork.position)
        spotLight.target.position.copy(artwork.position)
        spotLight.target.position.y = -1
        spotLight.decay = .3
        spotLight.penumbra = 1

        slide.add(spotLight)
        slide.add(spotLight.target)
        // const ctaSpotLight = new SpotLight()
        // ctaSpotLight.intensity = SLIDE_CTA_LIGHT_INTENSITY_HIGHLIGHT
        // ctaSpotLight.color.set(0xff3b7e)
        // ctaSpotLight.position.x = .5
        // ctaSpotLight.position.y = 0
        // ctaSpotLight.target.position.z = SLIDE_LIGHT_TARGET_Z
        // ctaSpotLight.target.position.x = ctaSpotLight.position.x
        // ctaSpotLight.target.position.y = -1
        // ctaSpotLight.angle = Math.PI * 0.1
        // ctaSpotLight.decay = .3
        // ctaSpotLight.penumbra = 1
        // slide.add(ctaSpotLight)
        // slide.add(ctaSpotLight.target)
        slide.scale.setScalar(SLIDE_SCALE)
        // this.positionCSS3DObject(slide)
    }

    // Sets the active slide and updates all other slides.
    // The animation can be disabled for initialization purposes
    setActiveSlide(activeIndex, withAnimation = true) {
        this.activeIndex = activeIndex
        const slides = this.slider.children
        slides.forEach(slide => {
            this.getCSS3DObject(slide).element.classList.remove('active')
        })

        // Grab the indices of all slides that will be on the right wall
        const rightIndices = []
        for (let i = 0; i < Math.floor(slides.length * .5); i++) {
            rightIndices.push((activeIndex + i + 1) % this.numberOfPictures)
        }
        // Grab the indices of all slides that will be on the left wall
        const leftIndices = []
        for (let i = 0; i < Math.floor(slides.length * .5); i++) {
            let index = activeIndex - i - 1
            index = index < 0 ? index + this.numberOfPictures : index
            leftIndices.push(index)
        }
        // Update all slides that will move to the right wall
        rightIndices.forEach((pictureIndex, i) => {
            const child = slides[pictureIndex]
            this.setPosition(child, INACTIVE_SLIDE_POSITION.x, INACTIVE_SLIDE_POSITION.y, -i * SLIDE_SCALE - INACTIVE_SLIDE_POSITION.z, withAnimation)
            this.setQuaternion(child, this.rightWallQuaternion, withAnimation)
            this.setSpotLightTargetPositionZ(child, 0, withAnimation)
            this.setSpotLightBrightness(child, SLIDE_LIGHT_INTENSITY_DEFAULT, withAnimation)
            // this.setCTASpotLightBrightness(child, 0, withAnimation)
            // this.setArtworkCentered(child, true, withAnimation)
        })
        // Update all slides that will move to the left wall
        leftIndices.forEach((pictureIndex, i) => {
            const child = slides[pictureIndex]
            this.setPosition(child, -INACTIVE_SLIDE_POSITION.x, INACTIVE_SLIDE_POSITION.y, -i * SLIDE_SCALE - INACTIVE_SLIDE_POSITION.z, withAnimation)
            this.setQuaternion(child, this.leftWallQuaternion, withAnimation)
            this.setSpotLightTargetPositionZ(child, 0, withAnimation)
            this.setSpotLightBrightness(child, SLIDE_LIGHT_INTENSITY_DEFAULT, withAnimation)
            // this.setCTASpotLightBrightness(child, 0, withAnimation)
            // this.setArtworkCentered(child, true, withAnimation)
        })

        // Update the active slide
        const activeSlide = slides[activeIndex]
        this.getCSS3DObject(activeSlide).element.classList.add('active')
        this.setPosition(activeSlide, 0, 0, -4, withAnimation)
        this.setQuaternion(activeSlide, this.activeSlideQuaternion, withAnimation)
        this.setSpotLightTargetPositionZ(activeSlide, SLIDE_LIGHT_TARGET_Z, withAnimation)
        this.setSpotLightBrightness(activeSlide, SLIDE_LIGHT_INTENSITY_HIGHLIGHT, withAnimation)
        // this.setCTASpotLightBrightness(activeSlide, SLIDE_CTA_LIGHT_INTENSITY_HIGHLIGHT, withAnimation)
        // this.setArtworkCentered(activeSlide, false, withAnimation)
    }

    // Helper function to update the position of a mesh with / without animation
    setPosition(mesh, x, y, z, withAnimation = true) {
        if (withAnimation) gsap.to(mesh.position, { duration: ANIMATION_DURATION, x, y, z })
        else mesh.position.set(x, y, z)
    }

    // Helper function to update the rotation (quaternion) of a mesh with / without animation
    setQuaternion(mesh, quaternion, withAnimation = true) {
        if (withAnimation) {
            const animationObject = { interpolator: 0 }
            gsap.to(animationObject, {
                duration: ANIMATION_DURATION,
                interpolator: 1,
                onUpdateParams: [mesh.quaternion.clone()],
                onUpdate(startQuaternion) {
                    mesh.quaternion.slerpQuaternions(startQuaternion, quaternion, animationObject.interpolator)
                }
            })
        } else mesh.quaternion.copy(quaternion)
    }

    // Moves the artwork (mesh) within a slide depending on if it's active
    // and if a mobile / desktop layout is used
    setArtworkCentered(slide, isCentered, withAnimation = true) {
        const offsetPosition = this.isMobile ? ACTIVE_SLIDE_MESH_POSITION.mobile : ACTIVE_SLIDE_MESH_POSITION.desktop
        const targetPosition = isCentered ? INACTIVE_SLIDE_MESH_POSITION : offsetPosition
        const mesh = this.getMesh(slide)
        const spotLight = this.getSpotLight(slide)
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

    // Sets the z position of the spot light target of a given slide
    setSpotLightTargetPositionZ(slide, z, withAnimation) {
        const spotLight = this.getSpotLight(slide)
        const target = spotLight.target
        if (withAnimation) gsap.to(target.position, { duration: 1, z })
        else target.position.z = z
    }

    // Sets the intensity of a spot light of a given slide
    setSpotLightBrightness(slide, intensity, withAnimation) {
        const spotLight = this.getSpotLight(slide)
        if (withAnimation) gsap.to(spotLight, { duration: 1, intensity })
        else spotLight.intensity = intensity
    }

    // Sets the intensity of a CTA spot light of a given slide
    setCTASpotLightBrightness(slide, intensity, withAnimation) {
        const ctaSpotLight = this.getCTASpotLight(slide)
        if (withAnimation) gsap.to(ctaSpotLight, { duration: 1, intensity })
        else ctaSpotLight.intensity = intensity
    }

    // Takes a DOM element and creates a CSS3DObject from it that will be transformed by Threejs
    createCSS3DObject(domElement) {
        const css3dObject = new CSS3DObject(domElement)
        css3dObject.scale.set(SLIDE_TEXT_SCALE, SLIDE_TEXT_SCALE, 1)
        return css3dObject
    }

    // Sets a slide's text positoin depending on the layout used (mobile / desktop)
    positionCSS3DObject(slide) {
        const offsetPosition = this.isMobile ? SLIDE_TEXT_POSITION.mobile : SLIDE_TEXT_POSITION.desktop
        this.getCSS3DObject(slide).position.copy(offsetPosition)
    }

    // Updates a slide's spot light color based on the slide's artwork's vibrant color.
    updateSlideSpotLight(imageUrl, slide, isActive) {
        Vibrant.from(imageUrl).getPalette(
            (_err, palette) => {
                const color = new Color(palette.Vibrant.hex)
                color.offsetHSL(0, 1, 0)
                const artwork = this.getMesh(slide)
                const spotLight = this.getSpotLight(slide)
                spotLight.color = color
                if (isActive)
                    spotLight.target.position.z = SLIDE_LIGHT_TARGET_Z
            }
        )
    }

    // Resize callback
    onResize(isMobile) {
        this.isMobile = isMobile
        this.slider.children.forEach(slide => {
            const isActiveSlide = this.isActiveSlide(slide)
            // this.positionCSS3DObject(slide)
            this.setArtworkCentered(slide, !isActiveSlide, false)
        })
    }

    // Returns true if the given slide is active
    isActiveSlide(slide) {
        return this.slider.children[this.activeIndex] === slide
    }

    // Returns a slide's CSS3DObject
    getCSS3DObject(slide) {
        return slide.children[1]
    }

    // Returns a slide's spot light
    getSpotLight(slide) {
        return slide.children[2]
    }
    // Returns a slide's  CTA spot light
    getCTASpotLight(slide) {
        return slide.children[4]
    }

    // Returns a slide's artwork mesh
    getMesh(slide) {
        return slide.children[0]
    }
}