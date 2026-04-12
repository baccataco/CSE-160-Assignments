// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
    attribute vec4 a_Position;
    uniform float u_Size;
    void main() {
        gl_Position = a_Position;
        // gl_PointSize = 10.0;
        gl_PointSize = u_Size;
    }`

// Fragment shader program
var FSHADER_SOURCE = `
    precision mediump float;
    uniform vec4 u_FragColor;
    void main() {
      gl_FragColor = u_FragColor;
    }`

var g_shapesList = [];

// Global Variables
const POINT = 0;
const TRIANGLE = 1;
const SQUARE = 2;
const CIRCLE = 3;
const PAINTBRUSH = 4;

let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_Size;

let g_lastX = null;
let g_lastY = null;

function main() {
    // Setup canvas and gl context
    setupWebGL();

    // Setup GLSL shader programs and connect GLSL variables
    connectVariablesToGLSL();

    // Set up actions for the HTML UI elements
    addActionsForHtmlUI();

    // Register function (event handler) to be called on a mouse press
    canvas.onmousedown = function (ev) {
        click(ev);
    }

    canvas.onmousemove = function (ev) {
        if (ev.buttons == 1) {
            click(ev);
        }
    }

    // Specify the color for clearing <canvas>
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT);
}

function setupWebGL() {
    // Retrieve <canvas> element
    canvas = document.getElementById('webgl');

    // Get the rendering context for WebGL
    // gl = getWebGLContext(canvas);
    gl = canvas.getContext("webgl", { preserveDrawingBuffer: true });
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }
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

    // Get the storage location of u_Size
    u_Size = gl.getUniformLocation(gl.program, 'u_Size');
    if (!u_Size) {
        console.log('Failed to get the storage location of u_Size');
        return;
    }
}

function createShapeAt(x, y) {
    let shape;
    if (g_selectedType == POINT) {
        shape = new Point();
    } else if (g_selectedType == SQUARE) {
        shape = new Square();
    } else if (g_selectedType == TRIANGLE) {
        shape = new Triangle();
    } else if (g_selectedType == CIRCLE) {
        shape = new Circle();
        shape.segments = g_selectedSegments;
    } else if (g_selectedType == PAINTBRUSH) {
        shape = new PaintBrush();
    } else {
        shape = new Point();
    }

    shape.position = [x, y];
    shape.color = g_selectedColor.slice();
    shape.size = g_selectedSize;
    g_shapesList.push(shape);
}

function click(ev) {
    let [x, y] = convertCoordinatesEventToGL(ev);
    createShapeAt(x, y);
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

function renderAllShapes() {
    // Check the time at the start of the function
    var startTime = performance.now();

    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT);

    // var len = g_points.length;

    // Draw each shape in the list
    var len = g_shapesList.length;

    for (var i = 0; i < len; i++) {
        g_shapesList[i].render();
    }

    // Check the time at the end of the function and show on the webpage
    var duration = performance.now() - startTime;
    sendTextToHTML("numdot: " + len + " ms: " + Math.floor(duration) + " fps: " + Math.floor(1000 / duration) / 10, "numdot");
}

// UI Related Global Variables
let g_selectedColor = [1.0, 1.0, 1.0, 1.0];
let g_selectedSize = 5.0;
let g_selectedType = POINT;
let g_selectedSegments = 3; // for circle only

// Setup actions for the HTML UI elements
function addActionsForHtmlUI() {
    // Recreate Button
    document.getElementById('recreate-btn').onclick = function () {
        // Loop through our sample face data, turn them into class objects, and push them
        pikachu.forEach(shapeData => {
            let newShape = instantiateShapeFromData(shapeData);
            g_shapesList.push(newShape);
        });

        // Redraw the canvas with the newly added shapes
        renderAllShapes();
    };

    // Button Events (Shape Type)
    document.getElementById('clear-btn').onclick = function () {
        g_shapesList = [];
        renderAllShapes();
    }

    document.getElementById('points').onclick = function () {
        g_selectedType = POINT;
    }

    document.getElementById('squares').onclick = function () {
        g_selectedType = SQUARE;
    }

    document.getElementById('triangles').onclick = function () {
        g_selectedType = TRIANGLE;
    }

    document.getElementById('circles').onclick = function () {
        g_selectedType = CIRCLE;
    }

    document.getElementById('paintbrush').onclick = function() {
        g_selectedType = PAINTBRUSH;
    }

    // Slider Events
    document.getElementById('redSlider').addEventListener('mouseup', function () {
        g_selectedColor[0] = this.value / 100;
    });

    document.getElementById('greenSlider').addEventListener('mouseup', function () {
        g_selectedColor[1] = this.value / 100;
    });

    document.getElementById('blueSlider').addEventListener('mouseup', function () {
        g_selectedColor[2] = this.value / 100;
    });

    // Size Slider Events
    document.getElementById('shape-size').addEventListener('mouseup', function () {
        g_selectedSize = this.value;
    });

    document.getElementById('segment-count').addEventListener('mouseup', function () {
        g_selectedSegments = Math.max(3, Math.floor(this.value)); // Minimum 3 segments for a circle
    });

    canvas.onmousedown = function (ev) {
        let [x, y] = convertCoordinatesEventToGL(ev);
        g_lastX = x;
        g_lastY = y;
        click(ev);
    }

    canvas.onmousemove = function (ev) {
        if (ev.buttons == 1) {
            let [x, y] = convertCoordinatesEventToGL(ev);

            if (g_lastX !== null && g_lastY !== null) {
                // Interpolate between last and current position
                let dx = x - g_lastX;
                let dy = y - g_lastY;
                let dist = Math.sqrt(dx * dx + dy * dy);

                // Step size based on shape size (smaller shapes need tighter steps)
                let stepSize = (g_selectedSize / 200) * 0.8;
                stepSize = Math.max(stepSize, 0.005); // minimum step to avoid infinite loops

                let steps = Math.ceil(dist / stepSize);

                for (let i = 1; i <= steps; i++) {
                    let t = i / steps;
                    let ix = g_lastX + dx * t;
                    let iy = g_lastY + dy * t;
                    createShapeAt(ix, iy);
                }
            }

            g_lastX = x;
            g_lastY = y;
            renderAllShapes();
        }
    }

    canvas.onmouseup = function () {
        g_lastX = null;
        g_lastY = null;
    }
}

function sendTextToHTML(text, htmlID) {
    var htmlElm = document.getElementById(htmlID);
    if (!htmlElm) {
        console.log("Failed to get " + htmlID + " from HTML");
        return;
    }

    htmlElm.innerHTML = text;
}

// This is a sample "Face" drawn using your coordinate system.
const pikachu = [
    {
        "type": "triangle",
        "position": [
            -0.46,
            -0.4936606979370117
        ],
        "color": [
            0.89,
            0.64,
            0,
            1
        ],
        "size": "22"
    },
    {
        "type": "triangle",
        "position": [
            0.13,
            -0.4536606979370117
        ],
        "color": [
            0.89,
            0.64,
            0,
            1
        ],
        "size": "22"
    },
    {
        "type": "triangle",
        "position": [
            0.13,
            -0.4536606979370117
        ],
        "color": [
            0.89,
            0.64,
            0,
            1
        ],
        "size": "22"
    },
    {
        "type": "square",
        "position": [
            -0.465,
            -0.2665178680419922
        ],
        "color": [
            0.89,
            0.64,
            0,
            1
        ],
        "size": "30"
    },
    {
        "type": "square",
        "position": [
            -0.21,
            -0.1915178680419922
        ],
        "color": [
            0.89,
            0.64,
            0,
            1
        ],
        "size": "30"
    },
    {
        "type": "square",
        "position": [
            0.09,
            -0.20151786804199218
        ],
        "color": [
            0.89,
            0.64,
            0,
            1
        ],
        "size": "30"
    },
    {
        "type": "square",
        "position": [
            0.09,
            -0.20151786804199218
        ],
        "color": [
            0.89,
            0.64,
            0,
            1
        ],
        "size": "30"
    },
    {
        "type": "square",
        "position": [
            -0.455,
            0.07919642925262452
        ],
        "color": [
            0.89,
            0.64,
            0,
            1
        ],
        "size": "30"
    },
    {
        "type": "square",
        "position": [
            -0.24,
            0.06633930206298828
        ],
        "color": [
            0.89,
            0.64,
            0,
            1
        ],
        "size": "30"
    },
    {
        "type": "square",
        "position": [
            -0.235,
            0.06633930206298828
        ],
        "color": [
            0.89,
            0.64,
            0,
            1
        ],
        "size": "30"
    },
    {
        "type": "square",
        "position": [
            0.04,
            0.06633930206298828
        ],
        "color": [
            0.89,
            0.64,
            0,
            1
        ],
        "size": "30"
    },
    {
        "type": "square",
        "position": [
            -0.315,
            0.37133930206298826
        ],
        "color": [
            0.89,
            0.64,
            0,
            1
        ],
        "size": "30"
    },
    {
        "type": "square",
        "position": [
            -0.095,
            0.3513393020629883
        ],
        "color": [
            0.89,
            0.64,
            0,
            1
        ],
        "size": "30"
    },
    {
        "type": "triangle",
        "position": [
            -0.455,
            0.5263393020629883
        ],
        "color": [
            0.89,
            0.64,
            0,
            1
        ],
        "size": "30"
    },
    {
        "type": "triangle",
        "position": [
            -0.47,
            0.5513393020629883
        ],
        "color": [
            0.89,
            0.64,
            0,
            1
        ],
        "size": "30"
    },
    {
        "type": "triangle",
        "position": [
            -0.515,
            0.6463393020629883
        ],
        "color": [
            0.89,
            0.64,
            0,
            1
        ],
        "size": "30"
    },
    {
        "type": "triangle",
        "position": [
            0.065,
            0.5413393020629883
        ],
        "color": [
            0.89,
            0.64,
            0,
            1
        ],
        "size": "30"
    },
    {
        "type": "triangle",
        "position": [
            0.02,
            0.5063393020629883
        ],
        "color": [
            0.89,
            0.64,
            0,
            1
        ],
        "size": "30"
    },
    {
        "type": "triangle",
        "position": [
            0.37,
            0.110625
        ],
        "color": [
            0.89,
            0.64,
            0,
            1
        ],
        "size": "30"
    },
    {
        "type": "square",
        "position": [
            0.445,
            0.19633930206298827
        ],
        "color": [
            0.89,
            0.64,
            0,
            1
        ],
        "size": "30"
    },
    {
        "type": "square",
        "position": [
            0.445,
            0.20133930206298828
        ],
        "color": [
            0.89,
            0.64,
            0,
            1
        ],
        "size": "30"
    },
    {
        "type": "square",
        "position": [
            0.545,
            0.3563393020629883
        ],
        "color": [
            0.89,
            0.64,
            0,
            1
        ],
        "size": "17"
    },
    {
        "type": "square",
        "position": [
            0.645,
            0.48633930206298825
        ],
        "color": [
            0.89,
            0.64,
            0,
            1
        ],
        "size": "17"
    },
    {
        "type": "square",
        "position": [
            0.735,
            0.5513393020629883
        ],
        "color": [
            0.89,
            0.64,
            0,
            1
        ],
        "size": "9"
    },
    {
        "type": "square",
        "position": [
            -0.43,
            -0.07223217010498047
        ],
        "color": [
            0.89,
            0.64,
            0,
            1
        ],
        "size": "9"
    },
    {
        "type": "square",
        "position": [
            -0.37,
            -0.10223217010498047
        ],
        "color": [
            0.89,
            0.64,
            0,
            1
        ],
        "size": "9"
    },
    {
        "type": "square",
        "position": [
            -0.27,
            0.22633930206298827
        ],
        "color": [
            0.89,
            0.64,
            0,
            1
        ],
        "size": "9"
    },
    {
        "type": "triangle",
        "position": [
            -0.52,
            0.7563393020629883
        ],
        "color": [
            1,
            1,
            1,
            1
        ],
        "size": "9"
    },
    {
        "type": "triangle",
        "position": [
            0.165,
            0.5963393020629882
        ],
        "color": [
            1,
            1,
            1,
            1
        ],
        "size": "15"
    },
    {
        "type": "triangle",
        "position": [
            -0.445,
            0.2863393020629883
        ],
        "color": [
            1,
            0,
            0,
            1
        ],
        "size": "15"
    },
    {
        "type": "triangle",
        "position": [
            -0.005,
            0.3213393020629883
        ],
        "color": [
            1,
            0,
            0,
            1
        ],
        "size": "15"
    },
    {
        "type": "triangle",
        "position": [
            0.235,
            0.01848213195800781
        ],
        "color": [
            0.78,
            0.61,
            0,
            1
        ],
        "size": "15"
    },
    {
        "type": "triangle",
        "position": [
            0.24,
            0.01848213195800781
        ],
        "color": [
            0.78,
            0.61,
            0,
            1
        ],
        "size": "15"
    },
    {
        "type": "triangle",
        "position": [
            0.25,
            0.05276782989501953
        ],
        "color": [
            0.65,
            0.61,
            0,
            1
        ],
        "size": "15"
    },
    {
        "type": "triangle",
        "position": [
            0.255,
            0.05276782989501953
        ],
        "color": [
            0.65,
            0.61,
            0,
            1
        ],
        "size": "15"
    },
    {
        "type": "triangle",
        "position": [
            0.255,
            0.04776782989501953
        ],
        "color": [
            0.65,
            0.61,
            0,
            1
        ],
        "size": "15"
    },
    {
        "type": "triangle",
        "position": [
            0.265,
            0.07776782989501953
        ],
        "color": [
            0.65,
            0.18,
            0,
            1
        ],
        "size": "15"
    },
    {
        "type": "triangle",
        "position": [
            0.26,
            0.04776782989501953
        ],
        "color": [
            0.65,
            0.18,
            0,
            1
        ],
        "size": "15"
    },
    {
        "type": "triangle",
        "position": [
            0.265,
            0.04776782989501953
        ],
        "color": [
            0.65,
            0.18,
            0,
            1
        ],
        "size": "15"
    },
    {
        "type": "triangle",
        "position": [
            0.265,
            0.04776782989501953
        ],
        "color": [
            0.65,
            0.18,
            0,
            1
        ],
        "size": "15"
    },
    {
        "type": "triangle",
        "position": [
            0.25,
            0.02276782989501953
        ],
        "color": [
            0.65,
            0.18,
            0,
            1
        ],
        "size": "15"
    },
    {
        "type": "triangle",
        "position": [
            0.225,
            0.01776782989501953
        ],
        "color": [
            0.65,
            0.18,
            0,
            1
        ],
        "size": "15"
    },
    {
        "type": "triangle",
        "position": [
            0.2,
            -0.0022321701049804687
        ],
        "color": [
            0.65,
            0.18,
            0,
            1
        ],
        "size": "15"
    },
    {
        "type": "triangle",
        "position": [
            0.2,
            -0.032232170104980466
        ],
        "color": [
            0.65,
            0.18,
            0,
            1
        ],
        "size": "15"
    },
    {
        "type": "point",
        "position": [
            -0.35,
            -0.034375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.35,
            -0.039375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.35,
            -0.039375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.35,
            -0.044375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.35,
            -0.049375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.35,
            -0.054375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.35,
            -0.054375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.35,
            -0.059375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.35,
            -0.059375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.35,
            -0.064375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.35,
            -0.069375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.35,
            -0.069375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.35,
            -0.074375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.35,
            -0.074375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.35,
            -0.079375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.35,
            -0.079375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.35,
            -0.084375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.35,
            -0.089375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.35,
            -0.089375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.35,
            -0.094375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.35,
            -0.094375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.35,
            -0.099375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.35,
            -0.099375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.35,
            -0.104375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.35,
            -0.109375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.35,
            -0.109375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.35,
            -0.114375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.35,
            -0.114375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.35,
            -0.119375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.35,
            -0.119375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.35,
            -0.124375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.35,
            -0.129375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.35,
            -0.129375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.35,
            -0.134375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.35,
            -0.139375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.35,
            -0.139375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.35,
            -0.144375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.35,
            -0.149375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.35,
            -0.149375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.35,
            -0.154375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.35,
            -0.154375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.35,
            -0.159375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.29,
            -0.049375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.29,
            -0.049375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.29,
            -0.054375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.29,
            -0.054375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.29,
            -0.059375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.29,
            -0.059375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.29,
            -0.059375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.29,
            -0.064375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.295,
            -0.064375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.295,
            -0.069375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.295,
            -0.069375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.3,
            -0.069375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.3,
            -0.074375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.3,
            -0.074375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.3,
            -0.079375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.305,
            -0.079375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.305,
            -0.079375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.305,
            -0.084375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.31,
            -0.089375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.31,
            -0.089375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.315,
            -0.089375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.315,
            -0.089375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.315,
            -0.094375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.32,
            -0.094375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.32,
            -0.094375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.32,
            -0.094375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.32,
            -0.099375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.325,
            -0.099375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.325,
            -0.099375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.33,
            -0.099375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.33,
            -0.104375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.33,
            -0.104375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.33,
            -0.109375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.335,
            -0.109375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.335,
            -0.109375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.335,
            -0.114375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.335,
            -0.114375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.335,
            -0.114375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.34,
            -0.114375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.335,
            -0.114375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.335,
            -0.114375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.33,
            -0.119375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.325,
            -0.119375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.32,
            -0.119375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.315,
            -0.124375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.315,
            -0.124375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.31,
            -0.124375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.31,
            -0.129375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.305,
            -0.129375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.3,
            -0.129375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.3,
            -0.129375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.3,
            -0.134375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.295,
            -0.134375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.295,
            -0.134375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.295,
            -0.134375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.29,
            -0.134375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.29,
            -0.139375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.29,
            -0.139375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.29,
            -0.139375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.285,
            -0.139375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.28,
            -0.139375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.28,
            -0.144375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.28,
            -0.149375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.275,
            -0.149375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.275,
            -0.149375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.275,
            -0.149375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.275,
            -0.154375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.27,
            -0.154375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.27,
            -0.154375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.27,
            -0.159375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.19,
            -0.019375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.19,
            -0.024375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.195,
            -0.029375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.195,
            -0.034375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.195,
            -0.034375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.195,
            -0.039375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.195,
            -0.039375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.195,
            -0.044375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.195,
            -0.049375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.195,
            -0.049375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.195,
            -0.054375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.195,
            -0.054375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.195,
            -0.059375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.195,
            -0.059375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.195,
            -0.064375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.195,
            -0.069375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.195,
            -0.069375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.195,
            -0.074375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.195,
            -0.074375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.195,
            -0.079375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.195,
            -0.079375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.195,
            -0.084375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.195,
            -0.089375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.195,
            -0.089375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.195,
            -0.094375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.195,
            -0.094375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.195,
            -0.099375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.195,
            -0.099375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.195,
            -0.104375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.195,
            -0.109375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.195,
            -0.109375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.195,
            -0.114375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.195,
            -0.114375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.19,
            -0.114375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.19,
            -0.119375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.19,
            -0.119375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.19,
            -0.124375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.19,
            -0.129375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.19,
            -0.129375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.19,
            -0.134375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.19,
            -0.134375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.19,
            -0.139375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.19,
            -0.139375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.19,
            -0.144375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.19,
            -0.149375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.19,
            -0.149375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.19,
            -0.154375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.19,
            -0.154375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.185,
            -0.154375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.18,
            -0.154375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.175,
            -0.154375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.175,
            -0.154375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.17,
            -0.154375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.17,
            -0.154375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.165,
            -0.154375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.16,
            -0.154375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.16,
            -0.154375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.155,
            -0.154375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.155,
            -0.154375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.15,
            -0.154375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.15,
            -0.159375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.15,
            -0.159375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    },
    {
        "type": "point",
        "position": [
            -0.145,
            -0.159375
        ],
        "color": [
            1,
            0.18,
            0.33,
            1
        ],
        "size": "6"
    }
]

// This function takes plain JSON data and turns it back into your Class objects
function instantiateShapeFromData(data) {
    let shape;

    // .toLowerCase() prevents crashes if the type is "Circle" vs "circle"
    // The '|| ""' prevents crashes if 'type' is missing entirely
    let t = (data.type || "").toLowerCase();

    if (t === "point") {
        shape = new Point();
    } else if (t === "square") {
        shape = new Square();
    } else if (t === "triangle") {
        shape = new Triangle();
    } else if (t === "circle") {
        shape = new Circle();
        // Only set segments if it actually exists in the data
        if (data.segments !== undefined) {
            shape.segments = data.segments;
        }
    } else {
        // FALLBACK: If the type is missing or completely unrecognized, 
        // default to a Point so the code doesn't crash.
        console.warn("Unknown shape type found:", data.type, "- Defaulting to Point.");
        shape = new Point();
    }

    // Now shape is guaranteed to exist, so these lines won't crash
    shape.position = data.position;
    shape.color = data.color;
    shape.size = data.size;

    return shape;
}