class Cube{
    constructor() {
        this.type = "cube";
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.matrix = new Matrix4()
        this.textureNum = -2;
    }

    render() {
        var rgba = this.color;

        // Pass the texture number
        gl.uniform1i(u_whichTexture, this.textureNum);

        // Pass the color of a point to u_FragColor variable
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        // Pass the matrix to u_ModelMatrix attribute
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        // Front face
        //drawTriangle3D([0,0,1,  1,0,1,  1,1,1]);
        //drawTriangle3D([0,0,1,  1,1,1,  0,1,1]);
        drawTriangle3DUV([0,0,0,  1,1,0,  1,0,0], [0,0,  1,1,  1,0]);
        drawTriangle3DUV([0,0,0,  0,1,0,  1,1,0], [0,0,  0,1,  1,1]);

        // Pass the color of a point to u_FragColor uniform variable
        gl.uniform4f(u_FragColor, rgba[0] * 0.9, rgba[1] * 0.9, rgba[2] * 0.9, rgba[3]);

        // Back face
        //drawTriangle3D([0,0,0,  1,1,0,  1,0,0]);
        //drawTriangle3D([0,0,0,  0,1,0,  1,1,0]);
        drawTriangle3DUV([1,0,1,  0,1,1,  0,0,1], [0,0,  1,1,  1,0]);
        drawTriangle3DUV([1,0,1,  1,1,1,  0,1,1], [0,0,  0,1,  1,1]);

        // Left face
        //drawTriangle3D([0,0,0,  0,0,1,  0,1,1]);
        //drawTriangle3D([0,0,0,  0,1,1,  0,1,0]);
        drawTriangle3DUV([0,0,1,  0,1,0,  0,0,0], [0,0,  1,1,  1,0]);
        drawTriangle3DUV([0,0,1,  0,1,1,  0,1,0], [0,0,  0,1,  1,1]);

        // Right face
        //drawTriangle3D([1,0,0,  1,1,1,  1,0,1]);
        //drawTriangle3D([1,0,0,  1,1,0,  1,1,1]);
        drawTriangle3DUV([1,0,0,  1,1,1,  1,0,1], [0,0,  1,1,  1,0]);
        drawTriangle3DUV([1,0,0,  1,1,0,  1,1,1], [0,0,  0,1,  1,1]);

        // Top face
        //drawTriangle3D([0,1,0,  0,1,1,  1,1,1]);
        //drawTriangle3D([0,1,0,  1,1,1,  1,1,0]);
        drawTriangle3DUV([0,1,0,  1,1,1,  1,1,0], [0,0,  1,1,  1,0]);
        drawTriangle3DUV([0,1,0,  0,1,1,  1,1,1], [0,0,  0,1,  1,1]);

        // Bottom face
        //drawTriangle3D([0,0,0,  1,0,1,  0,0,1]);
        //drawTriangle3D([0,0,0,  1,0,0,  1,0,1]);
        drawTriangle3DUV([0,0,0,  1,0,1,  0,0,1], [0,0,  1,1,  1,0]);
        drawTriangle3DUV([0,0,0,  1,0,0,  1,0,1], [0,0,  0,1,  1,1]);
    }
}