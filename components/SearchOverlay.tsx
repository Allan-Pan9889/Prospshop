"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/types";
import type { Product } from "@/lib/types";

interface SearchOverlayProps {
  open: boolean;
  onClose: () => void;
}

export default function SearchOverlay({ open, onClose }: SearchOverlayProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQuery("");
      setResults([]);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  useEffect(() => {
    if (query.length >= 2) {
      fetch(`/api/search?q=${encodeURIComponent(query)}&limit=8`)
        .then((res) => res.json())
        .then(setResults)
        .catch(() => setResults([]));
    } else {
      setResults([]);
    }
  }, [query]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="search-overlay">
      <div className="search-overlay-inner">
        <button
          className="search-close"
          onClick={onClose}
          aria-label="Close search"
        >
          ✕
        </button>
        <form
          className="search-form"
          onSubmit={(e) => {
            e.preventDefault();
            if (query) window.location.href = `/shop?q=${encodeURIComponent(query)}`;
          }}
        >
          <input
            ref={inputRef}
            type="text"
            placeholder="Search for products"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit">Search</button>
        </form>

        {results.length > 0 ? (
          <div className="search-results">
            {results.map((p) => (
              <Link
                key={p.slug}
                href={`/product/${p.slug}`}
                className="search-result-item"
                onClick={onClose}
              >
                <Image
                  src={p.image}
                  alt={p.title}
                  width={60}
                  height={75}
                  unoptimized
                />
                <div>
                  <span className="search-result-title">{p.title}</span>
                  <span className="search-result-price">
                    {formatPrice(p.price)}
                  </span>
                </div>
              </Link>
            ))}
            <Link
              href={`/shop?q=${encodeURIComponent(query)}`}
              className="search-view-all"
              onClick={onClose}
            >
              View all results
            </Link>
          </div>
        ) : (
          <p className="search-hint">
            {query.length >= 2
              ? "No products found."
              : "Start typing to see products you are looking for."}
          </p>
        )}
      </div>
    </div>
  );
}
