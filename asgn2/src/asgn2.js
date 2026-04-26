// Vertex shader program
var VSHADER_SOURCE = `
    attribute vec4 a_Position;
    uniform mat4 u_ModelMatrix;
    uniform mat4 u_GlobalRotateMatrix;
    uniform mat4 u_GlobalScaleMatrix;
    void main() {
        gl_Position = u_GlobalRotateMatrix * u_GlobalScaleMatrix * u_ModelMatrix * a_Position;
    }`

// Fragment shader program
var FSHADER_SOURCE = `
    precision mediump float;
    uniform vec4 u_FragColor;
    void main() {
      gl_FragColor = u_FragColor;
    }`


// Global Variables
let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_Size;
let u_ModelMatrix;
let u_GlobalRotateMatrix;
let u_GlobalScaleMatrix;

let g_pokeAnimation = false;
let g_pokeStartTime = 0;
const POKE_DURATION = 1.5; // seconds

function main() {
    // Setup canvas and gl context
    setupWebGL();

    // Setup GLSL shader programs and connect GLSL variables
    connectVariablesToGLSL();

    // Set up actions for the HTML UI elements
    addActionsForHtmlUI();

    canvas.onmousemove = function(ev) {
        if (ev.buttons === 1) {
            rotateCamera(ev);
        }
    }

    canvas.addEventListener('click', function(ev) {
        if (ev.shiftKey) {
            g_pokeAnimation = true;
            g_pokeStartTime = g_seconds;
        }
    });

    // Specify the color for clearing <canvas>
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    // renderAllShapes();
    requestAnimationFrame(tick);
}

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

    // Get the storage location of u_GlobalRotateMatrix
    u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
    if (!u_GlobalRotateMatrix) {
        console.log('Failed to get the storage location of u_GlobalRotateMatrix');
        return;
    }

    // Get the storage location of u_GlobalScaleMatrix
    u_GlobalScaleMatrix = gl.getUniformLocation(gl.program, 'u_GlobalScaleMatrix');
    if (!u_GlobalScaleMatrix) {
        console.log('Failed to get the storage location of u_GlobalScaleMatrix');
        return;
    }

    // Set an initial value for this matrix to identity
    var identityM = new Matrix4();
    gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
}

