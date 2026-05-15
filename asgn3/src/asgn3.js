// Vertex shader program
var VSHADER_SOURCE = `
    precision mediump float;
    attribute vec4 a_Position;
    attribute vec2 a_UV;
    varying vec2 v_UV;
    uniform mat4 u_ModelMatrix;
    uniform mat4 u_ViewMatrix;
    uniform mat4 u_ProjectionMatrix;
    void main() {
        gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_ModelMatrix * a_Position;
        v_UV = a_UV;
    }`

// Fragment shader program
var FSHADER_SOURCE = `
    precision mediump float;
    varying vec2 v_UV;
    uniform vec4 u_FragColor;
    uniform sampler2D u_Sampler0;
    uniform sampler2D u_Sampler1;
    uniform int u_whichTexture;
    void main() {
        if (u_whichTexture == -2) {
            gl_FragColor = u_FragColor;  // Use color
        } else if (u_whichTexture == -1) {
            gl_FragColor = vec4(v_UV, 1.0, 1.0);  // Use UV debug color
        } else if (u_whichTexture == 0) {
            gl_FragColor = texture2D(u_Sampler0, v_UV);  // Use texture0
        } else if (u_whichTexture == 1) {
            gl_FragColor = texture2D(u_Sampler1, v_UV);  // Use texture1
        } else {
            gl_FragColor = vec4(1.0, 0.2, 0.2, 1.0);  // Show error in redish color
        }
    }`

// Global variables
let canvas;
let gl;
let a_Position;
let a_UV;
let u_FragColor;
let u_ModelMatrix;
let u_ProjectionMatrix;
let u_ViewMatrix;
let u_Sampler0;
let u_Sampler1;
let u_whichTexture;

function setupWebGL() {
    // Retrieve <canvas> element
    canvas = document.getElementById('webgl');

    // Get the rendering context for WebGL
    gl = canvas.getContext("webgl", { preserveDrawingBuffer: true });
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }

    gl.enable(gl.DEPTH_TEST);
}

function connectVariablesToGLSL() {
    // Initialize shaders
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to intialize shaders.');
        return;
    }

    // Get the storage location of a_Position
    a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
        return;
    }

    // Get the storage location of a_UV
    a_UV = gl.getAttribLocation(gl.program, 'a_UV');
    if (a_UV < 0) {
        console.log('Failed to get the storage location of a_UV');
        return;
    }

    // Get the storage location of u_FragColor
    u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    if (!u_FragColor) {
        console.log('Failed to get the storage location of u_FragColor');
        return;
    }

    // Get the storage location of u_ModelMatrix
    u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
    if (!u_ModelMatrix) {
        console.log('Failed to get the storage location of u_ModelMatrix');
        return;
    }

    // Get storage location of u_ViewMatrix
    u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
    if (!u_ViewMatrix) {
        console.log('Failed to get the storage location of u_ViewMatrix');
        return;
    }

    // Get storage location of u_ProjectionMatrix
    u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
    if (!u_ProjectionMatrix) {
        console.log('Failed to get the storage location of u_ProjectionMatrix');
        return;
    }

    // Get the storage location of u_Sampler0
    u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
    if (!u_Sampler0) {
        console.log('Failed to get the storage location of u_Sampler0');
        return false;
    }

    // Get the storage location of u_Sampler1
    u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
    if (!u_Sampler1) {
        console.log('Failed to get the storage location of u_Sampler1');
        return false;
    }

    // Get the storage location of u_whichTexture
    u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
    if (!u_whichTexture) {
        console.log('Failed to get the storage location of u_whichTexture');
        return false;
    }

    // Set an initial value for this matrix to identity
    var identityM = new Matrix4();
    gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
}

function main() {
    // Setup canvas and gl context
    setupWebGL();

    // Setup GLSL shader programs and connect GLSL variables
    connectVariablesToGLSL();

    // Setup camera
    g_camera = new Camera();

    document.onkeydown = keydown;

    document.onmousemove = mousemove;

    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    initTextures();
    drawMap();

    requestAnimationFrame(tick);
}

var g_map = [
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,2,2,2,2,2,2,2,2,2,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0], 
	[0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0], 
	[0,0,0,0,0,0,0,0,0,0,0,0,2,2,2,0,0,0,2,2,2,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
];

