// asgn0.js
function main() {
    // Retrieve <canvas> element
    var canvas = document.getElementById('asgn0-canvas');
    if (!canvas) {
        console.log('Failed to retrieve the <canvas> element');
        return;
    }

    // Get the rendering context for 2DCG
    var ctx = canvas.getContext('2d');

    // Draw a blue rectangle
    // ctx.fillStyle = 'rgba(0, 0, 255, 1.0)'; // Set a blue color
    // ctx.fillRect(120, 10, 150, 150); // Fill a rectangle with the color

    ctx.fillStyle = 'black'; // Set a black background color
    ctx.fillRect(0, 0, canvas.width, canvas.height); // Fill the canvas with the background color

    // Instantiate a vector v1
    // var v1 = new Vector3([2.25, 2.25, 0]);

    // Call drawVector
    // drawVector(v1, "red");
}

// Draw a vector v with a specified color
function drawVector(v, color) {
    var canvas = document.getElementById('asgn0-canvas');
    var ctx = canvas.getContext('2d');

    // Start new path
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, canvas.height / 2); // Move to the center of the canvas
    ctx.lineTo((canvas.width / 2) + v.elements[0] * 20, (canvas.height / 2) - v.elements[1] * 20); // Draw a line to the end of the vector
    ctx.strokeStyle = color; // Set the stroke color
    ctx.stroke();
}

// Draw a line using user input
function handleDrawEvent() {
    var canvas = document.getElementById('asgn0-canvas');
    var ctx = canvas.getContext('2d');

    // Clear canvas
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Read in values
    var v1_inputX = document.getElementById('v1_inputX').value;
    var v1_inputY = document.getElementById('v1_inputY').value;

    // Create vector v1
    var v1 = new Vector3([parseFloat(v1_inputX), parseFloat(v1_inputY), 0]);

    // Draw v1
    drawVector(v1, "red");

    // Read in values
    var v2_inputX = document.getElementById('v2_inputX').value;
    var v2_inputY = document.getElementById('v2_inputY').value;

    // Create vector v2
    var v2 = new Vector3([parseFloat(v2_inputX), parseFloat(v2_inputY), 0]);

    // Draw v2
    drawVector(v2, "blue");
}

// Calculate operations on vectors and display results
function handleDrawOperationEvent() {
    var canvas = document.getElementById('asgn0-canvas');
    var ctx = canvas.getContext('2d');

    // Clear canvas
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Read in values
    var v1_inputX = document.getElementById('v1_inputX').value;
    var v1_inputY = document.getElementById('v1_inputY').value;

    // Create vector v1
    var v1 = new Vector3([parseFloat(v1_inputX), parseFloat(v1_inputY), 0]);

    // Draw v1
    drawVector(v1, "red");

    // Read in values
    var v2_inputX = document.getElementById('v2_inputX').value;
    var v2_inputY = document.getElementById('v2_inputY').value;

    // Create vector v2
    var v2 = new Vector3([parseFloat(v2_inputX), parseFloat(v2_inputY), 0]);

    // Draw v2
    drawVector(v2, "blue");

    // Read in selected operation
    var operation = document.getElementById('operation-select').value;

    // Perform selected operation
    if (operation === 'add') {
        var v3 = v1.add(v2);
        drawVector(v3, "green");
    } else if (operation === 'subtract') {
        var v3 = v1.sub(v2);
        drawVector(v3, "green");
    } else if (operation === 'multiply') {
        var scalar = parseFloat(document.getElementById('scalar-input').value);

        var v3 = v1.mul(scalar);
        drawVector(v3, "green");

        var v4 = v2.mul(scalar);
        drawVector(v4, "green");
    } else if (operation === 'divide') {
        var scalar = parseFloat(document.getElementById('scalar-input').value);

        var v3 = v1.div(scalar);
        drawVector(v3, "green");

        var v4 = v2.div(scalar);
        drawVector(v4, "green");
    } else if (operation === 'angle_between') {
        var angle = angleBetween(v1, v2);

        console.log("Angle: " + angle);
    } else if (operation === 'area') {
        var area = areaTriangle(v1, v2);

        console.log("Area: " + area);
    } else if (operation === 'magnitude') {
        var mag1 = v1.magnitude();
        var mag2 = v2.magnitude();

        console.log("Magnitude v1: " + mag1);
        console.log("Magnitude v2: " + mag2);
    } else if (operation === 'normalize') {
        var v3 = v1.normalize();
        drawVector(v3, "green");

        var v4 = v2.normalize();
        drawVector(v4, "green");
    }
}

// Compute angle between two vectors
function angleBetween(v1, v2) {
    var dotProduct = Vector3.dot(v1, v2);

    var mag1= v1.magnitude();
    var mag2 = v2.magnitude();

    var angle = Math.acos(dotProduct / (mag1 * mag2)) * (180 / Math.PI); // Convert from radians to degrees 

    return angle;
}

// Compute area of triangle formed by two vectors
function areaTriangle(v1, v2) {
    var crossProduct = Vector3.cross(v1, v2);

    var area = 0.5 * crossProduct.magnitude();

    return area;
}