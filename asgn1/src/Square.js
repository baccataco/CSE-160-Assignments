class Square {
    // Constructor
    constructor() {
        this.type = "square";
        this.position = [0.0, 0.0];
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.size = 5.0;
    }

    // Render this shape
    render() {
        var xy = this.position;
        var rgba = this.color;
        var d = this.size / 200; // half-size, normalized

        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        // Draw as two triangles forming a square
        drawTriangle([
            xy[0] - d, xy[1] - d,
            xy[0] + d, xy[1] - d,
            xy[0] + d, xy[1] + d
        ]);
        drawTriangle([
            xy[0] - d, xy[1] - d,
            xy[0] + d, xy[1] + d,
            xy[0] - d, xy[1] + d
        ]);
    }
}