const walls = [];
function drawMap() {
    for (var i = 0; i < g_map.length; i++) {
        for (var j = 0; j < g_map[0].length; j++) {
            const height = g_map[i][j];

            for (var k = 0; k < height; k++) {
                var cube = new Cube();
                cube.textureNum = 1;
                cube.matrix.translate(j - 16, k - 0.75, i - 24);
                walls.push(cube);
            }
        }
    }
}

function initTextures() {
    const image0 = new Image();  // Create the image object
    if (!image0) {
        console.log('Failed to create the image object');
        return false;
    }

    // Register the event handler to be called on loading an image
    image0.onload = function () {
        sendTextureToTEXTURE0(image0);
    };

    // Tell the browser to load an Image
    image0.src = 'grass-texture.jpg';
    
    // -----------------------------------------------------------------------------

    const image1 = new Image();  // Create the image object
    if (!image1) {
        console.log('Failed to create the image object');
        return false;
    }

    // Register the event handler to be called on loading an image
    image1.onload = function () {
        sendTextureToTEXTURE1(image1);
    };

    // Tell the browser to load an Image
    image1.src = 'log-texture.png';

    return true;
}

function sendTextureToTEXTURE0(image) {
    const texture = gl.createTexture();   // Create a texture object
    if (!texture) {
        console.log('Failed to create the texture object');
        return false;
    }

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
    
    gl.activeTexture(gl.TEXTURE0); // Enable texture unit0
    
    gl.bindTexture(gl.TEXTURE_2D, texture); // Bind the texture object to the target

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); // Set the texture parameters
    
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image); // Set the texture image
    
    gl.uniform1i(u_Sampler0, 0); // Set the texture0 to the sampler

    console.log('Texture0 loaded');
}

function sendTextureToTEXTURE1(image) {
    const texture = gl.createTexture();   // Create a texture object
    if (!texture) {
        console.log('Failed to create the texture object');
        return false;
    }

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
    
    gl.activeTexture(gl.TEXTURE1); // Enable texture unit1
    
    gl.bindTexture(gl.TEXTURE_2D, texture); // Bind the texture object to the target

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); // Set the texture parameters
    
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image); // Set the texture image
    
    gl.uniform1i(u_Sampler1, 1); // Set the texture1 to the sampler

    console.log('Texture1 loaded');
}

function renderAllShapes(time) {
    // Pass projection matrix
    var projectionMatrix = new Matrix4();
    projectionMatrix.setPerspective(60, canvas.width / canvas.height, 0.1, 100);
    gl.uniformMatrix4fv(u_ProjectionMatrix, false, projectionMatrix.elements);

    // Pass view matrix
    var viewMatrix = new Matrix4();
    viewMatrix.setLookAt(
        ...g_camera.eye.elements,
        ...g_camera.at.elements,
        ...g_camera.up.elements
    );
    gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Floor
    var floor = new Cube();
    floor.textureNum = 0;
    floor.matrix.translate(0, -0.75, 0);
    floor.matrix.scale(64, 0, 64);
    floor.matrix.translate(-0.5, 0, -0.5);
    floor.render();

    // Sky
    var sky = new Cube();
    sky.color = [0.5, 0.5, 1.0, 1.0];
    sky.matrix.scale(64, 64, 64);
    sky.matrix.translate(-0.5, -0.5, -0.5);
    sky.render();

    // --- DRAW SELECTION BOX (The Visual Reference) ---
    var target = getTargetBlockInfo();
    drawSelectionBox(target.ghostX, target.ghostY, target.ghostZ);

    // Walls
    for (const wall of walls) {
        wall.render();
    }

    // Zombies
    drawZombie(0.5, 2, -0.75, 5, 180, time);
    drawZombie(0.5, 2, -0.75, 4, 180, time);
    drawZombie(0.5, -1, -0.75, 5, 180, time);
    drawZombie(0.5, 0, -0.75, 5, 180, time);
    drawZombie(0.5, 4, -0.75, 5, 180, time);
}

