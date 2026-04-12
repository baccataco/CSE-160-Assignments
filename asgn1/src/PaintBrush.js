class PaintBrush {
    constructor() {
        this.type = "paintbrush";
        this.position = [0.0, 0.0];
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.size = 5.0;
    }

    render() {
        var xy = this.position;
        var rgba = this.color;
        var r = this.size / 200;

        // Each stamp = 6–10 small triangles scattered around center
        var count = 8;
        for (var i = 0; i < count; i++) {
            // Random polar offset within the brush radius
            var angle  = Math.random() * 2 * Math.PI;
            var dist   = Math.random() * r * 0.85;
            var cx = xy[0] + Math.cos(angle) * dist;
            var cy = xy[1] + Math.sin(angle) * dist;

            // Each bristle is a tiny triangle, randomly rotated and sized
            var triSize = r * (0.25 + Math.random() * 0.45);
            var rot     = Math.random() * 2 * Math.PI;

            var cos = Math.cos(rot), sin = Math.sin(rot);
            function pt(lx, ly) {
                return [cx + cos * lx - sin * ly,
                        cy + sin * lx + cos * ly];
            }

            var p0 = pt(0,           triSize);
            var p1 = pt(-triSize * 0.6, -triSize * 0.5);
            var p2 = pt( triSize * 0.6, -triSize * 0.5);

            // Vary opacity per bristle — thins at edges, thicker in middle
            var opacity = 0.35 + (1 - dist / r) * 0.55;
            gl.uniform4f(u_FragColor,
                rgba[0], rgba[1], rgba[2],
                rgba[3] * opacity);

            drawTriangle([
                p0[0], p0[1],
                p1[0], p1[1],
                p2[0], p2[1]
            ]);
        }
    }
}