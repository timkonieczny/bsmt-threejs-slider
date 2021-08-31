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
            const div = window.document.createElement('div')
            div.classList.add('text')
            div.innerHTML = `this is content`
            const text = new CSS3DObject(div)
            mesh.position.x = -.5
            text.position.x = .5
            text.scale.set(0.01, 0.01, 1)
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
}