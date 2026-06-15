import Image from "next/image";

export default function CollectionHeader({ collection }: { collection: any }) {
  if (!collection) return null;

  return (
    <div className="relative w-full h-64 md:h-80 bg-primary/10 overflow-hidden mb-8">
      {collection.image && (
        <Image
          src={collection.image.url}
          alt={collection.image.altText || collection.title}
          fill
          className="object-cover object-center opacity-30"
          priority
        />
      )}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
        <h1 className="text-4xl md:text-5xl font-serif text-primary font-bold mb-4 drop-shadow-sm">
          {collection.title}
        </h1>
        {collection.description && (
          <p className="max-w-2xl text-gray-700 text-sm md:text-base">
            {collection.description}
          </p>
        )}
      </div>
    </div>
  );
}
