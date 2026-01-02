export const Hero = ({ title, subtitle }) => {
  return (
    <div className="flex flex-col gap-8 items-center py-20 text-center">
      <h1 className="text-4xl lg:text-6xl font-bold max-w-3xl leading-tight">
        {title}
      </h1>
      <p className="text-lg lg:text-xl text-muted-foreground max-w-2xl">
        {subtitle}
      </p>
      {/*TODO CTA buttons?*/}
    </div>
  );
};