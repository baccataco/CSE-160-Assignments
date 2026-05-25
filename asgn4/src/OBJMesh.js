class OBJMesh {
    constructor(objFilePath) {
        this.matrix = new Matrix4();
        this.normalMatrix = new Matrix4();
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.textureNum = -2; // Default to flat color shading

        this.positions = [];
        this.uvs = [];
        this.normals = [];
        
        this.vertexBuffer = null;
        this.uvBuffer = null;
        this.normalBuffer = null;
        this.isLoaded = false;

        // Start loading the file asynchronously
        this.loadOBJ(objFilePath);
    }

    async loadOBJ(filePath) {
        const response = await fetch(filePath);
        const text = await response.text();
        this.parse(text);
        this.initBuffers();
        this.isLoaded = true;
        renderAllShapes(); // Redraw scene once data is buffered
    }

    parse(text) {
        const lines = text.split('\n');

        // Temporary arrays to hold raw OBJ indexes
        const raw_positions = [];
        const raw_uvs = [];
        const raw_normals = [];

        for (let line of lines) {
            line = line.trim();
            if (line.startsWith('#') || line === '') continue;

            const parts = line.split(/\s+/);
            const type = parts[0];

            if (type === 'v') {
                raw_positions.push([parseFloat(parts[1]), parseFloat(parts[2]), parseFloat(parts[3])]);
            } else if (type === 'vt') {
                raw_uvs.push([parseFloat(parts[1]), parseFloat(parts[2])]);
            } else if (type === 'vn') {
                raw_normals.push([parseFloat(parts[1]), parseFloat(parts[2]), parseFloat(parts[3])]);
            } else if (type === 'f') {
                // Triangulate faces (assuming simple triangle meshes)
                for (let i = 1; i <= 3; i++) {
                    const vertexTokens = parts[i].split('/');
                    
                    // Parse 1-based OBJ indices and convert to 0-based layout indices
                    const vIdx = parseInt(vertexTokens[0]) - 1;
                    const pos = raw_positions[vIdx];
                    this.positions.push(pos[0], pos[1], pos[2]);

                    if (vertexTokens[1]) {
                        const uvIdx = parseInt(vertexTokens[1]) - 1;
                        const uv = raw_uvs[uvIdx];
                        this.uvs.push(uv[0], uv[1]);
                    } else {
                        this.uvs.push(0.0, 0.0); // Fallback
                    }

                    if (vertexTokens[2]) {
                        const nIdx = parseInt(vertexTokens[2]) - 1;
                        const norm = raw_normals[nIdx];
                        this.normals.push(norm[0], norm[1], norm[2]);
                    } else {
                        this.normals.push(0.0, 1.0, 0.0); // Fallback normal facing straight up
                    }
                }
            }
        }
    }

    initBuffers() {
        // Create buffers and load data ready for gl.drawArrays
        this.vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.positions), gl.STATIC_DRAW);

        this.uvBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.uvs), gl.STATIC_DRAW);

        this.normalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.normals), gl.STATIC_DRAW);
    }

    render() {
        if (!this.isLoaded) return; // Skip drawing if file is still loading

        gl.uniform1i(u_whichTexture, this.textureNum);
        gl.uniform4f(u_FragColor, ...this.color);
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
        gl.uniformMatrix4fv(u_NormalMatrix, false, this.normalMatrix.elements);

        // Bind and assign Position attribute
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Position);

        // Bind and assign UV attribute
        gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
        gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_UV);

        // Bind and assign Normal attribute (CRITICAL FOR LIGHTING)
        gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
        gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Normal);

        // Draw the parsed geometry
        gl.drawArrays(gl.TRIANGLES, 0, this.positions.length / 3);
    }
}