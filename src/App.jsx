import React, { useState, useEffect, useRef } from "react";
import { Heart, Star } from "lucide-react";
import { Link } from "react-router-dom";

const BirthdayLoveApp = () => {
  const [name, setName] = useState("Lê Hoàng Bảo Phúc");
  const [showAnimation, setShowAnimation] = useState(false);
  const [hearts, setHearts] = useState([]);
  const [fireworks, setFireworks] = useState([]);
  const [roundFireworks, setRoundFireworks] = useState([]);
  const [flamesLit, setFlamesLit] = useState(true);
  const [showPhotobook, setShowPhotobook] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [showHeartLine, setShowHeartLine] = useState(false);
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  // Heart particles animation settings
  const heartSettings = {
    particles: {
      length: 5000,
      duration: 4,
      velocity: 80,
      effect: -1.3,
      size: 8,
    },
  };

  // Generate floating hearts
  useEffect(() => {
    if (showAnimation) {
      const heartInterval = setInterval(() => {
        const newHeart = {
          id: Math.random(),
          left: Math.random() * 100,
          delay: Math.random() * 2,
        };
      }, 500);

      return () => clearInterval(heartInterval);
    }
  }, [showAnimation]);

  // Generate fireworks
  useEffect(() => {
    if (showAnimation) {
      const fireworkInterval = setInterval(() => {
        const newFirework = {
          id: Math.random(),
          left: 20 + Math.random() * 60,
          top: 20 + Math.random() * 40,
          color: ["#ff6b6b", "#4ecdc4", "#45b7d1", "#f9ca24", "#f0932b"][
            Math.floor(Math.random() * 5)
          ],
        };
        setFireworks((prev) => [...prev.slice(-10), newFirework]);
      }, 1500);

      return () => clearInterval(fireworkInterval);
    }
  }, [showAnimation]);

  // Generate round fireworks
  useEffect(() => {
    if (showAnimation) {
      const roundFireworkInterval = setInterval(() => {
        const newRoundFirework = {
          id: Math.random(),
          left: 10 + Math.random() * 80,
          top: 10 + Math.random() * 60,
          color: [
            "#ff1744",
            "#e91e63",
            "#9c27b0",
            "#673ab7",
            "#3f51b5",
            "#2196f3",
            "#00bcd4",
            "#009688",
            "#4caf50",
            "#8bc34a",
            "#cddc39",
            "#ffeb3b",
            "#ffc107",
            "#ff9800",
            "#ff5722",
          ][Math.floor(Math.random() * 15)],
          size: 150 + Math.random() * 200,
        };
      }, 2000);

      return () => clearInterval(roundFireworkInterval);
    }
  }, [showAnimation]);

  // Heart particles animation setup
  useEffect(() => {
    if (showHeartLine && canvasRef.current) {
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      // Resize canvas to fill container
      const resizeCanvas = () => {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
      };

      resizeCanvas();
      window.addEventListener("resize", resizeCanvas);

      // Point class
      function Point(x, y) {
        this.x = typeof x !== "undefined" ? x : 0;
        this.y = typeof y !== "undefined" ? y : 0;
      }

      Point.prototype.clone = function () {
        return new Point(this.x, this.y);
      };

      Point.prototype.length = function (length) {
        if (typeof length == "undefined") {
          return Math.sqrt(this.x * this.x + this.y * this.y);
        }
        this.normalize();
        this.x *= length;
        this.y *= length;
        return this;
      };

      Point.prototype.normalize = function () {
        var length = this.length();
        this.x /= length;
        this.y /= length;
        return this;
      };

      // Particle class
      function Particle() {
        this.position = new Point();
        this.velocity = new Point();
        this.acceleration = new Point();
        this.age = 0;
      }

      Particle.prototype.initialize = function (x, y, dx, dy) {
        this.position.x = x;
        this.position.y = y;
        this.velocity.x = dx;
        this.velocity.y = dy;
        this.acceleration.x = dx * heartSettings.particles.effect;
        this.acceleration.y = dy * heartSettings.particles.effect;
        this.age = 0;
      };

      Particle.prototype.update = function (deltaTime) {
        this.position.x += this.velocity.x * deltaTime;
        this.position.y += this.velocity.y * deltaTime;
        this.velocity.x += this.acceleration.x * deltaTime;
        this.velocity.y += this.acceleration.y * deltaTime;
        this.age += deltaTime;
      };

      Particle.prototype.draw = function (context, image) {
        function ease(t) {
          return --t * t * t + 1;
        }
        var size =
          image.width * ease(this.age / heartSettings.particles.duration);
        context.globalAlpha = 1 - this.age / heartSettings.particles.duration;
        context.drawImage(
          image,
          this.position.x - size / 2,
          this.position.y - size / 2,
          size,
          size
        );
      };

      // ParticlePool class
      function ParticlePool(length) {
        this.particles = new Array(length);
        this.firstActive = 0;
        this.firstFree = 0;
        this.duration = heartSettings.particles.duration;

        for (var i = 0; i < this.particles.length; i++) {
          this.particles[i] = new Particle();
        }
      }

      ParticlePool.prototype.add = function (x, y, dx, dy) {
        this.particles[this.firstFree].initialize(x, y, dx, dy);
        this.firstFree++;
        if (this.firstFree == this.particles.length) this.firstFree = 0;
        if (this.firstActive == this.firstFree) this.firstActive++;
        if (this.firstActive == this.particles.length) this.firstActive = 0;
      };

      ParticlePool.prototype.update = function (deltaTime) {
        var i;
        if (this.firstActive < this.firstFree) {
          for (i = this.firstActive; i < this.firstFree; i++) {
            this.particles[i].update(deltaTime);
          }
        }
        if (this.firstFree < this.firstActive) {
          for (i = this.firstActive; i < this.particles.length; i++) {
            this.particles[i].update(deltaTime);
          }
          for (i = 0; i < this.firstFree; i++) {
            this.particles[i].update(deltaTime);
          }
        }
        while (
          this.particles[this.firstActive].age >= this.duration &&
          this.firstActive != this.firstFree
        ) {
          this.firstActive++;
          if (this.firstActive == this.particles.length) this.firstActive = 0;
        }
      };

      ParticlePool.prototype.draw = function (context, image) {
        var i;
        if (this.firstActive < this.firstFree) {
          for (i = this.firstActive; i < this.firstFree; i++) {
            this.particles[i].draw(context, image);
          }
        }
        if (this.firstFree < this.firstActive) {
          for (i = this.firstActive; i < this.particles.length; i++) {
            this.particles[i].draw(context, image);
          }
          for (i = 0; i < this.firstFree; i++) {
            this.particles[i].draw(context, image);
          }
        }
      };

      // Heart shape function
      function pointOnHeart(t) {
        return new Point(
          160 * Math.pow(Math.sin(t), 3),
          130 * Math.cos(t) -
            50 * Math.cos(2 * t) -
            20 * Math.cos(3 * t) -
            10 * Math.cos(4 * t) +
            25
        );
      }

      // Create heart image
      const createHeartImage = () => {
        const heartCanvas = document.createElement("canvas");
        const heartContext = heartCanvas.getContext("2d");
        heartCanvas.width = heartSettings.particles.size;
        heartCanvas.height = heartSettings.particles.size;

        function to(t) {
          var point = pointOnHeart(t);
          point.x =
            heartSettings.particles.size / 2 +
            (point.x * heartSettings.particles.size) / 350;
          point.y =
            heartSettings.particles.size / 2 -
            (point.y * heartSettings.particles.size) / 350;
          return point;
        }

        heartContext.beginPath();
        var t = -Math.PI;
        var point = to(t);
        heartContext.moveTo(point.x, point.y);
        while (t < Math.PI) {
          t += 0.01;
          point = to(t);
          heartContext.lineTo(point.x, point.y);
        }
        heartContext.closePath();
        heartContext.fillStyle = "#ff1744";
        heartContext.fill();

        const image = new Image();
        image.src = heartCanvas.toDataURL();
        return image;
      };

      const heartImage = createHeartImage();
      const particles = new ParticlePool(heartSettings.particles.length);
      const particleRate =
        heartSettings.particles.length / heartSettings.particles.duration;
      let time;

      // Animation loop
      function render() {
        animationRef.current = requestAnimationFrame(render);

        const newTime = new Date().getTime() / 1000;
        const deltaTime = newTime - (time || newTime);
        time = newTime;

        context.clearRect(0, 0, canvas.width, canvas.height);

        const amount = particleRate * deltaTime;
        for (let i = 0; i < amount; i++) {
          const pos = pointOnHeart(Math.PI - 2 * Math.PI * Math.random());
          const dir = pos.clone().length(heartSettings.particles.velocity);
          particles.add(
            canvas.width / 2 + pos.x,
            canvas.height / 2 - pos.y,
            dir.x,
            -dir.y
          );
        }

        particles.update(deltaTime);
        particles.draw(context, heartImage);
      }

      // Start animation
      setTimeout(() => {
        render();
      }, 100);

      // Cleanup function
      return () => {
        window.removeEventListener("resize", resizeCanvas);
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    }
  }, [showHeartLine]);

  const handleSubmit = () => {
    if (name.trim()) {
      setShowAnimation(true);
      setFlamesLit(true);
      setShowPhotobook(false);
      setCurrentPage(0);
      setShowHeartLine(false);
    }
  };

  const photos = [
    {
      id: 1,
      caption: "Công chúa ngủ trên giường",
      image: "/1.jpg",
    },
    {
      id: 2,
      caption: "Cổ cười",
      image: "/2.jpg",
    },
    {
      id: 3,
      caption: "Cổ che mắt",
      image: "/3.jpg",
    },
    {
      id: 4,
      caption: "Cổ nhìn tui",
      image: "/4.jpg",
    },
    {
      id: 5,
      caption: "Cổ xinh đẹp",
      image: "/5.jpg",
    },
    {
      id: 6,
      caption: "Nàng thơ",
      image: "/6.jpg",
    },
  ];

  const nextPage = () => {
    if (currentPage < photos.length - 1) {
      setCurrentPage(currentPage + 1);
    } else {
      // Show heart line animation at the end
      setShowHeartLine(true);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const Cake = () => (
    <div className="relative">
      {/* Orange cake plate */}
      <div className="w-40 h-6 bg-orange-400 rounded-full mx-auto shadow-lg"></div>

      {/* Bottom chocolate layer */}
      <div className="w-36 h-16 bg-amber-800 rounded-lg relative mx-auto -mt-2 shadow-lg">
        <div className="w-full h-1 bg-amber-900 absolute top-2"></div>
        <div className="w-full h-1 bg-amber-900 absolute top-6"></div>
        <div className="w-full h-1 bg-amber-900 absolute top-10"></div>

        <div className="absolute -bottom-1 left-2 w-3 h-4 bg-pink-300 rounded-b-full"></div>
        <div className="absolute -bottom-1 left-8 w-2 h-3 bg-pink-300 rounded-b-full"></div>
        <div className="absolute -bottom-1 right-2 w-3 h-4 bg-pink-300 rounded-b-full"></div>
        <div className="absolute -bottom-1 right-8 w-2 h-3 bg-pink-300 rounded-b-full"></div>
      </div>

      {/* Pink cream layer */}
      <div className="w-36 h-3 bg-pink-300 rounded-lg relative mx-auto -mt-1"></div>

      {/* Top chocolate layer */}
      <div className="w-32 h-12 bg-amber-800 rounded-lg relative mx-auto -mt-1 shadow-lg">
        <div className="w-full h-1 bg-amber-900 absolute top-2"></div>
        <div className="w-full h-1 bg-amber-900 absolute top-6"></div>

        <div className="absolute -bottom-1 left-1 w-2 h-3 bg-sky-300 rounded-b-full"></div>
        <div className="absolute -bottom-1 left-6 w-3 h-4 bg-sky-300 rounded-b-full"></div>
        <div className="absolute -bottom-1 right-1 w-2 h-3 bg-sky-300 rounded-b-full"></div>
        <div className="absolute -bottom-1 right-6 w-3 h-4 bg-sky-300 rounded-b-full"></div>
      </div>

      {/* Blue frosting top */}
      <div className="w-32 h-8 bg-sky-300 rounded-lg relative mx-auto -mt-1 shadow-inner">
        <div className="absolute top-2 left-3 w-1 h-1 bg-red-500 rounded-full"></div>
        <div className="absolute top-3 left-8 w-1 h-1 bg-yellow-500 rounded-full"></div>
        <div className="absolute top-2 right-3 w-1 h-1 bg-green-500 rounded-full"></div>
        <div className="absolute top-4 left-12 w-1 h-1 bg-purple-500 rounded-full"></div>
        <div className="absolute top-3 right-8 w-1 h-1 bg-pink-500 rounded-full"></div>
        <div className="absolute top-1 left-16 w-1 h-1 bg-orange-500 rounded-full"></div>
        <div className="absolute top-4 right-12 w-1 h-1 bg-blue-600 rounded-full"></div>

        <div className="absolute top-1 left-6 text-xs">💝</div>
        <div className="absolute top-3 right-5 text-xs">💖</div>
      </div>

      {/* Main candle with blue spiral */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-12">
        <div className="w-3 h-16 bg-white rounded-sm relative shadow-md">
          <div className="absolute top-2 left-0 w-full h-2 bg-blue-500 transform -skew-y-12 opacity-80"></div>
          <div className="absolute top-6 left-0 w-full h-2 bg-blue-500 transform skew-y-12 opacity-80"></div>
          <div className="absolute top-10 left-0 w-full h-2 bg-blue-500 transform -skew-y-12 opacity-80"></div>
          <div className="absolute top-14 left-0 w-full h-2 bg-blue-500 transform skew-y-12 opacity-80"></div>
        </div>

        {flamesLit && (
          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
            <div className="w-4 h-8 bg-gradient-to-t from-orange-500 via-yellow-400 to-yellow-200 rounded-full animate-pulse relative">
              <div className="absolute inset-0 bg-gradient-to-t from-red-500 via-orange-400 to-yellow-300 rounded-full animate-bounce opacity-80"></div>
              <div className="absolute top-1 left-1/2 transform -translate-x-1/2 w-2 h-4 bg-gradient-to-t from-orange-600 to-yellow-100 rounded-full opacity-90"></div>
            </div>
          </div>
        )}
      </div>

      {/* Star candles */}
      <div className="absolute top-0 left-1/4 transform -translate-x-1/2 -translate-y-8">
        <div className="w-1 h-8 bg-yellow-300 rounded-sm"></div>
        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 text-yellow-400 text-lg">
          ⭐
        </div>
        {flamesLit && (
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
            <div className="w-2 h-4 bg-gradient-to-t from-orange-500 to-yellow-300 rounded-full animate-pulse"></div>
          </div>
        )}
      </div>

      <div className="absolute top-0 left-3/4 transform -translate-x-1/2 -translate-y-8">
        <div className="w-1 h-8 bg-yellow-300 rounded-sm"></div>
        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 text-yellow-400 text-lg">
          ⭐
        </div>
        {flamesLit && (
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
            <div className="w-2 h-4 bg-gradient-to-t from-orange-500 to-yellow-300 rounded-full animate-pulse"></div>
          </div>
        )}
      </div>

      <div className="absolute top-0 right-1/4 transform translate-x-1/2 -translate-y-6">
        <div className="w-1 h-6 bg-yellow-300 rounded-sm"></div>
        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 text-yellow-400 text-lg">
          ⭐
        </div>
        {flamesLit && (
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
            <div className="w-2 h-4 bg-gradient-to-t from-orange-500 to-yellow-300 rounded-full animate-pulse"></div>
          </div>
        )}
      </div>
    </div>
  );

  const FloatingHeart = ({ heart }) => (
    <div
      key={heart.id}
      className="absolute animate-bounce"
      style={{
        left: `${heart.left}%`,
        bottom: "0%",
        animationDelay: `${heart.delay}s`,
        animationDuration: "3s",
      }}
    >
      <Heart className="text-red-500 w-6 h-6 fill-current animate-pulse" />
    </div>
  );

  const Firework = ({ firework }) => (
    <div
      key={firework.id}
      className="absolute animate-ping"
      style={{
        left: `${firework.left}%`,
        top: `${firework.top}%`,
        color: firework.color,
      }}
    >
      <Star className="w-4 h-4 fill-current" />
    </div>
  );

  const RoundFirework = ({ firework }) => (
    <div
      key={firework.id}
      className="absolute"
      style={{
        left: `${firework.left}%`,
        top: `${firework.top}%`,
        width: `${firework.size}px`,
        height: `${firework.size}px`,
        animation: "fireworkExplosion 4s ease-out forwards",
      }}
    >
      <div
        className="absolute inset-0 rounded-full opacity-90"
        style={{
          background: `radial-gradient(circle, ${firework.color} 0%, ${firework.color}80 30%, ${firework.color}40 60%, transparent 100%)`,
          boxShadow: `0 0 50px ${firework.color}, 0 0 100px ${firework.color}60, 0 0 150px ${firework.color}30`,
          animation: "pulse 0.8s ease-out",
        }}
      ></div>

      {[...Array(32)].map((_, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            left: "50%",
            top: "50%",
            width: "4px",
            height: `${firework.size * 0.8}px`,
            background: `linear-gradient(to bottom, ${firework.color} 0%, ${firework.color}80 30%, transparent 100%)`,
            transformOrigin: "50% 0%",
            transform: `translate(-50%, -50%) rotate(${i * 11.25}deg)`,
            animation: `fireworkStreak 2.5s ease-out ${i * 0.015}s forwards`,
            boxShadow: `0 0 8px ${firework.color}`,
          }}
        ></div>
      ))}

      {[...Array(24)].map((_, i) => (
        <div
          key={`particle-${i}`}
          className="absolute w-3 h-3 rounded-full"
          style={{
            left: "50%",
            top: "50%",
            backgroundColor: firework.color,
            transform: `translate(-50%, -50%) rotate(${
              i * 15
            }deg) translateY(-${firework.size * 0.5}px)`,
            animation: `particleSpread 3s ease-out ${i * 0.02}s forwards`,
            boxShadow: `0 0 10px ${firework.color}`,
          }}
        ></div>
      ))}

      <div
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full"
        style={{
          backgroundColor: "#ffffff",
          boxShadow: `0 0 40px ${firework.color}, 0 0 80px #ffffff`,
          animation: "centerFlash 1s ease-out forwards",
        }}
      ></div>
    </div>
  );

  const Photobook = () => (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
      {/* Photobook Container with custom cover design */}
      <div
        className="relative rounded-lg shadow-2xl max-w-4xl w-full max-h-screen overflow-hidden"
        style={{
          transform: "perspective(1000px) rotateX(5deg)",
          boxShadow:
            "0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1)",
          // Custom book cover background - you can change this
          background:
            "linear-gradient(135deg, #8B4513 0%, #D2691E 50%, #8B4513 100%)", // Brown leather look
          // Alternative options:
          // background: "linear-gradient(135deg, #2C3E50 0%, #34495E 100%)", // Dark blue
          // background: "linear-gradient(135deg, #8E44AD 0%, #9B59B6 100%)", // Purple
          // background: "linear-gradient(135deg, #E74C3C 0%, #C0392B 100%)", // Red
          // background: "linear-gradient(135deg, #27AE60 0%, #2ECC71 100%)", // Green
        }}
      >
        {/* Book spine shadow effect */}
        <div className="absolute left-1/2 top-0 w-1 h-full bg-black bg-opacity-30 transform -translate-x-1/2 z-10"></div>

        {/* Optional: Add texture overlay for leather/fabric effect */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='white' fill-opacity='0.1'%3E%3Cpath d='m0 40l40-40h-40v40zm40 0v-40h-40l40 40z'/%3E%3C/g%3E%3C/svg%3E")`,
          }}
        ></div>

        {/* Book title on cover - visible when closed */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center text-white drop-shadow-lg">
            <h1 className="text-5xl font-bold mb-4 font-serif tracking-wide">
              Memory Book
            </h1>
            <div className="w-32 h-1 bg-gold mx-auto mb-4 opacity-80"></div>
            <p className="text-2xl font-handwriting italic opacity-90">
              Celebrating {name}
            </p>
            <div className="mt-6 text-4xl opacity-75">📖✨</div>
          </div>
        </div>

        {/* Left page */}
        <div className="flex h-full">
          <div className="w-1/2 p-8 bg-gradient-to-r from-gray-50 to-white relative">
            {/* Page shadow */}
            <div className="absolute right-0 top-0 w-8 h-full bg-gradient-to-l from-gray-200 to-transparent opacity-30"></div>

            {currentPage > 0 && (
              <div className="h-full flex flex-col">
                {/* Previous page content */}
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <div className="bg-white p-4 rounded-lg shadow-md mb-4 transform -rotate-1">
                      <img
                        src={photos[currentPage - 1].image}
                        alt={photos[currentPage - 1].caption}
                        className="w-full h-64 object-cover rounded"
                      />
                    </div>
                    <p className="text-gray-700 font-handwriting text-lg italic">
                      {photos[currentPage - 1].caption}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {currentPage === 0 && (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-4xl font-bold text-gray-800 mb-4 font-serif">
                    📖 Memory Book
                  </h1>
                  <p className="text-2xl text-gray-600 font-handwriting italic">
                    Celebrating {name}
                  </p>
                  <div className="mt-8 text-6xl">💕</div>
                </div>
              </div>
            )}
          </div>

          {/* Right page */}
          <div className="w-1/2 p-8 bg-gradient-to-l from-gray-50 to-white relative">
            {/* Page shadow */}
            <div className="absolute left-0 top-0 w-8 h-full bg-gradient-to-r from-gray-200 to-transparent opacity-30"></div>

            <div className="h-full flex flex-col">
              {/* Current page content */}
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="bg-white p-4 rounded-lg shadow-md mb-4 transform rotate-1">
                    <img
                      src={photos[currentPage].image}
                      alt={photos[currentPage].caption}
                      className="w-full h-64 object-cover rounded"
                    />
                  </div>
                  <p className="text-gray-700 font-handwriting text-lg italic">
                    {photos[currentPage].caption}
                  </p>

                  {/* Decorative elements */}
                  <div className="mt-4 flex justify-center space-x-2">
                    <span className="text-2xl">✨</span>
                    <span className="text-2xl">💖</span>
                    <span className="text-2xl">✨</span>
                  </div>
                </div>
              </div>

              {/* Page number */}
              <div className="text-center text-sm text-gray-400 font-serif">
                {currentPage + 1}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation controls */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center space-x-4 bg-white bg-opacity-90 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg">
          <button
            onClick={prevPage}
            disabled={currentPage === 0}
            className={`p-2 rounded-full transition-all ${
              currentPage === 0
                ? "text-gray-400 cursor-not-allowed"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </button>

          <div className="flex space-x-1">
            {photos.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentPage ? "bg-pink-500 w-6" : "bg-gray-300"
                }`}
              />
            ))}
          </div>

          <button
            onClick={nextPage}
            className="p-2 rounded-full text-gray-700 hover:bg-gray-100 transition-all"
          >
            {currentPage === photos.length - 1 ? (
              <Link to="/hearts">
                <span className="text-sm px-2">💝</span>
              </Link>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </button>
        </div>

        {/* Close button */}
        <button
          onClick={() => setShowPhotobook(false)}
          className="absolute top-4 right-4 w-10 h-10 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full flex items-center justify-center transition-all shadow-md backdrop-blur-sm"
        >
          <svg
            className="w-5 h-5 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );

  const HeartLine = () => (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ background: "#262626" }}
      />

      <div className="relative z-10 text-center">
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-white mb-4">
            Thank you for the memories! 💕
          </h2>
          <p className="text-xl text-pink-300 mb-4">
            Floating hearts of love for you! ❤️
          </p>
        </div>

        <button
          onClick={() => {
            setShowHeartLine(false);
            setShowPhotobook(false);
            setShowAnimation(false);
            setName("");
            setHearts([]);
            setFireworks([]);
          }}
          className="bg-pink-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-pink-700 transition-all"
        >
          Start New Celebration 🎉
        </button>
      </div>
    </div>
  );

  if (!showAnimation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-400 via-purple-500 to-indigo-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="mb-8">
            <Heart className="w-16 h-16 text-red-500 mx-auto mb-4 animate-pulse fill-current" />
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Birthday Love
            </h1>
            <p className="text-gray-600">Only for you, {name}!</p>
          </div>

          <div className="space-y-6">
            <input
              type="text"
              value={name}
              readOnly
              placeholder="Your beautiful name..."
              className="w-full p-4 border-2 border-pink-300 rounded-xl text-center text-lg focus:outline-none focus:border-pink-500 transition-colors"
            />

            <button
              onClick={handleSubmit}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-4 rounded-xl text-lg font-semibold hover:from-pink-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
            >
              🎉 Start Celebration 🎉
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden">
      {/* Animated Background */}
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-10 left-10 w-4 h-4 bg-yellow-300 rounded-full animate-ping"></div>
        <div className="absolute top-20 right-20 w-3 h-3 bg-pink-300 rounded-full animate-ping"></div>
        <div className="absolute bottom-20 left-20 w-5 h-5 bg-blue-300 rounded-full animate-ping"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-white mb-4 fade-in-blur">
            Happy Birthday {name}! 🎉
          </h1>
          <p
            className="text-2xl text-pink-200 fade-in-blur"
            style={{
              animationDelay: "1s",
              paddingBottom: "20px",
            }}
          >
            Sending you love and joy! 💕
          </p>
        </div>

        {/* Birthday Cake */}
        <div className="mb-12 mt-10">
          <Cake />
        </div>

        {/* Love Message */}
        <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-3xl p-8 mb-8 max-w-lg">
          <div className="text-white text-lg leading-relaxed">
            <p className="mb-4">✨ May your special day be filled with ✨</p>
            <p className="mb-2">💖 Endless love and laughter</p>
            <p className="mb-2">🎈 Joy that never fades</p>
            <p className="mb-2">🌟 Dreams that come true</p>
            <p>🎂 And cake that tastes amazing!</p>
          </div>
        </div>

        {/* Candle Blower Button */}
        <button
          onClick={() => {
            setFlamesLit(false);
            setShowPhotobook(true);
          }}
          className="bg-opacity-20 hover:bg-opacity-30 text-white px-8 py-3 rounded-full font-semibold transition-all duration-200 backdrop-blur-sm border border-white border-opacity-30 flex items-center gap-2"
        >
          💨 Blow Out Candles 💨
        </button>
      </div>

      {/* Floating Hearts */}
      {hearts.map((heart) => (
        <FloatingHeart key={heart.id} heart={heart} />
      ))}

      {/* Star Fireworks */}
      {fireworks.map((firework) => (
        <Firework key={firework.id} firework={firework} />
      ))}

      {/* Round Fireworks */}
      {roundFireworks.map((firework) => (
        <RoundFirework key={firework.id} firework={firework} />
      ))}

      {/* Additional animated elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              fontSize: `${12 + Math.random() * 8}px`,
            }}
          >
            {
              ["💖", "🎉", "🎈", "✨", "🌟", "💫"][
                Math.floor(Math.random() * 6)
              ]
            }
          </div>
        ))}
      </div>

      {/* Photobook Modal */}
      {showPhotobook && <Photobook />}

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes fireworkExplosion {
          0% {
            transform: scale(0);
            opacity: 1;
          }
          50% {
            transform: scale(0.8);
            opacity: 0.9;
          }
          100% {
            transform: scale(1.2);
            opacity: 0;
          }
        }

        @keyframes fireworkStreak {
          0% {
            height: 0px;
            opacity: 1;
          }
          30% {
            opacity: 0.8;
          }
          100% {
            opacity: 0;
          }
        }

        @keyframes particleSpread {
          0% {
            opacity: 1;
          }
          100% {
            opacity: 0;
          }
        }

        @keyframes centerFlash {
          0% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.5);
            opacity: 0.8;
          }
          100% {
            transform: translate(-50%, -50%) scale(0.5);
            opacity: 0;
          }
        }

        @keyframes fadeInBlur {
          0% {
            opacity: 0;
            filter: blur(10px);
            transform: scale(0.8);
          }
          100% {
            opacity: 1;
            filter: blur(0px);
            transform: scale(1);
          }
        }

        .fade-in-blur {
          animation: fadeInBlur 3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default BirthdayLoveApp;
