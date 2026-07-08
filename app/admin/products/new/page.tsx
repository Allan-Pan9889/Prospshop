"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(e.currentTarget);
    const categories = (form.get("categories") as string)
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const body = {
      slug: form.get("slug") as string,
      title: form.get("title") as string,
      price: Number(form.get("price")),
      image: form.get("image") as string,
      categories,
      description: (form.get("description") as string) || undefined,
      hot: form.get("hot") === "on",
      inStock: form.get("inStock") === "on",
      status: form.get("status") as string,
    };

    const res = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Failed to create product");
      setLoading(false);
      return;
    }

    const product = await res.json();
    router.push(`/admin/products/${product.id}`);
  }

  return (
    <div>
      <div className="admin-page-header">
        <h2>New Product</h2>
        <Link href="/admin/products" className="admin-btn admin-btn-secondary">
          ← Back
        </Link>
      </div>

      <form className="admin-form" onSubmit={handleSubmit}>
        {error && <p style={{ color: "#dc2626", marginBottom: 16 }}>{error}</p>}

        <div className="admin-form-row">
          <div className="admin-form-group">
            <label>Title *</label>
            <input name="title" required />
          </div>
          <div className="admin-form-group">
            <label>Slug *</label>
            <input name="slug" required placeholder="product-slug" />
          </div>
        </div>

        <div className="admin-form-row">
          <div className="admin-form-group">
            <label>Price (₹) *</label>
            <input name="price" type="number" step="0.01" min="0" required />
          </div>
          <div className="admin-form-group">
            <label>Status</label>
            <select name="status" defaultValue="published">
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>

        <div className="admin-form-group">
          <label>Image URL *</label>
          <input name="image" type="url" required />
        </div>

        <div className="admin-form-group">
          <label>Categories (comma-separated)</label>
          <input name="categories" placeholder="Saree, New Arrival" />
        </div>

        <div className="admin-form-group">
          <label>Description</label>
          <textarea name="description" />
        </div>

        <div className="admin-form-row">
          <label className="admin-checkbox">
            <input name="hot" type="checkbox" />
            Hot product
          </label>
          <label className="admin-checkbox">
            <input name="inStock" type="checkbox" defaultChecked />
            In stock
          </label>
        </div>

        <div className="admin-form-actions">
          <button
            type="submit"
            className="admin-btn admin-btn-primary"
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Product"}
          </button>
        </div>
      </form>
    </div>
  );
}
