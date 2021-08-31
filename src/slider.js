import gsap from 'gsap'
import { Color, Euler, Group, Mesh, MeshBasicMaterial, PlaneBufferGeometry, Quaternion } from "three"
import { CSS3DObject } from "three/examples/jsm/renderers/CSS3DRenderer"

export class Slider {

    constructor(scene) {
        this.leftQuaternion = new Quaternion().setFromEuler(new Euler(0, Math.PI * .5, 0))
        this.rightQuaternion = new Quaternion().setFromEuler(new Euler(0, Math.PI * -.5, 0))
        this.centerQuaternion = new Quaternion()
        this.slider = new Group()
        const pictureGeometry = new PlaneBufferGeometry()
        this.numberOfPictures = 11
        for (let i = 0; i < this.numberOfPictures; i++) {
            const pictureMaterial = new MeshBasicMaterial({ color: new Color(Math.random(), Math.random(), Math.random()) })
            const mesh = new Mesh(pictureGeometry, pictureMaterial)
            const group = new Group()
            group.add(mesh)
            const text = this.createCSS3DObject('Mickey', '50X75CM', 'Jaw drop Acrylic, enamel & spray paint on canvas with pearlescent teeth and gold bling')
            mesh.position.x = -.5
            group.add(text)
            this.slider.add(group)
        }
        scene.add(this.slider)
    }

    rearrangePictures(activeIndex, withAnimation = true) {
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
            this.setPosition(child, 2, 0, -i - 1, withAnimation)
            this.setQuaternion(child, this.rightQuaternion, withAnimation)
        })
        leftIndices.forEach((pictureIndex, i) => {
            const child = this.slider.children[pictureIndex]
            this.setPosition(child, -2, 0, -i - 1, withAnimation)
            this.setQuaternion(child, this.leftQuaternion, withAnimation)
        })

        const activeChild = this.slider.children[activeIndex]
        activeChild.children[1].element.classList.add('active')
        this.setPosition(activeChild, 0, 0, 0, withAnimation)
        this.setQuaternion(activeChild, this.centerQuaternion, withAnimation)
    }

    setPosition(mesh, x, y, z, withAnimation = true) {
        if (withAnimation) {
            gsap.to(mesh.position, { duration: 1, x, y, z })
        } else {
            mesh.position.set(x, y, z)
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

    createCSS3DObject(line1, line2, line3) {
        const element = window.document.createElement('div')
        element.classList.add('text')
        element.appendChild(this.createSpan(line1, 'headline'))
        element.appendChild(this.createSpan(line2, 'size'))
        element.appendChild(this.createSpan(line3, 'description'))
        element.appendChild(this.createButton())
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
}