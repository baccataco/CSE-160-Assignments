// Vertex shader program
var VSHADER_SOURCE = `
    precision mediump float;
    attribute vec4 a_Position;
    attribute vec2 a_UV;
    attribute vec3 a_Normal;
    varying vec2 v_UV;
    varying vec3 v_Normal;
    varying vec4 v_VertPos;
    uniform mat4 u_ModelMatrix;
    uniform mat4 u_NormalMatrix;
    uniform mat4 u_ViewMatrix;
    uniform mat4 u_ProjectionMatrix;
    void main() {
        gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_ModelMatrix * a_Position;
        v_UV = a_UV;
        //v_Normal = a_Normal;
        v_Normal = normalize(vec3(u_NormalMatrix * vec4(a_Normal, 1.0)));
        v_VertPos = u_ModelMatrix * a_Position;
    }`

// Fragment shader program
var FSHADER_SOURCE = `
    precision mediump float;
    varying vec2 v_UV;
    varying vec3 v_Normal;
    uniform vec4 u_FragColor;
    uniform sampler2D u_Sampler0;
    uniform sampler2D u_Sampler1;
    uniform sampler2D u_Sampler2;
    uniform int u_whichTexture;
    uniform vec3 u_lightPos;
    uniform vec3 u_cameraPos;
    uniform bool u_lightOn;
    varying vec4 v_VertPos;
    void main() {
        if (u_whichTexture == -3) {
            gl_FragColor = vec4((v_Normal + 1.0) / 2.0, 1.0);  // Use normal debug color
        } else if (u_whichTexture == -2) {
            gl_FragColor = u_FragColor;  // Use color
        } else if (u_whichTexture == -1) {
            gl_FragColor = vec4(v_UV, 1.0, 1.0);  // Use UV debug color
        } else if (u_whichTexture == 0) {
            gl_FragColor = texture2D(u_Sampler0, v_UV);  // Use texture0
        } else if (u_whichTexture == 1) {
            gl_FragColor = texture2D(u_Sampler1, v_UV);  // Use texture1
        } else if (u_whichTexture == 2) {
            gl_FragColor = texture2D(u_Sampler2, v_UV);  // Use texture2
        } else {
            gl_FragColor = vec4(1.0, 0.2, 0.2, 1.0);  // Show error in redish color
        }

        vec3 lightVector = u_lightPos - vec3(v_VertPos);
        float r = length(lightVector);

        vec3 L = normalize(lightVector);
        vec3 N = normalize(v_Normal);

        float nDotL = max(dot(N, L), 0.0);

        vec3 R = reflect(-L, N);

        vec3 E = normalize(u_cameraPos - vec3(v_VertPos));

        float specular = pow(max(dot(E, R), 0.0), 64.0) * 0.8;

        vec3 diffuse = vec3(gl_FragColor) * nDotL * 0.7;
        vec3 ambient = vec3(gl_FragColor) * 0.3;
        if (u_lightOn) {
            if (u_whichTexture == 0) {
                gl_FragColor = vec4(specular + diffuse + ambient, 1.0);
            }
        } else {
            gl_FragColor = vec4(diffuse + ambient, 1.0);
        }
    }`

