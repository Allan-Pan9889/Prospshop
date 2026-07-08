"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

interface ProductFormProps {
  product: {
    id: string;
    slug: string;
    title: string;
    price: string;
    image: string;
    images: string[] | null;
    categories: string[] | null;
    description: string | null;
    hot: boolean;
    inStock: boolean;
    status: string;
  };
}

export default function EditProductPage({ product }: ProductFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const initialImage =
    product.image ||
    (product.images ?? []).find((url) => url.trim() !== "") ||
    "";
  const [imageUrl, setImageUrl] = useState(initialImage);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(e.currentTarget);
    const categories = (form.get("categories") as string)
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const image = (form.get("image") as string).trim() || initialImage;
    if (!image) {
      setError("Image URL is required");
      setLoading(false);
      return;
    }

    const body = {
      slug: form.get("slug") as string,
      title: form.get("title") as string,
      price: Number(form.get("price")),
      image,
      categories,
      description: (form.get("description") as string) || null,
      hot: form.get("hot") === "on",
      inStock: form.get("inStock") === "on",
      status: form.get("status") as string,
    };

    const res = await fetch(`/api/admin/products/${product.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Failed to update product");
      setLoading(false);
      return;
    }

    router.refresh();
    setLoading(false);
  }

  async function handleDelete() {
    if (!confirm("Delete this product? This cannot be undone.")) return;
    setDeleting(true);

    const res = await fetch(`/api/admin/products/${product.id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      router.push("/admin/products");
    } else {
      setError("Failed to delete product");
      setDeleting(false);
    }
  }

  const categoriesStr = (product.categories ?? []).join(", ");

  return (
    <div>
      <div className="admin-page-header">
        <h2>Edit Product</h2>
        <Link href="/admin/products" className="admin-btn admin-btn-secondary">
          ← Back
        </Link>
      </div>

      <form className="admin-form" onSubmit={handleSubmit}>
        {error && <p style={{ color: "#dc2626", marginBottom: 16 }}>{error}</p>}

        <div className="admin-form-row">
          <div className="admin-form-group">
            <label>Title *</label>
            <input name="title" defaultValue={product.title} required />
          </div>
          <div className="admin-form-group">
            <label>Slug *</label>
            <input name="slug" defaultValue={product.slug} required />
          </div>
        </div>

        <div className="admin-form-row">
          <div className="admin-form-group">
            <label>Price (₹) *</label>
            <input
              name="price"
              type="number"
              step="0.01"
              min="0"
              defaultValue={product.price}
              required
            />
          </div>
          <div className="admin-form-group">
            <label>Status</label>
            <select name="status" defaultValue={product.status}>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>

        <div className="admin-form-group">
          <label>Image URL *</label>
          <input
            name="image"
            type="text"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://prospshop.in/wp-content/uploads/..."
            required
          />
          {imageUrl ? (
            <div className="admin-image-preview">
              <Image
                src={imageUrl}
                alt={product.title}
                width={120}
                height={150}
                unoptimized
              />
            </div>
          ) : (
            <p className="admin-image-missing">No image URL set for this product.</p>
          )}
        </div>

        <div className="admin-form-group">
          <label>Categories (comma-separated)</label>
          <input name="categories" defaultValue={categoriesStr} />
        </div>

        <div className="admin-form-group">
          <label>Description</label>
          <textarea
            name="description"
            defaultValue={product.description ?? ""}
          />
        </div>

        <div className="admin-form-row">
          <label className="admin-checkbox">
            <input name="hot" type="checkbox" defaultChecked={product.hot} />
            Hot product
          </label>
          <label className="admin-checkbox">
            <input
              name="inStock"
              type="checkbox"
              defaultChecked={product.inStock}
            />
            In stock
          </label>
        </div>

        <div className="admin-form-actions">
          <button
            type="submit"
            className="admin-btn admin-btn-primary"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
          <button
            type="button"
            className="admin-btn admin-btn-danger"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </form>
    </div>
  );
}