// Calculates where the player is looking and returns Map Indices AND World Coordinates
function getTargetBlockInfo() {
    // 1. Calculate Forward Vector
    let fwd = new Vector3();
    fwd.set(g_camera.at).sub(g_camera.eye);
    fwd.normalize();

    // 2. Project a point in front of the camera (Raycast)
    let dist = 2.5; // Distance to reach in front of camera
    let targetX = g_camera.eye.elements[0] + fwd.elements[0] * dist;
    let targetY = g_camera.eye.elements[1] + fwd.elements[1] * dist;
    let targetZ = g_camera.eye.elements[2] + fwd.elements[2] * dist;

    // 3. Convert World Position to Map Indices
    // drawMap uses: X = j - 16, Z = i - 24
    // Inverse logic: j = X + 16, i = Z + 24
    let j = Math.floor(targetX + 16);
    let i = Math.floor(targetZ + 24);

    // 4. Determine the height of the stack at this location
    let h = 0; // Default to floor level if out of bounds
    if (i >= 0 && i < g_map.length && j >= 0 && j < g_map[0].length) {
        h = g_map[i][j];
    }

    // 5. Calculate World Coordinates for the "Ghost" Block
    // The new block sits on top of the stack.
    // Map height 0 -> World Y = -0.75
    // Map height 1 -> World Y =  0.25 (etc)
    let ghostX = j - 16;
    let ghostY = h - 0.75;
    let ghostZ = i - 24;

    return { i, j, ghostX, ghostY, ghostZ };
}

// Draws a red box to show where the block will be placed
function drawSelectionBox(x, y, z) {
    var box = new Cube();
    box.color = [1.0, 0.2, 0.2, 1.0]; // Bright Red
    box.matrix.translate(x, y, z);
    
    // Offset slightly and scale down to center the highlight inside the target block
    box.matrix.translate(0.04, 0.04, 0.04); 
    box.matrix.scale(0.92, 0.92, 0.92); 
    
    box.render();
}

function getMapCellAhead() {
    // Get forward direction
    let fwd = new Vector3();
    fwd.set(g_camera.at);
    fwd.sub(g_camera.eye);
    fwd.normalize();

    // Step one unit ahead of the camera
    let target = new Vector3();
    target.set(g_camera.eye);

    // Scale the forward vector and add it to eye position
    let projectionDist = 1.2;
    target.elements[0] += fwd.elements[0] * projectionDist;
    target.elements[1] += fwd.elements[1] * projectionDist;
    target.elements[2] += fwd.elements[2] * projectionDist;

    // Convert world position back to map indices (inverse of the translate in drawMap)
    const j = Math.floor(target.elements[0] + 16);  // x maps to columns (j)
    const i = Math.floor(target.elements[2] + 16);  // z maps to rows (i)

    return { i, j };
}

function rebuildWalls() {
    walls.length = 0;  // clear the array in place so renderAllShapes still sees it
    drawMap();
}

var g_camera;
function keydown(ev) {
    if (ev.key == 'w') {
        g_camera.forward();
    } else if (ev.key == 's') {
        g_camera.back();
    } else if (ev.key == 'a') {
        g_camera.left();
    } else if (ev.key == 'd') {
        g_camera.right();
    } else if (ev.key == 'q') {
        g_camera.rotateLeft();
    } else if (ev.key == 'e') {
        g_camera.rotateRight();
    } else if (ev.key == 'f') {
        const { i, j } = getTargetBlockInfo();
        if (i >= 0 && i < g_map.length && j >= 0 && j < g_map[0].length) {
            g_map[i][j] = Math.min(g_map[i][j] + 1, 4);
            rebuildWalls();
        }
    } else if (ev.key == 'g') {
        const { i, j } = getTargetBlockInfo();
        if (i >= 0 && i < g_map.length && j >= 0 && j < g_map[0].length) {
            g_map[i][j] = Math.max(g_map[i][j] - 1, 0);
            rebuildWalls();
        }
    }

    renderAllShapes();
    console.log(ev.key);
}

var lastMouseX = null;
function mousemove(ev) {
    const x = ev.clientX;

    if (!lastMouseX) {
        lastMouseX = x;
    }

    const deltaX = x - lastMouseX;
    g_camera.mousePan(deltaX);

    lastMouseX = x;
}

function tick() {
    // Get time in seconds
    let time = performance.now() / 1000;
    
	renderAllShapes(time);
	updateFPSCounter();
	requestAnimationFrame(tick);
}

let start = performance.now();
const fpsCounter = document.getElementById("fpsCounter");
function updateFPSCounter() {
	const ms = performance.now() - start;	// time in-between this frame and the last
	const fps = Math.floor(1000/ms);
	fpsCounter.innerHTML = `ms: ${ms}, fps: ${fps}`;
	start = performance.now();
}

// Define standard Minecraft Zombie Colors (normalized RGB 0.0 - 1.0)
const COL_ZOMBIE_SKIN = [0.22, 0.61, 0.34, 1.0];  // Sickly green
const COL_ZOMBIE_SHIRT = [0.11, 0.54, 0.54, 1.0]; // Cyan/Teal
const COL_ZOMBIE_PANTS = [0.24, 0.17, 0.44, 1.0]; // Dark blue/Purple