function renderAllShapes() {
    const startTime = performance.now();

    globalRotationMatrix = new Matrix4();
    globalRotationMatrix.rotate(g_globalRotation_y, 0, 1, 0);
    globalRotationMatrix.rotate(g_globalRotation_x, 1, 0, 0);
    gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotationMatrix.elements);

    // Build the scale matrix for poke animation
    var scaleMatrix = new Matrix4();

    if (g_pokeAnimation) {
        var elapsed = g_seconds - g_pokeStartTime;
        var t = elapsed / POKE_DURATION;
        if (t > 1.0) {
            g_pokeAnimation = false;
        } else {
            var sx, sy;
            if (t < 0.2) {
                var p = t / 0.2;
                sx = 1.0 + 0.4 * p;
                sy = 1.0 - 0.5 * p;
            } else if (t < 0.5) {
                var p = (t - 0.2) / 0.3;
                sx = 1.4 - 0.5 * p;
                sy = 0.5 + 0.7 * p;
            } else {
                var p = (t - 0.5) / 0.5;
                var wobble = 0.15 * Math.sin(p * Math.PI * 3) * (1 - p);
                sx = 1.0 + wobble * 0.5;
                sy = 1.0 + wobble;
            }
            scaleMatrix.scale(sx, sy, 1.0);
        }
    }

    gl.uniformMatrix4fv(u_GlobalScaleMatrix, false, scaleMatrix.elements);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // POKEMON: GOLBAT
    // Draw the body cube
    var body = new Cube();
	body.color = [53/255, 131/255, 168/255, 1.0];
    body.matrix.translate(-0.17, -0.2, 0);
    body.matrix.scale(0.5 * 0.7, 0.65, 0.3);
	body.render();

    /* ------------------------------------------------------------------------------------------------- */

    // Draw upper lip
    var upperLip = new Cube();
    upperLip.color = [53/255, 131/255, 168/255, 1.0];
    upperLip.matrix.translate(-0.14, 0.2, -0.1);
    upperLip.matrix.scale(0.4 * 0.7, 0.15 * 0.7, 0.1);
	upperLip.render();
    
    // Draw lower lip
    var lowerLip = new Cube();
    lowerLip.color = [53/255, 131/255, 168/255, 1.0];
    lowerLip.matrix.translate(-0.14, -0.1, -0.1);
    lowerLip.matrix.scale(0.4 * 0.7, 0.05, 0.1);
	lowerLip.render();

    /* ------------------------------------------------------------------------------------------------- */

    // Draw the mouth
    var mouth = new Cube();
    mouth.color = [0, 0, 0, 1.0];
    mouth.matrix.translate(-0.11, -0.05, -0.01);
    mouth.matrix.scale(0.35 * 0.7, 0.3, 0.02);
    mouth.render();
    
    /* ------------------------------------------------------------------------------------------------- */

    // Draw the top left fang
    var topLeftFang = new Pyramid();
    topLeftFang.color = [1, 1, 1, 1];
    topLeftFang.matrix.translate(-0.1, 0.2, 0);
    topLeftFang.matrix.scale(0.08 * 0.7, 0.08 * 0.7, 0.08 * 0.7);
    topLeftFang.matrix.rotate(180, 1, 0, 0);
    topLeftFang.render();

    // Draw the top right fang
    var topRightFang = new Pyramid();
    topRightFang.color = [1, 1, 1, 1];
    topRightFang.matrix.translate(0.07, 0.2, 0);
    topRightFang.matrix.scale(0.08 * 0.7, 0.08 * 0.7, 0.08 * 0.7);
    topRightFang.matrix.rotate(180, 1, 0, 0);
    topRightFang.render();
    
    // Draw the bottom left fang
    var bottomLeftFang = new Pyramid();
    bottomLeftFang.color = [1, 1, 1, 1];
    bottomLeftFang.matrix.translate(-0.1, -0.05, -0.08);
    bottomLeftFang.matrix.scale(0.08 * 0.7, 0.08 * 0.7, 0.08 * 0.7);
    bottomLeftFang.render();

    // Draw the bottom right fang
    var bottomRightFang = new Pyramid();
    bottomRightFang.color = [1, 1, 1, 1];
    bottomRightFang.matrix.translate(0.07, -0.05, -0.08);
    bottomRightFang.matrix.scale(0.08 * 0.7, 0.08 * 0.7, 0.08 * 0.7);
    bottomRightFang.render();

    /* ------------------------------------------------------------------------------------------------- */

    // Draw the left bottom arm
    var leftBottomArm = new Cube();
    leftBottomArm.color = [53/255, 131/255, 168/255, 1.0];
    leftBottomArm.matrix.translate(-0.17, 0.1, 0.16);
    leftBottomArm.matrix.scale(0.12, 0.05, 0.05);
    leftBottomArm.matrix.rotate(180, 0, 1, 0);
    leftBottomArm.matrix.translate(0.5, 0, 0.5);  // shift pivot point
    leftBottomArm.matrix.rotate(g_leftWingRotation, 1, 0, 0);
    leftBottomArm.matrix.translate(-0.5, 0, -0.5); // shift back
    leftBottomArm.render();

    // Draw the left middle arm
    var leftMiddleArm = new Cube();
    leftMiddleArm.color = [53/255, 131/255, 168/255, 1.0];
    leftMiddleArm.matrix = new Matrix4(leftBottomArm.matrix);
    leftMiddleArm.matrix.translate(1, 0, 0);
    leftMiddleArm.matrix.scale(0.5, 9, 1);
    leftMiddleArm.matrix.translate(0.5, 0, 0.5);  // shift pivot point
    leftMiddleArm.matrix.rotate(g_leftMiddleWingRotation, 0, 1, 0);
    leftMiddleArm.matrix.translate(-0.5, 0, -0.5); // shift back
    leftMiddleArm.render();

    // Draw the left top arm
    var leftTopArm = new Cube();
    leftTopArm.color = [53/255, 131/255, 168/255, 1.0];
    leftTopArm.matrix = new Matrix4(leftMiddleArm.matrix);
    leftTopArm.matrix.translate(0, 1, 0);
    leftTopArm.matrix.scale(10, 0.1, 1);
    leftTopArm.matrix.translate(0.5, 0, 0.5);  // shift pivot point
    leftTopArm.matrix.rotate(g_leftTopWingRotation, 1, 0, 0);
    leftTopArm.matrix.translate(-0.5, 0, -0.5); // shift back
    leftTopArm.render();

    /* ------------------------------------------------------------------------------------------------- */
    
    // Draw the left bottom wing
    var leftBottomWing = new Cube();
    leftBottomWing.color = [116/255, 60/255, 109/255, 1.0];
    leftBottomWing.matrix = new Matrix4(leftBottomArm.matrix);
    leftBottomWing.matrix.translate(0, -4, 0);
    leftBottomWing.matrix.scale(2.5, 4.5, 0.5);
    leftBottomWing.render();

    // Draw the left middle wing
    var leftMiddleWing = new Cube();
    leftMiddleWing.color = [116/255, 60/255, 109/255, 1.0];
    leftMiddleWing.matrix = new Matrix4(leftBottomWing.matrix);
    leftMiddleWing.matrix.translate(0.6, 1, 0);
    leftMiddleWing.matrix.scale(1, 1, 1);
    leftMiddleWing.render();

    // Draw the left top wing
    var leftTopWing = new Cube();
    leftTopWing.color = [116/255, 60/255, 109/255, 1.0];
    leftTopWing.matrix = new Matrix4(leftMiddleWing.matrix);
    leftTopWing.matrix.translate(0, 1, 0);
    leftTopWing.matrix.scale(1.7, 1, 1);
    leftTopWing.render();

    /* ------------------------------------------------------------------------------------------------- */


    // Draw the right bottom arm
    var rightBottomArm = new Cube();
    rightBottomArm.color = [53/255, 131/255, 168/255, 1.0];
    rightBottomArm.matrix.translate(0.18, 0.1, 0.12);
    rightBottomArm.matrix.scale(0.12, 0.05, 0.05);
    rightBottomArm.matrix.translate(0.5, 0, 0.5);  // shift pivot point
    rightBottomArm.matrix.rotate(g_rightWingRotation, 1, 0, 0);
    rightBottomArm.matrix.translate(-0.5, 0, -0.5); // shift back
    rightBottomArm.render()

    // Draw the right middle arm
    var rightMiddleArm = new Cube();
    rightMiddleArm.color = [53/255, 131/255, 168/255, 1.0];
    rightMiddleArm.matrix = new Matrix4(rightBottomArm.matrix);
    rightMiddleArm.matrix.translate(1, 0, 0);
    rightMiddleArm.matrix.scale(0.5, 9, 1);
    rightMiddleArm.matrix.translate(0.5, 0, 0.5);  // shift pivot point
    rightMiddleArm.matrix.rotate(g_rightMiddleWingRotation, 0, 1, 0);
    rightMiddleArm.matrix.translate(-0.5, 0, -0.5); // shift back
    rightMiddleArm.render();

    // Draw the right top arm
    var rightTopArm = new Cube();
    rightTopArm.color = [53/255, 131/255, 168/255, 1.0];
    rightTopArm.matrix = new Matrix4(rightMiddleArm.matrix);
    rightTopArm.matrix.translate(0, 1, 0);
    rightTopArm.matrix.scale(10, 0.1, 1);
    rightTopArm.matrix.translate(0.5, 0, 0.5);  // shift pivot point
    rightTopArm.matrix.rotate(g_rightTopWingRotation, 1, 0, 0);
    rightTopArm.matrix.translate(-0.5, 0, -0.5); // shift back
    rightTopArm.render();

    /* ------------------------------------------------------------------------------------------------- */
    
    // Draw the right bottom wing
    var rightBottomWing = new Cube();
    rightBottomWing.color = [116/255, 60/255, 109/255, 1.0];
    rightBottomWing.matrix = new Matrix4(rightBottomArm.matrix);
    rightBottomWing.matrix.translate(0, -4.5, 0);
    rightBottomWing.matrix.scale(2.5, 4.5, 0.5);
    rightBottomWing.render();

    // Draw the right middle wing
    var rightMiddleWing = new Cube();
    rightMiddleWing.color = [116/255, 60/255, 109/255, 1.0];
    rightMiddleWing.matrix = new Matrix4(rightBottomWing.matrix);
    rightMiddleWing.matrix.translate(0.6, 1, 0);
    rightMiddleWing.matrix.scale(1, 1, 1);
    rightMiddleWing.render();

    // Draw the right top wing
    var rightTopWing = new Cube();
    rightTopWing.color = [116/255, 60/255, 109/255, 1.0];
    rightTopWing.matrix = new Matrix4(rightMiddleWing.matrix);
    rightTopWing.matrix.translate(0, 1, 0);
    rightTopWing.matrix.scale(1.7, 1, 1);
    rightTopWing.render();

    /* ------------------------------------------------------------------------------------------------- */

    // Draw the left eye
    var leftEye = new Cube();
    leftEye.matrix.translate(-0.11, 0.3, -0.01);
    leftEye.matrix.scale(0.06, 0.03, 0.05);
    leftEye.render();

    // Draw the left pupil
    var leftPupil = new Cube();
    leftPupil.color = [0, 0, 0, 1]
    leftPupil.matrix.translate(-0.086, 0.31, -0.013);
    leftPupil.matrix.scale(0.016, 0.02, 0.05);
    leftPupil.render();


    
    // Draw the right eye
    var rightEye = new Cube();
    rightEye.matrix.translate(0.07, 0.3, -0.01);
    rightEye.matrix.scale(0.06, 0.03, 0.05);
    rightEye.render();

    // Draw the right pupil
    var rightPupil = new Cube();
    rightPupil.color = [0, 0, 0, 1]
    rightPupil.matrix.translate(0.09, 0.31, -0.013);
    rightPupil.matrix.scale(0.016, 0.02, 0.05);
    rightPupil.render();

    /* ------------------------------------------------------------------------------------------------- */

    // Draw the left ear
    var leftEar = new Cube();
    leftEar.color = [53/255, 131/255, 168/255, 1.0];
    leftEar.matrix.translate(-0.11, 0.43, 0.1);
    leftEar.matrix.scale(0.07, 0.085, 0.05);
    leftEar.render();

    var leftEarInner = new Cube();
    leftEarInner.color = [116/255, 60/255, 109/255, 1.0];
    leftEarInner.matrix.translate(-0.096, 0.46, 0.09);
    leftEarInner.matrix.scale(0.04, 0.04, 0.02);
    leftEarInner.render();

    // Draw the right ear
    var rightEar = new Cube();
    rightEar.color = [53/255, 131/255, 168/255, 1.0];
    rightEar.matrix.translate(0.05, 0.43, 0.1);
    rightEar.matrix.scale(0.07, 0.085, 0.05);
    rightEar.render();

    var rightEarInner = new Cube();
    rightEarInner.color = [116/255, 60/255, 109/255, 1.0];
    rightEarInner.matrix.translate(0.065, 0.46, 0.09);
    rightEarInner.matrix.scale(0.04, 0.04, 0.02);
    rightEarInner.render();

    /* ------------------------------------------------------------------------------------------------- */

    // Draw the left leg
    var leftLeg = new Cube();
    leftLeg.color = [53/255, 131/255, 168/255, 1.0];
    leftLeg.matrix.translate(-0.15, -0.2, 0.1);
    leftLeg.matrix.scale(0.05, 0.1, 0.05);
    leftLeg.matrix.rotate(180, 1, 0, 0);
    leftLeg.matrix.translate(0.5, 0, 0.5);  // shift pivot point
    leftLeg.matrix.rotate(g_leftLegRotation, 1, 0, 0);
    leftLeg.matrix.translate(-0.5, 0, -0.5); // shift back
    leftLeg.render();

    // Draw the left foot
    var leftFoot = new Cube();
    leftFoot.color = [53/255, 131/255, 168/255, 1.0];
    leftFoot.matrix = leftLeg.matrix;
    leftFoot.matrix.translate(0, 1, -0.2);
    leftFoot.matrix.translate(0.5, 0, 0.5);  // shift pivot point
    leftFoot.matrix.rotate(g_leftFootRotation, 0, 1, 0);
    leftFoot.matrix.translate(-0.5, 0, -0.5); // shift back
    leftFoot.matrix.scale(1, 0.5, 3);
    leftFoot.render();

    // Draw the right leg
    var rightLeg = new Cube();
    rightLeg.color = [53/255, 131/255, 168/255, 1.0];
    rightLeg.matrix.translate(0.1, -0.2, 0.1);
    rightLeg.matrix.scale(0.05, 0.1, 0.05);
    rightLeg.matrix.rotate(180, 1, 0, 0);
    rightLeg.matrix.translate(0.5, 0, 0.5);  // shift pivot point
    rightLeg.matrix.rotate(g_rightLegRotation, 1, 0, 0);
    rightLeg.matrix.translate(-0.5, 0, -0.5); // shift back
    rightLeg.render();

    // Draw the right foot
    var rightFoot = new Cube();
    rightFoot.color = [53/255, 131/255, 168/255, 1.0];
    rightFoot.matrix = rightLeg.matrix;
    rightFoot.matrix.translate(0, 1, -0.2);
    rightFoot.matrix.translate(0.5, 0, 0.5);  // shift pivot point
    rightFoot.matrix.rotate(g_rightFootRotation, 0, 1, 0)
    rightFoot.matrix.translate(-0.5, 0, -0.5); // shift back
    rightFoot.matrix.scale(1, 0.5, 3);
    rightFoot.render();

    const duration = performance.now() - startTime;
    const fpsCounter = document.getElementById("fpsCounter");
	fpsCounter.innerHTML = `ms: ${duration}, fps: ${Math.floor(1000 / duration)}`;
}

