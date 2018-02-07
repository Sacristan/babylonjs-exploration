import * as BABYLON from 'babylonjs' //remove

const degreesToRadians: number = 0.0174533
const birdStartRotationX: number = -90 * degreesToRadians
const doorOpenRotationY: number = -155 * degreesToRadians

class Game {
  private _canvas: HTMLCanvasElement
  private _engine: BABYLON.Engine
  private _scene: BABYLON.Scene
  private _camera: BABYLON.Camera
  private _light: BABYLON.Light

  protected key: BABYLON.Mesh
  private door: BABYLON.Mesh
  private mask: BABYLON.Mesh
  private bird: BABYLON.Mesh
  private controller_mesh: BABYLON.Mesh

  private music: BABYLON.Sound

  constructor(canvasElement: string) {
    // Create canvas and engine
    this._canvas = document.getElementById(canvasElement) as HTMLCanvasElement
    this._engine = new BABYLON.Engine(this._canvas, true)
  }

  animate(
    mesh: BABYLON.Mesh,
    time: number,
    propertyName: string,
    startFramePropertyValue: number,
    endFramePropertyValue: number,
    onAnimationEnd?: () => void
  ): void {
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

    this._scene.beginAnimation(mesh, 0, totalFrames, false, undefined, onAnimationEnd)
  }

  animateBird(onAnimationEnd?: () => void): void {
    this.animate(this.bird, 2, 'rotation.x', birdStartRotationX, 0, onAnimationEnd)
  }

  openDoor(onAnimationEnd?: () => void): void {
    this.animate(this.door, 3, 'rotation.y', 0, doorOpenRotationY, onAnimationEnd)
    this.music.play()
    this.music.onended = () => this.closeDoor(() => this.enableControls())
  }

  closeDoor(onAnimationEnd?: () => void): void {
    this.animate(this.door, 3, 'rotation.y', doorOpenRotationY, 0, onAnimationEnd)
  }

  turnKey(onAnimationEnd?: () => void): void {
    this.animate(this.key, 2, 'rotation.z', 0, Math.PI * 2, onAnimationEnd)
  }

  startExperience(): void {
    this.turnKey(() => this.openDoor(() => this.animateBird()))
  }

  enableControls(): void {
    if (!this.controller_mesh.actionManager) {
      this.controller_mesh.actionManager = new BABYLON.ActionManager(this._scene)
    }

    this.controller_mesh.actionManager.registerAction(
      new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, () => {
        if (this.controller_mesh.actionManager) this.controller_mesh.actionManager.actions = []
        this.startExperience()
      })
    )
  }

  createController(): void {
    this.controller_mesh = BABYLON.MeshBuilder.CreateBox(
      'box',
      { width: 0.5, height: 0.75, depth: 0.25 },
      this._scene
    )
    let mat = new BABYLON.StandardMaterial('boxMat', this._scene)
    mat.alpha = 0

    this.controller_mesh.material = mat
  }

  sceneReady(): void {
    console.log('sceneReady')

    this.createController()

    for (var i = 0; i < this._scene.meshes.length; i++) {
      let mesh: BABYLON.Mesh = this._scene.meshes[i] as BABYLON.Mesh
      console.log(mesh.name)

      switch (mesh.name) {
        case 'key':
          this.key = mesh
          break
        case 'door_right':
          this.door = mesh
          break
        case 'mask':
          this.mask = mesh
          break
        case 'snowball':
          this.bird = mesh
          this.bird.rotation.x = birdStartRotationX
          break
      }

      if (mesh.material) {
        let mat: BABYLON.StandardMaterial = mesh.material as BABYLON.StandardMaterial
        mat.emissiveColor = new BABYLON.Color3(1, 1, 1)
      }
    }

    let mat: BABYLON.StandardMaterial = this.mask.material as BABYLON.StandardMaterial
    mat.alpha = 0

    this.music = new BABYLON.Sound(
      'Music',
      '../assets/audio/day1.mp3',
      this._scene,
      () => this.enableControls(),
      { loop: false, autoplay: false }
    )
  }

  createScene(): void {
    this._scene = new BABYLON.Scene(this._engine)

    var camPos: BABYLON.Vector3 = new BABYLON.Vector3(0, 0.5, 1.5)

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
        scene.executeWhenReady(() => this.sceneReady())
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
