import { EffectComposer } from './Dependencies/postprocessing/EffectComposer.js';
import { RenderPass } from './Dependencies/postprocessing/RenderPass.js';
import { UnrealBloomPass } from './Dependencies/postprocessing/UnrealBloomPass.js';
import { Clock, FogExp2, Vector2 } from './Dependencies/three.module.js';
import { WEBGL } from './Dependencies/WebGLCheck.js';
import "./Dependencies/three.min.js";
import "./Dependencies/GLTFLoader.js";

try {
    if (WEBGL.isWebGL2Available()) {
        background = document.getElementById("background");

        //Camera setup
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, .5, 20);
        camera.position.z = 7.5;

        //Renderer setup
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setClearColor(0x001233);
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        background.appendChild(renderer.domElement);
        window.addEventListener("resize", function() {
            const width = window.innerWidth
            || document.documentElement.clientWidth
            || document.body.clientWidth;
            const height = window.innerHeight
            || document.documentElement.clientHeight
            || document.body.clientHeight;
            renderer.setSize(width, height);
            composer.setSize(width, height);

            camera.aspect = width / height;
            camera.updateProjectionMatrix();
        });

        //Make main scene
        const backgroundScene = new THREE.Scene();
        backgroundScene.fog = new FogExp2(0x001233, .1);
        //Add main logo
        new THREE.GLTFLoader()
        .load("../static/3DResources/Logo3D.glb", function(gltf) { backgroundScene.add(gltf.scene); });

        //Post processing
        const composer = new EffectComposer(renderer);
        composer.addPass(new RenderPass(backgroundScene, camera));
        const bloom = new UnrealBloomPass(new Vector2(window.innerWidth, window.innerHeight), .75, .4, 0.1);
        composer.addPass(bloom);

        //Add lights
        const ambientLight = new THREE.AmbientLight(0x5FADFC, .3),
        pointLight = new THREE.PointLight(0xf4f4f6, 1);
        backgroundScene.add(pointLight);
        backgroundScene.add(ambientLight);

        //Other variables
        let mousePos = new Vector2(),
        lastFrame = null,
        moveSpeed,
        scrollSensitivity,
        maxMoveSpeed,
        animate;
        const clock = new Clock();

        if (Math.random() > .5) {
            //Add floor
            const floorMat = new THREE.MeshLambertMaterial({ color: 0xF4F4F4, wireframe: true });
            const floorWidth = 20;
            const floorHeight = 20;
            const floorRes = 1;
            const floor = new THREE.PlaneGeometry(floorWidth, floorHeight, floorWidth / floorRes, floorHeight / floorRes);
            const floorMesh = new THREE.Mesh(floor, floorMat);
            floorMesh.rotateX(-(Math.PI / 2));
            floorMesh.translateZ(-3);
            backgroundScene.add(floorMesh);

            const noiseScale = .3,
            height = .5,
            incline = .8;
            let position = 0;
            moveSpeed = 1;
            scrollSensitivity = 0.002;
            maxMoveSpeed = 4;
            noise.seed(Math.random());

            animate = function(delta) {
                position += delta * moveSpeed;
                floor.vertices.forEach(function(vertex) {
                    const xMult = Math.abs(vertex.x * incline);
                    if (xMult == 0) {
                        vertex.setZ(0);
                        return;
                    }
                    const z = noise.normalize(noise.perlin(vertex.x * noiseScale, (vertex.y + position) * noiseScale));
                    vertex.setZ(z * xMult * height);
                });
                floor.verticesNeedUpdate = true;
            }
        }
        else 
        {
            //Material setup
            const whiteMat = new THREE.MeshPhongMaterial({ color: 0x454E5E, shininess: 0, flatShading: true });
            const lightMat = new THREE.MeshPhongMaterial({ color: 0x0466C8, shininess: 0, flatShading: true });
            const darkMat = new THREE.MeshPhongMaterial({ color: 0x024FA1, shininess: 0, flatShading: true });
     
            //Create floating shapes
            const box = new THREE.BoxGeometry(1, 1, 1);
            const cone = new THREE.ConeGeometry(.5, 1, 10);
            const torus = new THREE.TorusGeometry(1, .25, 10, 10);
            const sphere = new THREE.SphereGeometry(.5, 10, 10);
            const cylinder = new THREE.CylinderGeometry(.5, .5, 1, 10, 10);
     
            const shapesGroup = new THREE.Group();
            backgroundScene.add(shapesGroup);
            const box1 = new THREE.Mesh(box, whiteMat);
            box1.position.set(-3, .6, 1.5);
            box1.rotation.set(-106, -10, -66);
            shapesGroup.add(box1);
            const box2 = new THREE.Mesh(box, whiteMat);
            box2.position.set(4, -1, -4);
            box2.rotation.set(25, 70, -41);
            shapesGroup.add(box2);
            const box3 = new THREE.Mesh(box, darkMat);
            box3.position.set(2, -2, 2);
            box3.rotation.set(0, 18, 0);
            shapesGroup.add(box3);
     
            const cone1 = new THREE.Mesh(cone, whiteMat);
            cone1.position.set(-4, -4, -4);
            cone1.rotation.set(2, 0, 60);
            shapesGroup.add(cone1);
            const cone2 = new THREE.Mesh(cone, whiteMat);
            cone2.position.set(5, 5, -5);
            cone2.rotation.set(1, 0, 187);
            shapesGroup.add(cone2);
     
            const sphere1 = new THREE.Mesh(sphere, darkMat);
            sphere1.position.set(0, -2, 1);
            shapesGroup.add(sphere1);
            const sphere2 = new THREE.Mesh(sphere, whiteMat);
            sphere2.position.set(-2, 7, -6);
            shapesGroup.add(sphere2);
            const sphere3 = new THREE.Mesh(sphere, lightMat);
            sphere3.position.set(-4, 2, -2);
            shapesGroup.add(sphere3);
     
            const cylinder1 = new THREE.Mesh(cylinder, whiteMat);
            cylinder1.position.set(2, 2, -2.5);
            cylinder1.rotation.set(-56, 72, 0);
            shapesGroup.add(cylinder1);
            const cylinder2 = new THREE.Mesh(cylinder, lightMat);
            cylinder2.position.set(-3, -2, 0);
            cylinder2.rotation.set(12, 34, 56);
            shapesGroup.add(cylinder2);
     
            const torus1 = new THREE.Mesh(torus, darkMat);
            torus1.position.set(-2, 2, -4);
            torus1.rotation.set(45, 180, 45);
            shapesGroup.add(torus1);
            const torus2 = new THREE.Mesh(torus, darkMat);
            torus2.position.set(1.5, 1, 3);
            torus2.rotation.set(180, 90, 0);
            shapesGroup.add(torus2);
 
            const indiSpeed = .6;
            moveSpeed = -.6;
            scrollSensitivity = 0.001;
            maxMoveSpeed = 1;
    
            animate = function(delta) {
                //Animation code
                shapesGroup.children.forEach(function(element) { element.rotateY(delta * indiSpeed); });
                shapesGroup.rotateY(delta * moveSpeed);
            }
        }

        function render() {
            animate(clock.getDelta());
            composer.render(backgroundScene, camera);
            lastFrame = requestAnimationFrame(render);
        };
        if (showBackground)
            lastFrame = requestAnimationFrame(render);
        //Move camera and look towards the logo
        document.addEventListener("mousemove", function(e) {
            if (showBackground) {
                mousePos.set((e.clientX / viewport.vw) * 2 - 1, -(e.clientY / viewport.vh) * 2 + 1);
                gsap.to(camera.position, { 
                    x: mousePos.x,
                    y: mousePos.y,
                    duration: .75, ease: "Power2.out", overwrite:'auto',
                    onUpdate: function() { camera.lookAt(0, 0, 0); }
                });
            }
        });
        document.addEventListener("wheel", function(e) {
            if (showBackground) {
                moveSpeed += e.deltaY * scrollSensitivity;
                moveSpeed = gsap.utils.clamp(-maxMoveSpeed, maxMoveSpeed, moveSpeed);
            }
        });
        toggle3D = function(toggle) {
            if (showBackground == toggle)
                return;
            showBackground = toggle;
            if (showBackground) {
                lastFrame = requestAnimationFrame(render);
                gsap.to(renderer.domElement, { autoAlpha: 1, duration: .5, ease: "Power2.out" });
            }
            else {
                cancelAnimationFrame(lastFrame);
                gsap.to(renderer.domElement, { autoAlpha: 0, duration: .5, ease: "Power2.out" });
            }
        };
        support3D = true;
    }
} catch(error) {
    console.log(error);
    support3D = false;
}