// Globals related UI elements
let g_globalRotation_x = 0.0;
let g_globalRotation_y = 0.0;

let g_leftLegRotation = 0.0;
let g_rightLegRotation = 0.0;

let g_leftFootRotation = 0.0;
let g_rightFootRotation = 0.0;

let g_leftWingRotation = 0.0;
let g_rightWingRotation = 0.0;

let g_leftMiddleWingRotation = 0.0;
let g_rightMiddleWingRotation = 0.0;

let g_leftTopWingRotation = 0.0;
let g_rightTopWingRotation = 0.0;

let g_leftLegAnimation = false;
let g_rightLegAnimation = false;

let g_leftFootAnimation = false;
let g_rightFootAnimation = false;

let g_leftWingAnimation = false;
let g_rightWingAnimation = false;

let g_leftMiddleWingAnimation = false;
let g_rightMiddleWingAnimation = false;

let g_leftTopWingAnimation = false;
let g_rightTopWingAnimation = false;

// Set up actions for the HTML UI elements
function addActionsForHtmlUI() {
    // Sliders for camera angle
    document.getElementById('g_globalRotationSlider_x').addEventListener('input', function() {
        g_globalRotation_x = this.value;
        renderAllShapes();
    });

    document.getElementById('g_globalRotationSlider_y').addEventListener('input', function() {
        g_globalRotation_y = this.value;
        renderAllShapes();
    });

    document.getElementById('moveLeftLeg').addEventListener('input', function() {
        g_leftLegRotation = this.value;
        renderAllShapes();
    });

    document.getElementById('moveRightLeg').addEventListener('input', function() {
        g_rightLegRotation = this.value;
        renderAllShapes();
    });

    document.getElementById('moveLeftFoot').addEventListener('input', function() {
        g_leftFootRotation = this.value;
        renderAllShapes();
    });

    document.getElementById('moveRightFoot').addEventListener('input', function() {
        g_rightFootRotation = this.value;
        renderAllShapes();
    });

    document.getElementById('moveLeftWing').addEventListener('input', function() {
        g_leftWingRotation = this.value;
        renderAllShapes();
    });

    document.getElementById('moveRightWing').addEventListener('input', function() {
        g_rightWingRotation = -this.value;
        renderAllShapes();
    });

    document.getElementById('moveLeftMiddleWing').addEventListener('input', function() {
        g_leftMiddleWingRotation = -this.value;
        renderAllShapes();
    });

    document.getElementById('moveRightMiddleWing').addEventListener('input', function() {
        g_rightMiddleWingRotation = this.value;
        renderAllShapes();
    });

    document.getElementById('moveLeftTopWing').addEventListener('input', function() {
        g_leftTopWingRotation = this.value;
        renderAllShapes();
    });

    document.getElementById('moveRightTopWing').addEventListener('input', function() {
        g_rightTopWingRotation = this.value;
        renderAllShapes();
    });

    // Animation toggles
    document.getElementById('animationLeftLegOn').onclick = function() {
        g_leftLegAnimation = true;
    }

    document.getElementById('animationLeftLegOff').onclick = function() {
        g_leftLegAnimation = false;
    }

    document.getElementById('animationRightLegOn').onclick = function() {
        g_rightLegAnimation = true;
    }

    document.getElementById('animationRightLegOff').onclick = function() {
        g_rightLegAnimation = false;
    }

    document.getElementById('animationLeftFootOn').onclick = function() {
        g_leftFootAnimation = true;
    }

    document.getElementById('animationLeftFootOff').onclick = function() {
        g_leftFootAnimation = false;
    }

    document.getElementById('animationRightFootOn').onclick = function() {
        g_rightFootAnimation = true;
    }

    document.getElementById('animationRightFootOff').onclick = function() {
        g_rightFootAnimation = false;
    }

    document.getElementById('animationLeftWingOn').onclick = function() {
        g_leftWingAnimation = true;
    }

    document.getElementById('animationLeftWingOff').onclick = function() {
        g_leftWingAnimation = false;
    }

    document.getElementById('animationRightWingOn').onclick = function() {
        g_rightWingAnimation = true;
    }

    document.getElementById('animationRightWingOff').onclick = function() {
        g_rightWingAnimation = false;
    }

    document.getElementById('animationLeftMiddleWingOn').onclick = function() {
        g_leftMiddleWingAnimation = true;
    }

    document.getElementById('animationLeftMiddleWingOff').onclick = function() {
        g_leftMiddleWingAnimation = false;
    }

    document.getElementById('animationRightMiddleWingOn').onclick = function() {
        g_rightMiddleWingAnimation = true;
    }

    document.getElementById('animationRightMiddleWingOff').onclick = function() {
        g_rightMiddleWingAnimation = false;
    }

    document.getElementById('animationLeftTopWingOn').onclick = function() {
        g_leftTopWingAnimation = true;
    }

    document.getElementById('animationLeftTopWingOff').onclick = function() {
        g_leftTopWingAnimation = false;
    }

    document.getElementById('animationRightTopWingOn').onclick = function() {
        g_rightTopWingAnimation = true;
    }

    document.getElementById('animationRightTopWingOff').onclick = function() {
        g_rightTopWingAnimation = false;
    }
}