function drawZombie(scaleGlobal = 1.0, x = 0, y = -0.75, z = 0, rotY = 0, time = 0) {
    const P = 1.0 / 12.0; 
    
    // Animation Settings
    // Adjust 45 for width of step, adjust 8 for speed
    let limbSwing = Math.sin(time * 8) * 45; 

    var baseMatrix = new Matrix4();
    baseMatrix.translate(x, y, z);
    baseMatrix.rotate(rotY, 0, 1, 0);
    baseMatrix.scale(scaleGlobal, scaleGlobal, scaleGlobal);

    // --- Auxiliary function to reduce repetitive code ---
    function renderLimb(color, M_Limb, scaleXYZ, translateXYZ) {
        var limb = new Cube();
        limb.color = color;
        limb.textureNum = -2; // Tell fragment shader to use u_FragColor

        // Calculate final model matrix: BasePos * LimbSpecificTransform
        limb.matrix = new Matrix4(M_Limb); // Copy base/limb matrix
        limb.matrix.translate(translateXYZ[0], translateXYZ[1], translateXYZ[2]);
        limb.matrix.scale(scaleXYZ[0], scaleXYZ[1], scaleXYZ[2]);
        
        // Center the default unit cube (-0.5 to 0.5) so transformations are intuitive
        limb.matrix.translate(-0.5, -0.5, -0.5); 
        limb.render();
    }

    // =========================================================================
    // 1. Head (8x8x8 pixels)
    // =========================================================================
    var M_Head = new Matrix4(baseMatrix);
    // Position: Top of torso (legs 12px + torso 12px = 24px high)
    M_Head.translate(0, 24 * P, 0); 
    // Pivot: Bottom center of head
    renderLimb(COL_ZOMBIE_SKIN, M_Head, [8 * P, 8 * P, 8 * P], [0, 4 * P, 0]);

    // =========================================================================
    // 2. Torso (Body) (8x12x4 pixels)
    // =========================================================================
    var M_Torso = new Matrix4(baseMatrix);
    // Position: Top of legs (12px high)
    M_Torso.translate(0, 12 * P, 0);
    renderLimb(COL_ZOMBIE_SHIRT, M_Torso, [8 * P, 12 * P, 4 * P], [0, 6 * P, 0]);

    // =========================================================================
    // 3. Legs - ANIMATED
    // =========================================================================
    // Right Leg
    var M_LegR = new Matrix4(baseMatrix);
    M_LegR.translate(-2 * P, 12 * P, 0); // Move to Hip Joint
    M_LegR.rotate(limbSwing, 1, 0, 0);   // SWING BACK AND FORTH
    renderLimb(COL_ZOMBIE_PANTS, M_LegR, [4 * P, 12 * P, 4 * P], [0, -6 * P, 0]);

    // Left Leg
    var M_LegL = new Matrix4(baseMatrix);
    M_LegL.translate(2 * P, 12 * P, 0);  // Move to Hip Joint
    M_LegL.rotate(-limbSwing, 1, 0, 0);  // SWING OPPOSITE DIRECTION
    renderLimb(COL_ZOMBIE_PANTS, M_LegL, [4 * P, 12 * P, 4 * P], [0, -6 * P, 0]);

    // =========================================================================
    // 4. Arms - ADDING A "BOB"
    // =========================================================================
    // Zombies keep arms out, but we can add a slight bobbing for realism
    let armBob = Math.sin(time * 8) * 10;

    // Right Arm
    var M_ArmR = new Matrix4(baseMatrix);
    M_ArmR.translate(-6 * P, 22 * P, 0);
    M_ArmR.rotate(-90 + armBob, 1, 0, 0); // Constant 90 deg + slight oscillation
    renderLimb(COL_ZOMBIE_SKIN, M_ArmR, [4 * P, 12 * P, 4 * P], [0, -6 * P, 0]);

    // Left Arm
    var M_ArmL = new Matrix4(baseMatrix);
    M_ArmL.translate(6 * P, 22 * P, 0);
    M_ArmL.rotate(-90 - armBob, 1, 0, 0);
    renderLimb(COL_ZOMBIE_SKIN, M_ArmL, [4 * P, 12 * P, 4 * P], [0, -6 * P, 0]);
}