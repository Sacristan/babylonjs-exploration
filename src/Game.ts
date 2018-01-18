import * as BABYLON from 'babylonjs'
import { Vector3, Mesh } from 'babylonjs'

class Game {
  private _canvas: HTMLCanvasElement
  private _engine: BABYLON.Engine
  private _scene: BABYLON.Scene
  private _camera: BABYLON.FreeCamera
  private _light: BABYLON.Light

  constructor(canvasElement: string) {
    // Create canvas and engine
    this._canvas = document.getElementById(canvasElement) as HTMLCanvasElement
    this._engine = new BABYLON.Engine(this._canvas, true)
  }

  createScene(): void {
    var camPos: BABYLON.Vector3 = new BABYLON.Vector3(0, 0.5, 1.5)

    this._scene = new BABYLON.Scene(this._engine)
    this._camera = new BABYLON.FreeCamera('camera1', camPos, this._scene)

    //Near / Far Clipping Planes
    this._camera.minZ = 0.3
    this._camera.maxZ = 100

    this._camera.setTarget(BABYLON.Vector3.Zero())
    this._camera.attachControl(this._canvas, false)

    BABYLON.SceneLoader.Append(
      '',
      '../assets/unity_export/clockScene.babylon',
      this._scene,
      scene => {
        scene.executeWhenReady(function() {
          console.log('Loading Done')

          for (let mesh of scene.meshes) {
            if (mesh.material) {
              let mat: BABYLON.StandardMaterial = mesh.material as BABYLON.StandardMaterial
              mat.emissiveColor = new BABYLON.Color3(1, 1, 1)

              console.log(mat.name)
            }
          }
        })
      }
    )

    // let sphere = BABYLON.MeshBuilder.CreateSphere(
    //   'sphere1',
    //   { segments: 16, diameter: 0.1 },
    //   this._scene
    // )

    // sphere.position = new Vector3(-1, 0, 0)
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
