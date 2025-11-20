import React, { useRef, useEffect } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  opacity: number;
}

const ParticleNetworkBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameRef = useRef<number>(0);
  const mouseRef = useRef({ x: -1000, y: -1000 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      createParticles();
    };

    const createParticles = () => {
      // Clear existing particles
      particlesRef.current = [];
      
      // Calculate number of particles based on screen size
      const particleCount = Math.floor((canvas.width * canvas.height) / 15000);
      
      // Create particles
      for (let i = 0; i < particleCount; i++) {
        particlesRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          radius: Math.random() * 1.5 + 1,
          color: getRandomColor(),
          opacity: Math.random() * 0.5 + 0.2
        });
      }
    };

    const getRandomColor = () => {
      const colors = ['#3B82F6', '#6366F1', '#8B5CF6', '#EC4899'];
      return colors[Math.floor(Math.random() * colors.length)];
    };

    const draw = () => {
      if (!canvas || !ctx) return;
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw particles and connections
      ctx.globalCompositeOperation = 'lighter';
      
      const particles = particlesRef.current;
      const connectionDistance = 150;
      const mouseInteractionDistance = 200;
      
      // Update and draw particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        
        // Move particles
        p.x += p.vx;
        p.y += p.vy;
        
        // Bounce off edges
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        
        // Mouse interaction
        const dx = mouseRef.current.x - p.x;
        const dy = mouseRef.current.y - p.y;
        const mouseDistance = Math.sqrt(dx * dx + dy * dy);
        
        if (mouseDistance < mouseInteractionDistance) {
          const angle = Math.atan2(dy, dx);
          const force = (mouseInteractionDistance - mouseDistance) / mouseInteractionDistance;
          p.vx -= Math.cos(angle) * force * 0.2;
          p.vy -= Math.sin(angle) * force * 0.2;
        }
        
        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;
        ctx.fill();
        
        // Draw connections
        ctx.beginPath();
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < connectionDistance) {
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = p.color;
            ctx.globalAlpha = (connectionDistance - distance) / connectionDistance * 0.2;
            ctx.lineWidth = 1;
          }
        }
        ctx.stroke();
      }
      
      // Reset global alpha
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
      
      // Continue animation
      animationFrameRef.current = requestAnimationFrame(draw);
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = {
        x: e.clientX,
        y: e.clientY
      };
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        mouseRef.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY
        };
      }
    };

    // Set up canvas
    handleResize();
    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    
    // Start animation
    animationFrameRef.current = requestAnimationFrame(draw);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full -z-10 bg-transparent"
      style={{ pointerEvents: 'none' }}
    />
  );
};

export default ParticleNetworkBackground;