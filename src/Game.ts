import * as BABYLON from 'babylonjs' //remove

const animate = (
  mesh: BABYLON.Mesh,
  scene: BABYLON.Scene,
  time: number,
  propertyName: string,
  endFramePropertyValue: number,
  onAnimationEnd?: () => void
) => {
  const fps: number = 30
  const totalFrames = fps * time

  var animation = new BABYLON.Animation(
    mesh + 'Animation',
    propertyName,
    fps,
    BABYLON.Animation.ANIMATIONTYPE_FLOAT,
    BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
  )

  var easingFunction = new BABYLON.SineEase()
  easingFunction.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT)
  animation.setEasingFunction(easingFunction)

  var keys = []

  keys.push({
    frame: 0,
    value: 0
  })

  keys.push({
    frame: totalFrames,
    value: endFramePropertyValue
  })

  animation.setKeys(keys)

  mesh.animations = []
  mesh.animations.push(animation)

  scene.beginAnimation(mesh, 0, totalFrames, false, undefined, onAnimationEnd)
}

const animateDoor = (door: BABYLON.Mesh, scene: BABYLON.Scene): void => {
  animate(door, scene, 3, 'rotation.y', -155 * 0.0174533)
}

const animateKey = (key: BABYLON.Mesh, scene: BABYLON.Scene, onAnimationEnd?: () => void): void => {
  animate(key, scene, 2, 'rotation.z', Math.PI * 2, onAnimationEnd)
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
          var key: BABYLON.Mesh = new BABYLON.Mesh('dummyMesh')
          var door: BABYLON.Mesh = new BABYLON.Mesh('dummyMesh')

          for (let mesh of scene.meshes) {
            switch (mesh.name) {
              case 'key':
                key = mesh as BABYLON.Mesh
                break
              case 'door_right':
                door = mesh as BABYLON.Mesh
                break
            }

            if (mesh.material) {
              let mat: BABYLON.StandardMaterial = mesh.material as BABYLON.StandardMaterial
              mat.emissiveColor = new BABYLON.Color3(1, 1, 1)
            }
          }

          setTimeout(() => {
            animateKey(key, scene, () => animateDoor(door, scene))
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
