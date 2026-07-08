"use client";

import type { ProductAttribute } from "@/lib/types";
import { parseAttributeOptions } from "@/lib/product-variants";

interface ProductVariantSelectorProps {
  attributes: ProductAttribute[];
  selected: Record<string, string>;
  onChange: (name: string, value: string) => void;
}

export default function ProductVariantSelector({
  attributes,
  selected,
  onChange,
}: ProductVariantSelectorProps) {
  return (
    <div className="product-variations">
      {attributes.map((attr) => {
        const options = parseAttributeOptions(attr.value);
        return (
          <div key={attr.name} className="variation-row">
            <label className="variation-label">{attr.name}</label>
            <div className="variation-options">
              {options.map((option) => {
                const isActive = selected[attr.name] === option;
                return (
                  <button
                    key={option}
                    type="button"
                    className={`variation-option${isActive ? " active" : ""}`}
                    onClick={() => onChange(attr.name, option)}
                    aria-pressed={isActive}
                  >
                    {option}
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