function rotateCamera(ev) {
    const [x, y] = convertCoordinatesEventToGL(ev);

    g_globalRotation_x = 180 * y;
    g_globalRotation_y = 180 * x;
    renderAllShapes();
}

function convertCoordinatesEventToGL(ev) {
    var x = ev.clientX; // x coordinate of a mouse pointer
    var y = ev.clientY; // y coordinate of a mouse pointer

    var rect = ev.target.getBoundingClientRect();

    x = ((x - rect.left) - canvas.width / 2) / (canvas.width / 2);
    y = (canvas.height / 2 - (y - rect.top)) / (canvas.height / 2);

    return [x, y];
}

var g_startTime = performance.now() / 1000;
var g_seconds = performance.now() / 1000 - g_startTime;

// Called by browser repeatedly whenever it's time
function tick() {
    // Save the current time
    g_seconds = performance.now() / 1000 - g_startTime;

    // Print some debug info so we know we are running
    console.log(performance.now());

    // Update animation angles
    updateAnimationAngles();

    // Draw everything
    renderAllShapes();

    // Tell the browsere to update again when it has time
    requestAnimationFrame(tick);
}

function updateAnimationAngles() {
    if (g_leftLegAnimation) {
        g_leftLegRotation = (45 * Math.sin(g_seconds));
    }

    if (g_leftFootAnimation) {
        g_leftFootRotation = (45 * Math.sin(g_seconds));
    }

    if (g_rightLegAnimation) {
        g_rightLegRotation = (45 * Math.sin(g_seconds));
    }

    if (g_rightFootAnimation) {
        g_rightFootRotation = (45 * Math.sin(g_seconds));
    }

    if (g_leftWingAnimation) {
        g_leftWingRotation = (45 * Math.sin(g_seconds));
    }

    if (g_rightWingAnimation) {
        g_rightWingRotation = (45 * Math.sin(g_seconds));
    }

    if (g_leftMiddleWingAnimation) {
        g_leftMiddleWingRotation = (45 * Math.sin(g_seconds));
    }

    if (g_rightMiddleWingAnimation) {
        g_rightMiddleWingRotation = (45 * Math.sin(g_seconds));
    }

    if (g_leftTopWingAnimation) {
        g_leftTopWingRotation = (45 * Math.sin(g_seconds));
    }

    if (g_rightTopWingAnimation) {
        g_rightTopWingRotation = (45 * Math.sin(g_seconds));
    }
}