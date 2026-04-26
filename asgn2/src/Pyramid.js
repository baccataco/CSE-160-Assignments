class Pyramid {
	constructor() {
        this.type = "pyramid";
		this.color = [1.0, 1.0, 1.0, 1.0];
		this.matrix = new Matrix4();
	}

	render() {
		const rgba = this.color;

		gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
		gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

		// Front
		drawTriangle3D([0.0, 0.0, 0.0,		0.5, 1.0, 0.5,		1.0, 0.0, 0.0]);

		// Back
		drawTriangle3D([0.0, 0.0, 1.0,		0.5, 1.0, 0.5,		1.0, 0.0, 1.0]);

		gl.uniform4f(u_FragColor, rgba[0] * 0.9, rgba[1] * 0.9, rgba[2] * 0.9, rgba[3]);

		// Left
		drawTriangle3D([0.0, 0.0, 0.0,		0.5, 1.0, 0.5,		0.0, 0.0, 1.0]);

		// Right
		drawTriangle3D([1.0, 0.0, 0.0,		0.5, 1.0, 0.5,		1.0, 0.0, 1.0]);

		gl.uniform4f(u_FragColor, rgba[0] * 0.8, rgba[1] * 0.8, rgba[2] * 0.8, rgba[3]);

		// Bottom
		drawTriangle3D([0.0, 0.0, 0.0,		1.0, 0.0, 1.0,		1.0, 0.0, 0.0]);
		drawTriangle3D([0.0, 0.0, 0.0,		0.0, 0.0, 1.0,		1.0, 0.0, 1.0]);
	}
}