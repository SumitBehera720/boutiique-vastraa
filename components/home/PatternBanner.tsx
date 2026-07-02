export default function PatternBanner({ heading }: { heading?: string }) {
  return (
    <section>
      <div className="relative bg-[url('/images/pattern-bg.jpg')] bg-cover bg-center bg-no-repeat py-8 sm:py-12 md:py-16 lg:py-20">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px]" />
        <h2 className="font-kalnia text-goldClr relative z-10 mb-8 text-center text-2xl font-medium sm:mb-12 sm:text-3xl md:text-4xl">
          {heading || "Spot it. Style it. Own it."}
        </h2>
      </div>
    </section>
  );
}
