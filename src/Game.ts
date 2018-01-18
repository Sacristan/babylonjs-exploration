import * as BABYLON from 'babylonjs'
import { Vector3 } from 'babylonjs'

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

    this._light = new BABYLON.DirectionalLight(
      'DirectionalLight',
      new Vector3(0, -1, 0),
      this._scene
    )
    new BABYLON.SpotLight('spotLight', camPos, new BABYLON.Vector3(0, 0, -1), 10, 1, this._scene)

    BABYLON.SceneLoader.Append(
      '',
      '../assets/unity_export/clockScene.babylon',
      this._scene,
      scene => {
        scene.executeWhenReady(function() {
          console.log('Loading Done')
        })
      }
    )
  }

  doRender(): void {
    // run the render loop
    this._engine.runRenderLoop(() => {
      this._scene.render()
    })

    // the canvas/window resize event handler
    window.addEventListener('resize', () => {
      this._engine.resize()
    })
  }
}

export default Game
