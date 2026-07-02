export default function PatternBanner({ heading, mediaUrl, type }: { heading?: string; mediaUrl?: string; type?: "IMAGE" | "VIDEO" }) {
  const bgUrl = mediaUrl || "/images/pattern-bg.jpg";
  const isVideo = type === "VIDEO";

  return (
    <section>
      <div className="relative overflow-hidden py-8 sm:py-12 md:py-16 lg:py-20 flex items-center justify-center min-h-[160px] sm:min-h-[220px]">
        {isVideo ? (
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover z-0"
            src={bgUrl}
          />
        ) : (
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0"
            style={{ backgroundImage: `url('${bgUrl}')` }}
          />
        )}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] z-0" />
        <h2 className="font-kalnia text-[#C9A84C] relative z-10 text-center text-2xl font-medium sm:text-3xl md:text-4xl px-4">
          {heading || "Spot it. Style it. Own it."}
        </h2>
      </div>
    </section>
  );
}
