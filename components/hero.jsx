export const Hero = ({ title, subtitle, bgImage }) => {
  return (
    <div 
      className="w-full h-[60vh] min-h-[720px] max-h-[1200px] flex-1 flex flex-col gap-8 items-center justify-center text-center bg-cover bg-center bg-no-repeat relative px-4"
      style={{ 
        backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.5), rgba(0,0,0,0.7)), url(${bgImage})` 
      }}
    >
      <div className="max-w-5xl flex flex-col items-center gap-6">
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight text-white drop-shadow-lg">
          {title}
        </h1>
        <p className="text-lg md:text-2xl text-white/90 max-w-2xl drop-shadow-md">
          {subtitle}
        </p>

        <div className="flex flex-wrap justify-center gap-4 mt-8">
          <button className="bg-white text-black hover:bg-white/90 px-8 py-4 rounded-full font-bold transition-all transform hover:scale-105">
            Get Started
          </button>
          <button className="bg-transparent border-2 border-white text-white hover:bg-white/10 px-8 py-4 rounded-full font-bold transition-all">
            Learn More
          </button>
        </div>
      </div>
    </div>
  );
};