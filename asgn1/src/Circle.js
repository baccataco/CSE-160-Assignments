class Circle {
    constructor() {
        this.type = "circle";
        this.position = [0.0, 0.0];
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.size = 5.0;
        this.segments = 10;
    }

    render() {
        var xy = this.position;
        var rgba = this.color;
        var r = this.size / 200;
        var segs = this.segments;

        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        // Draw the circle as a fan of triangles from the center
        var angleStep = (2 * Math.PI) / segs;
        for (var i = 0; i < segs; i++) {
            var angle1 = i * angleStep;
            var angle2 = (i + 1) * angleStep;
            drawTriangle([
                xy[0], xy[1],                                           // center
                xy[0] + r * Math.cos(angle1), xy[1] + r * Math.sin(angle1), // point 1
                xy[0] + r * Math.cos(angle2), xy[1] + r * Math.sin(angle2)  // point 2
            ]);
        }
    }
}