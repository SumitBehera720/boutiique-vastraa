"use client";

export default function VariantSelector({ options, selectedOptions, onChange }: { 
  options: any[]; 
  selectedOptions: any[];
  onChange: (name: string, value: string) => void;
}) {
  if (!options || options.length === 0 || (options.length === 1 && options[0].name === "Title")) {
    return null; // Don't show selector for single default variant
  }

  return (
    <div className="flex flex-col gap-6 mb-6">
      {options.map((option) => {
        const selectedValue = selectedOptions.find((o) => o.name === option.name)?.value;

        return (
          <div key={option.name}>
            <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wider mb-3">
              {option.name}
            </h3>
            <div className="flex flex-wrap gap-3">
              {option.values.map((val: string) => {
                const isSelected = selectedValue === val;
                
                return (
                  <button
                    key={val}
                    onClick={() => onChange(option.name, val)}
                    className={`px-4 py-2 border text-sm font-medium transition-all ${
                      isSelected 
                        ? "border-primary bg-primary text-white" 
                        : "border-gray-300 text-gray-700 hover:border-primary hover:text-primary"
                    } ${option.name.toLowerCase() === 'color' && val.match(/^[0-9a-fA-F]{6}$/) ? 'w-10 h-10 rounded-full p-0 flex items-center justify-center' : 'rounded'}`}
                  >
                    {option.name.toLowerCase() === 'color' && val.match(/^[0-9a-fA-F]{6}$/) ? (
                      <span 
                        className="w-full h-full rounded-full block border border-black/10" 
                        style={{ backgroundColor: `#${val}` }}
                      />
                    ) : (
                      val
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
