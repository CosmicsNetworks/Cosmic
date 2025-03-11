const Background = () => {
  return (
    <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10">
      {/* Deep space gradient backdrop */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-indigo-950/40 to-slate-950"></div>
      
      {/* Animated nebula/cosmic dust elements */}
      <div className="absolute bg-purple-500/10 w-96 h-96 blur-3xl -top-20 -left-20 rounded-full animate-[float_10s_ease-in-out_infinite]"></div>
      <div className="absolute bg-cyan-400/10 w-[30rem] h-[30rem] blur-3xl bottom-20 -right-20 rounded-full animate-[float_12s_ease-in-out_2s_infinite]"></div>
      <div className="absolute bg-fuchsia-500/10 w-[28rem] h-[28rem] blur-3xl top-1/3 left-1/4 rounded-full animate-[float_9s_ease-in-out_3s_infinite]"></div>
      <div className="absolute bg-indigo-400/10 w-[26rem] h-[26rem] blur-3xl top-2/3 left-1/3 rounded-full animate-[float_11s_ease-in-out_5s_infinite]"></div>
      
      {/* Star background patterns created with CSS - 3 layers of stars with different sizes and opacities */}
      <div 
        className="absolute inset-0 opacity-70"
        style={{
          backgroundImage: `
            radial-gradient(white, rgba(255,255,255,.3) 1px, transparent 30px),
            radial-gradient(white, rgba(255,255,255,.2) 1px, transparent 20px),
            radial-gradient(white, rgba(255,255,255,.1) 1px, transparent 25px)
          `,
          backgroundSize: '650px 650px, 350px 350px, 250px 250px',
          backgroundPosition: '0 0, 40px 60px, 130px 270px'
        }}
      ></div>
      
      {/* "Shooting star" effect - a subtle diagonal line */}
      <div className="absolute w-[150px] h-[1px] bg-gradient-to-r from-transparent via-white to-transparent top-[15%] left-[30%] rotate-[35deg] opacity-0 animate-[shooting-star_8s_ease-in-out_4s_infinite]"></div>
      <div className="absolute w-[100px] h-[1px] bg-gradient-to-r from-transparent via-white to-transparent top-[45%] right-[20%] rotate-[15deg] opacity-0 animate-[shooting-star_6s_ease-in-out_2s_infinite]"></div>
      
      {/* Add a subtle vignette effect to darken the edges */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent to-black/40 opacity-70"></div>
    </div>
  );
};

// Add CSS keyframes for shooting star animation in index.css
export default Background;
