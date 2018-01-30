import * as BABYLON from 'babylonjs' //remove

const degreesToRadians: number = 0.0174533
const birdStartRotationX: number = -90 * degreesToRadians
const doorOpenRotationY: number = -155 * degreesToRadians

let key: BABYLON.Mesh
let door: BABYLON.Mesh
let mask: BABYLON.Mesh
let bird: BABYLON.Mesh
let music: BABYLON.Sound

const animate = (
  mesh: BABYLON.Mesh,
  scene: BABYLON.Scene,
  time: number,
  propertyName: string,
  startFramePropertyValue: number,
  endFramePropertyValue: number,
  onAnimationEnd?: () => void
) => {
  const fps: number = 30
  const totalFrames = fps * time

  const animation = new BABYLON.Animation(
    mesh + 'Animation',
    propertyName,
    fps,
    BABYLON.Animation.ANIMATIONTYPE_FLOAT,
    BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
  )

  const easingFunction = new BABYLON.SineEase()
  easingFunction.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT)
  animation.setEasingFunction(easingFunction)

  const keys = [
    {
      frame: 0,
      value: startFramePropertyValue
    },
    {
      frame: totalFrames,
      value: endFramePropertyValue
    }
  ]

  animation.setKeys(keys)

  mesh.animations = [animation]

  scene.beginAnimation(mesh, 0, totalFrames, false, undefined, onAnimationEnd)
}

const animateBird = (scene: BABYLON.Scene, onAnimationEnd?: () => void): void => {
  animate(bird, scene, 2, 'rotation.x', birdStartRotationX, 0, onAnimationEnd)
}

const openDoor = (scene: BABYLON.Scene, onAnimationEnd?: () => void): void => {
  animate(door, scene, 3, 'rotation.y', 0, doorOpenRotationY, onAnimationEnd)
  music.play()
  music.onended = () => closeDoor(scene)
}

const closeDoor = (scene: BABYLON.Scene): void => {
  animate(door, scene, 3, 'rotation.y', doorOpenRotationY, 0)
}

const turnKey = (scene: BABYLON.Scene, onAnimationEnd?: () => void): void => {
  animate(key, scene, 2, 'rotation.z', 0, Math.PI * 2, onAnimationEnd)
}
const experience = (scene: BABYLON.Scene): void => {
  setTimeout(() => {
    turnKey(scene, () => openDoor(scene, () => animateBird(scene)))
  }, 1000)
}

class Game {
  private _canvas: HTMLCanvasElement
  private _engine: BABYLON.Engine
  private _scene: BABYLON.Scene
  private _camera: BABYLON.Camera
  private _light: BABYLON.Light

  constructor(canvasElement: string) {
    // Create canvas and engine
    this._canvas = document.getElementById(canvasElement) as HTMLCanvasElement
    this._engine = new BABYLON.Engine(this._canvas, true)
  }

  createScene(): void {
    this._scene = new BABYLON.Scene(this._engine)

    var camPos: BABYLON.Vector3 = new BABYLON.Vector3(0, 0.5, 1.5)

    // let freeCam: BABYLON.FreeCamera = new BABYLON.FreeCamera('camera1', camPos, this._scene)
    // freeCam.setTarget(BABYLON.Vector3.Zero())

    let cam = new BABYLON.ArcRotateCamera(
      'arcCamera',
      0,
      0,
      10,
      BABYLON.Vector3.Zero(),
      this._scene
    )
    cam.setPosition(camPos)

    this._camera = cam as BABYLON.Camera

    //Near / Far Clipping Planes
    this._camera.minZ = 0.3
    this._camera.maxZ = 200

    this._camera.attachControl(this._canvas, false)

    BABYLON.SceneLoader.Append(
      '',
      '../assets/unity_export/clockScene.babylon',
      this._scene,
      scene => {
        scene.executeWhenReady(function() {
          // key = new BABYLON.Mesh('dummyMesh')
          // door = new BABYLON.Mesh('dummyMesh')
          // mask = new BABYLON.Mesh('dummyMesh')
          // bird = new BABYLON.Mesh('dummyMesh')

          for (let mesh of scene.meshes) {
            console.log(mesh.name)

            switch (mesh.name) {
              case 'key':
                key = mesh as BABYLON.Mesh
                break
              case 'door_right':
                door = mesh as BABYLON.Mesh
                break
              case 'mask':
                mask = mesh as BABYLON.Mesh
                break
              case 'snowball':
                bird = mesh as BABYLON.Mesh
                bird.rotation.x = birdStartRotationX
                break
            }

            if (mesh.material) {
              let mat: BABYLON.StandardMaterial = mesh.material as BABYLON.StandardMaterial
              mat.emissiveColor = new BABYLON.Color3(1, 1, 1)
            }
          }

          let mat: BABYLON.StandardMaterial = mask.material as BABYLON.StandardMaterial
          mat.alpha = 0

          music = new BABYLON.Sound(
            'Music',
            '../assets/audio/day1.mp3',
            scene,
            () => experience(scene),
            { loop: false, autoplay: false }
          )
        })
      }
    )
  }

  doRender(): void {
    this._engine.runRenderLoop(() => {
      this._scene.render()
    })

    window.addEventListener('resize', () => {
      this._engine.resize()
    })
  }
}

export default Game
