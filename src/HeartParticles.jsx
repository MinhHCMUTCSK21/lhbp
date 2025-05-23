import React, { useEffect, useRef } from "react";

const HeartParticles = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const settings = {
      particles: {
        length: 10000,
        duration: 4,
        velocity: 80,
        effect: -1.3,
        size: 8,
      },
    };

    const requestAnimFrame = (() => {
      return (
        window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        function (callback) {
          window.setTimeout(callback, 1000 / 60);
        }
      );
    })();

    class Point {
      constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
      }
      clone() {
        return new Point(this.x, this.y);
      }
      length(length) {
        if (length === undefined) {
          return Math.sqrt(this.x * this.x + this.y * this.y);
        }
        this.normalize();
        this.x *= length;
        this.y *= length;
        return this;
      }
      normalize() {
        const len = this.length();
        this.x /= len;
        this.y /= len;
        return this;
      }
    }

    class Particle {
      constructor() {
        this.position = new Point();
        this.velocity = new Point();
        this.acceleration = new Point();
        this.age = 0;
      }
      initialize(x, y, dx, dy) {
        this.position.x = x;
        this.position.y = y;
        this.velocity.x = dx;
        this.velocity.y = dy;
        this.acceleration.x = dx * settings.particles.effect;
        this.acceleration.y = dy * settings.particles.effect;
        this.age = 0;
      }
      update(deltaTime) {
        this.position.x += this.velocity.x * deltaTime;
        this.position.y += this.velocity.y * deltaTime;
        this.velocity.x += this.acceleration.x * deltaTime;
        this.velocity.y += this.acceleration.y * deltaTime;
        this.age += deltaTime;
      }
      draw(context, image) {
        const ease = (t) => --t * t * t + 1;
        const size = image.width * ease(this.age / settings.particles.duration);
        context.globalAlpha = 1 - this.age / settings.particles.duration;
        context.drawImage(
          image,
          this.position.x - size / 2,
          this.position.y - size / 2,
          size,
          size
        );
      }
    }

    class ParticlePool {
      constructor(length) {
        this.particles = new Array(length).fill().map(() => new Particle());
        this.firstActive = 0;
        this.firstFree = 0;
        this.duration = settings.particles.duration;
      }

      add(x, y, dx, dy) {
        this.particles[this.firstFree].initialize(x, y, dx, dy);
        this.firstFree = (this.firstFree + 1) % this.particles.length;
        if (this.firstActive === this.firstFree) {
          this.firstActive = (this.firstActive + 1) % this.particles.length;
        }
      }

      update(deltaTime) {
        let i = this.firstActive;
        while (i !== this.firstFree) {
          this.particles[i].update(deltaTime);
          i = (i + 1) % this.particles.length;
        }
        while (
          this.particles[this.firstActive].age >= this.duration &&
          this.firstActive !== this.firstFree
        ) {
          this.firstActive = (this.firstActive + 1) % this.particles.length;
        }
      }

      draw(context, image) {
        let i = this.firstActive;
        while (i !== this.firstFree) {
          this.particles[i].draw(context, image);
          i = (i + 1) % this.particles.length;
        }
      }
    }

    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    const particles = new ParticlePool(settings.particles.length);
    const particleRate =
      settings.particles.length / settings.particles.duration;

    const pointOnHeart = (t) =>
      new Point(
        160 * Math.pow(Math.sin(t), 3),
        130 * Math.cos(t) -
          50 * Math.cos(2 * t) -
          20 * Math.cos(3 * t) -
          10 * Math.cos(4 * t) +
          25
      );

    const createHeartImage = () => {
      const tempCanvas = document.createElement("canvas");
      const ctx = tempCanvas.getContext("2d");
      tempCanvas.width = settings.particles.size;
      tempCanvas.height = settings.particles.size;

      const to = (t) => {
        const point = pointOnHeart(t);
        point.x =
          settings.particles.size / 2 +
          (point.x * settings.particles.size) / 350;
        point.y =
          settings.particles.size / 2 -
          (point.y * settings.particles.size) / 350;
        return point;
      };

      ctx.beginPath();
      let t = -Math.PI;
      let point = to(t);
      ctx.moveTo(point.x, point.y);
      while (t < Math.PI) {
        t += 0.01;
        point = to(t);
        ctx.lineTo(point.x, point.y);
      }
      ctx.closePath();
      ctx.fillStyle = "#f50b02";
      ctx.fill();

      const image = new Image();
      image.src = tempCanvas.toDataURL();
      return image;
    };

    const image = createHeartImage();
    let time = null;

    const render = () => {
      requestAnimFrame(render);
      const newTime = Date.now() / 1000;
      const deltaTime = newTime - (time || newTime);
      time = newTime;

      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
      context.clearRect(0, 0, canvas.width, canvas.height);

      const amount = particleRate * deltaTime;
      for (let i = 0; i < amount; i++) {
        const pos = pointOnHeart(Math.PI - 2 * Math.PI * Math.random());
        const dir = pos.clone().length(settings.particles.velocity);
        particles.add(
          canvas.width / 2 + pos.x,
          canvas.height / 2 - pos.y,
          dir.x,
          -dir.y
        );
      }

      particles.update(deltaTime);
      particles.draw(context, image);
    };

    render();
  }, []);

  return (
    <div
      style={{
        margin: 0,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        backgroundColor: "#262626",
        position: "relative",
        overflow: "hidden",
        textAlign: "center",
        color: "white",
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: "100%",
          height: "100%",
          position: "absolute",
          top: 0,
          left: 0,
        }}
      />
      <div
        style={{
          zIndex: 1,
          fontSize: "1.5rem",
          fontWeight: "bold",
          marginTop: "auto",
          marginBottom: "2rem",
          position: "relative",
        }}
      >
        Chúc mừng sinh nhật Lê Hoàng Bảo Phúc, best wish for you
      </div>
    </div>
  );
};

export default HeartParticles;