// Global variables
let canvas;
let gl;
let a_Position;
let a_UV;
let a_Normal;
let u_FragColor;
let u_ModelMatrix;
let u_ProjectionMatrix;
let u_ViewMatrix;
let u_NormalMatrix;
let u_Sampler0;
let u_Sampler1;
let u_Sampler2; // For the cat texture
let u_whichTexture;
let u_lightPos;
let u_cameraPos;
let u_lightOn;

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

    // Get the storage location of a_Normal
    a_Normal = gl.getAttribLocation(gl.program, 'a_Normal');
    if (a_Normal < 0) {
        console.log('Failed to get the storage location of a_Normal');
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

    // Get storage location of u_NormalMatrix
    u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');
    if (!u_NormalMatrix) {
        console.log('Failed to get the storage location of u_NormalMatrix');
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

    // Get the storage location of u_Sampler2
    u_Sampler2 = gl.getUniformLocation(gl.program, 'u_Sampler2');
    if (!u_Sampler2) {
        console.log('Failed to get the storage location of u_Sampler2');
        return false;
    }

    // Get the storage location of u_whichTexture
    u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
    if (!u_whichTexture) {
        console.log('Failed to get the storage location of u_whichTexture');
        return false;
    }

    // Get the storage location of u_lightPos
    u_lightPos = gl.getUniformLocation(gl.program, 'u_lightPos');
    if (!u_lightPos) {
        console.log('Failed to get the storage location of u_lightPos');
        return false;
    }

    // Get the storage location of u_cameraPos
    u_cameraPos = gl.getUniformLocation(gl.program, 'u_cameraPos');
    if (!u_cameraPos) {
        console.log('Failed to get the storage location of u_cameraPos');
        return false;
    }

    // Get the storage location of u_lightOn
    u_lightOn = gl.getUniformLocation(gl.program, 'u_lightOn');
    if (!u_lightOn) {
        console.log('Failed to get the storage location of u_lightOn');
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

    // Instantiate and begin asynchronous load from folder context
    g_customMesh = new OBJMesh('cat.obj');

    document.onkeydown = keydown;

    addActionsForHtmlUI();

    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    initTextures();

    requestAnimationFrame(tick);
}

var g_camera;
let g_normalOn = false;
let g_lightOn = true;
let g_lightPos = [0, 1, -2];
let g_cubeTranslateX = 0.1;
let g_cubeRotateY = 0;
let g_customMesh;
function addActionsForHtmlUI() {
    // Light
    document.getElementById('lightOn').onclick = function() {
        g_lightOn = true;
        renderAllShapes();
    } ;

    document.getElementById('lightOff').onclick = function() {
        g_lightOn = false;
        renderAllShapes();
    };

    // Normals
    document.getElementById('normalOn').onclick = function() {
        g_normalOn = true;
    };

    document.getElementById('normalOff').onclick = function() {
        g_normalOn = false;
    };

    // Lighting
    document.getElementById('lightSliderX').addEventListener('mousemove', function(ev) {
        if (ev.buttons === 1) {
            g_lightPos[0] = this.value / 100;
            renderAllShapes();
        }
    });

    document.getElementById('lightSliderY').addEventListener('mousemove', function(ev) {
        if (ev.buttons === 1) {
            g_lightPos[1] = this.value / 100;
            renderAllShapes();
        }
    });

    document.getElementById('lightSliderZ').addEventListener('mousemove', function(ev) {
        if (ev.buttons === 1) {
            g_lightPos[2] = this.value / 100;
            renderAllShapes();
        }
    });

    document.getElementById('cube1TranslateX').addEventListener('mousemove', function(ev) {
        if (ev.buttons === 1) {
            g_cubeTranslateX = this.value / 100;
            renderAllShapes();
        }
    });

    document.getElementById('cube1RotateY').addEventListener('mousemove', function(ev) {
        if (ev.buttons === 1) {
            g_cubeRotateY = parseFloat(this.value);
            renderAllShapes();
        }
    });
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

    // -----------------------------------------------------------------------------

    const catImage = new Image();
    if (!catImage) {
        console.log('Failed to create the cat image object');
        return false;
    }

    catImage.onload = function() {
        sendTextureToTEXTURE2(catImage);
    };

    catImage.src = 'cat_diffuse.jpg';

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

function sendTextureToTEXTURE2(image) {
    const texture = gl.createTexture();
    if (!texture) {
        console.log('Failed to create the texture object');
        return false;
    }

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the y-axis
    gl.activeTexture(gl.TEXTURE2);             // Enable texture unit 2
    gl.bindTexture(gl.TEXTURE_2D, texture);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)

    // Set texture filtering parameters
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    
    // Upload image data
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
    
    // Bind Sampler2 to Texture Unit 2
    gl.uniform1i(u_Sampler2, 2);

    console.log('Cat texture loaded');
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
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.uniform3f(u_lightPos, ...g_lightPos);

    gl.uniform3f(u_cameraPos, ...g_camera.eye.elements);

    gl.uniform1i(u_lightOn, g_lightOn);

    // Draw the light
    var light = new Cube();
    light.color = [2, 2, 0, 1];
    light.matrix.translate(...g_lightPos);
    light.matrix.scale(-0.1, -0.1, -0.1);
    light.matrix.translate(-0.5, -0.5, -0.5);
    light.render();

    // Floor
    var floor = new Cube();
    floor.color = [0.3, 0.7, 0.3, 1.0];
    floor.matrix.translate(0, -0.75, 0);
    floor.matrix.scale(64, 0, 64);
    floor.matrix.translate(-0.5, 0, -0.5);
    floor.render();

    // Sky
    var sky = new Cube();
    sky.color = [0.5, 0.8, 1.0, 1.0];
    sky.matrix.scale(64, 64, 64);
    sky.matrix.translate(-0.5, -0.5, -0.5);
    sky.render();

    // Cube 1
    var cube1 = new Cube();
    cube1.color = [1.0, 0.2, 0.2, 1.0];
    if (g_normalOn) {
        cube1.textureNum = -3;
    }
    // 1. Translate the object position in world space first
    cube1.matrix.translate(g_cubeTranslateX, -0.5, -2.0); 
    
    // 2. Rotate it around its own center
    cube1.matrix.rotate(g_cubeRotateY, 0, 1, 0);       
    
    // 3. Scale it down to size last
    cube1.matrix.scale(0.3, 0.3, 0.3);
    
    // Recalculate normal matrix after all transformations are applied
    cube1.normalMatrix.setInverseOf(cube1.matrix).transpose();
    cube1.render();

    // Sphere 1
    var sphere1 = new Sphere();
    sphere1.color = [0.2, 0.2, 1.0, 1.0];
    sphere1.matrix.scale(0.05, 0.05, 0.05);
    sphere1.matrix.translate(-1, 0, -5);
    sphere1.render();

    // Cat Mesh
    if (g_customMesh && g_customMesh.isLoaded) {
    g_customMesh.color = [0.8, 0.6, 0.2, 1.0]; // Shiny Gold color look
    if (g_normalOn) {
        g_customMesh.textureNum = -3; // Support debugging view toggles
    } else {
        g_customMesh.textureNum = 2; // Use cat texture when normals are not being debugged
    }

    // Transformation sequence order configuration 
    g_customMesh.matrix.setIdentity();
    g_customMesh.matrix.translate(1.0, -0.5, -4.0);
    g_customMesh.matrix.rotate(-90, 1, 0, 0);
    //g_customMesh.matrix.rotate(time * 20, 0, 1, 0); // Continuous slow spin
    g_customMesh.matrix.scale(0.02, 0.02, 0.02);      // Scale to view comfortably

    // Calculate model matrix modifications to align lightning normals accurately
    g_customMesh.normalMatrix.setInverseOf(g_customMesh.matrix).transpose();

    g_customMesh.render();
}
}

function tick() {
    // Get time in seconds
    let time = performance.now() / 1000;
    
	renderAllShapes(time);
	updateFPSCounter();
	requestAnimationFrame(tick);
}

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
    }

    renderAllShapes();
    console.log(ev.key);
}

let start = performance.now();
const fpsCounter = document.getElementById("fpsCounter");
function updateFPSCounter() {
	const ms = performance.now() - start;	// time in-between this frame and the last
	const fps = Math.floor(1000/ms);
	fpsCounter.innerHTML = `ms: ${ms}, fps: ${fps}`;
	start = performance.now();
}