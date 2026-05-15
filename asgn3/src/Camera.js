class Camera {
    constructor() {
        this.fov = 60;
        this.eye = new Vector3([0, 0, 0]);
        this.at  = new Vector3([0, 0, -1]);
        this.up  = new Vector3([0, 1, 0]);
        this.moveSpeed = 1;
        this.panAmount = 15;

        this.viewMatrix = new Matrix4();
		this.projectionMatrix = new Matrix4();
		this.projectionMatrix.setPerspective(this.fov, canvas.width/canvas.height, 0.1, 1000);
    }

    forward() {
        const f = new Vector3().set(this.at).sub(this.eye);
		f.normalize();
		f.mul(this.moveSpeed);

		this.eye.add(f);
		this.at.add(f);
		this.viewMatrix.setLookAt(...this.eye.elements, ...this.at.elements, ...this.up.elements);
    }

    back() {
        const f = new Vector3().set(this.eye).sub(this.at);
		f.normalize();
		f.mul(this.moveSpeed);

		this.eye.add(f);
		this.at.add(f);
		this.viewMatrix.setLookAt(...this.eye.elements, ...this.at.elements, ...this.up.elements);
    }

    left() {
        const f = new Vector3().set(this.at).sub(this.eye);
		const side = Vector3.cross(this.up, f);
		side.normalize();
		side.mul(this.moveSpeed);

		this.eye.add(side);
		this.at.add(side);
		this.viewMatrix.setLookAt(...this.eye.elements, ...this.at.elements, ...this.up.elements);
    }

    right() {
        const f = new Vector3().set(this.at).sub(this.eye);
		const side = Vector3.cross(f, this.up);
		side.normalize();
		side.mul(this.moveSpeed);

		this.eye.add(side);
		this.at.add(side);
		this.viewMatrix.setLookAt(...this.eye.elements, ...this.at.elements, ...this.up.elements);
    }

    rotateLeft() {
        const f_current = new Vector3().set(this.at).sub(this.eye);
		const rotationMatrix = new Matrix4().setRotate(this.panAmount, ...this.up.elements);
		const f_new = rotationMatrix.multiplyVector3(f_current);

		this.at.set(this.eye).add(f_new);
		this.viewMatrix.setLookAt(...this.eye.elements, ...this.at.elements, ...this.up.elements);
    }

    rotateRight() {
        const f_current = new Vector3().set(this.at).sub(this.eye);
		const rotationMatrix = new Matrix4();
		rotationMatrix.setRotate(-this.panAmount, ...this.up.elements);
		const f_new = rotationMatrix.multiplyVector3(f_current);

		this.at.set(this.eye).add(f_new);
		this.viewMatrix.setLookAt(...this.eye.elements, ...this.at.elements, ...this.up.elements);
    }

    mousePan(deltaX) {
        const angle = deltaX * this.panAmount * 0.05; // Adjust sensitivity as needed

		const f_current = new Vector3().set(this.at).sub(this.eye);
		const rotationMatrix = new Matrix4().setRotate(-angle, ...this.up.elements);
		const f_new = rotationMatrix.multiplyVector3(f_current);

		this.at.set(this.eye).add(f_new);
		this.viewMatrix.setLookAt(...this.eye.elements, ...this.at.elements, ...this.up.elements);
    }
}