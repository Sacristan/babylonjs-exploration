import * as BABYLON from 'babylonjs' //remove

const degreesToRadians: number = 0.0174533
const birdStartRotationX: number = -90 * degreesToRadians

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

const aniomateBird = (
  bird: BABYLON.Mesh,
  scene: BABYLON.Scene,
  onAnimationEnd?: () => void
): void => {
  animate(bird, scene, 2, 'rotation.x', birdStartRotationX, 0, onAnimationEnd)
}

const animateDoor = (
  door: BABYLON.Mesh,
  scene: BABYLON.Scene,
  onAnimationEnd?: () => void
): void => {
  animate(door, scene, 3, 'rotation.y', 0, -155 * degreesToRadians, onAnimationEnd)
}

const animateKey = (key: BABYLON.Mesh, scene: BABYLON.Scene, onAnimationEnd?: () => void): void => {
  animate(key, scene, 2, 'rotation.z', 0, Math.PI * 2, onAnimationEnd)
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
    this._camera.maxZ = 8

    this._camera.attachControl(this._canvas, false)

    BABYLON.SceneLoader.Append(
      '',
      '../assets/unity_export/clockScene.babylon',
      this._scene,
      scene => {
        scene.executeWhenReady(function() {
          let key: BABYLON.Mesh = new BABYLON.Mesh('dummyMesh')
          let door: BABYLON.Mesh = new BABYLON.Mesh('dummyMesh')
          let mask: BABYLON.Mesh = new BABYLON.Mesh('dummyMesh')
          let bird: BABYLON.Mesh = new BABYLON.Mesh('dummyMesh')

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

          setTimeout(() => {
            animateKey(key, scene, () => animateDoor(door, scene, () => aniomateBird(bird, scene)))
            // animateDoor(door, scene)
          }, 1000)

          // animateKey(key, scene)
          // animateDoor(door, scene)
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
