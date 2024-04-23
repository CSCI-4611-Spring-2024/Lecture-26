/* Lecture 26: Orthographic and Isometric Projection
 * CSCI 4611, Spring 2024, University of Minnesota
 * Instructor: Evan Suma Rosenberg <suma@umn.edu>
 * License: Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 */ 

import * as gfx from 'gophergfx'
import { GUI } from 'dat.gui'

export class App extends gfx.GfxApp
{
    public projectionMode: string;

    // Perspective camera parameters
    public verticalFov: number;
    public aspectRatio: number;

    // Orthographic camera parameters
    public orthoWidth: number;
    public orthoHeight: number;

    // Shared camera parameters
    public nearClip: number;
    public farClip: number;

    private cameraControls: gfx.OrbitControls;

    // --- Create the App class ---
    constructor()
    {
        // initialize the base class gfx.GfxApp
        super();

        this.cameraControls = new gfx.OrbitControls(this.camera); 

        this.projectionMode = 'Perspective';

        // This initializes a camera that won't show anything.
        // We are going to manually compute the projection matrix.
        this.camera.projectionMatrix.setIdentity();

        this.verticalFov = 60;
        this.aspectRatio = 1.777;
        this.nearClip = 1;
        this.farClip = 2000;

        this.orthoWidth = 800;
        this.orthoHeight = 450.196;
    }


    // --- Initialize the graphics scene ---
    createScene(): void 
    {
        // Initialize the camera using our custom projection matrix
        this.setCameraProjection();

        // Configure camera controls
        this.cameraControls.setDistance(600);
        this.cameraControls.zoomSpeed = 10;

        // Create the scene lighting
        const sceneLight = new gfx.DirectionalLight();
        sceneLight.ambientIntensity.set(0.5, 0.5, 0.5);
        sceneLight.diffuseIntensity.set(0.5, 0.5, 0.5);
        sceneLight.position.set(1, 1, -1);
        this.scene.add(sceneLight);

        // Create the skybox material
        const skyboxMaterial = new gfx.UnlitMaterial();
        skyboxMaterial.color.set(0.749, 0.918, 0.988);
        skyboxMaterial.side = gfx.Side.BACK;

        // Add the skybox to the scene
        const skybox = gfx.Geometry3Factory.createBox(1000, 1000, 1000);
        skybox.material = skyboxMaterial;
        this.scene.add(skybox);

        // Create the ground material
        const groundMaterial = new gfx.UnlitMaterial();
        groundMaterial.setColor(new gfx.Color(0.5, 0.5, 0.5));

        // Add the ground mesh to the scene
        const ground = gfx.Geometry3Factory.createBox(510, 1, 510);
        ground.position.set(0, -.5, 0);
        ground.material = groundMaterial;
        this.scene.add(ground);

        const column = gfx.Geometry3Factory.createBox(15, 1, 15);
        for(let i=-250; i <= 250; i+=20)
        {
            for(let j=-250; j <= 250; j+=20)
            {
                const columnHeight = Math.random() * 55 + 5;
                
                const columnInstance = column.createInstance();
                columnInstance.position.set(i, columnHeight/2, j);
                columnInstance.scale.set(1, columnHeight, 1);

                const columnMaterial = new gfx.GouraudMaterial();
                columnMaterial.setColor(new gfx.Color(Math.random(), Math.random(), Math.random()));
                columnInstance.material = columnMaterial;

                this.scene.add(columnInstance);
            }
        }

        this.createGUI();
    }

    
    private createGUI(): void
    {
        // Create the GUI
        const gui = new GUI();
        gui.width = 200;

        const projectionController = gui.add(this, 'projectionMode', [
            'Perspective',
            'Orthographic',
            'Isometric'
        ]);
        projectionController.name('Projection');
        projectionController.onChange(()=>{ this.setCameraProjection() });

        const nearClipController = gui.add(this, 'nearClip');
        nearClipController.onChange(()=>{ this.setCameraProjection() });

        const farClipController = gui.add(this, 'farClip');
        farClipController.onChange(()=>{ this.setCameraProjection() });

        const perspectiveControls = gui.addFolder('Perspective Camera Settings');
        perspectiveControls.open();

        const fovController = perspectiveControls.add(this, 'verticalFov');
        fovController.onChange(()=>{ this.setCameraProjection() });

        const aspectRatioController = perspectiveControls.add(this, 'aspectRatio');
        aspectRatioController.onChange(()=>{ this.setCameraProjection() });

        const orthographicControls = gui.addFolder('Orthographic Camera Settings');
        orthographicControls.open();

        const orthoWidthController = orthographicControls.add(this, 'orthoWidth');
        orthoWidthController.onChange(()=>{ this.setCameraProjection() });

        const orthoHeightController = orthographicControls.add(this, 'orthoHeight');
        orthoHeightController.onChange(()=>{ this.setCameraProjection() });
    }

    
    // --- Update is called once each frame by the main graphics loop ---
    update(deltaTime: number): void 
    {
        this.cameraControls.update(deltaTime);
    }


    private setCameraProjection(): void
    {
        if(this.projectionMode == 'Perspective')
        {
            const n = this.nearClip;
            const f = this.farClip;

            const top = n * Math.tan(gfx.MathUtils.degreesToRadians(this.verticalFov)/2);
            const bottom = -top;
            const right = top * this.aspectRatio;
            const left = -right;

            this.camera.projectionMatrix.setRowMajor(
                (2 * n) / (right-left), 0, (right + left) / (right - left), 0,
                0, (2 * n) / (top - bottom), (top + bottom) / (top - bottom), 0,
                0, 0, -(f + n) / (f - n), (-2 * f * n) / (f - n),
                0, 0, -1, 0
            );
        }

        // Resize the viewport based on the camera aspect ratio
        this.resize();
    }


    // Override the default resize event handler
    resize(): void
    {
        this.renderer.resize(window.innerWidth, window.innerHeight, this.aspectRatio);
    }

}