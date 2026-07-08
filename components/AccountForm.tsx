"use client";

import { useSession, signOut } from "next-auth/react";
import AuthForm from "./AuthForm";
import OrderHistory from "./OrderHistory";

type OrderSummary = {
  id: string;
  orderNumber: string;
  status: string;
  total: string;
  createdAt: Date | null;
};

export default function AccountForm({ orders = [] }: { orders?: OrderSummary[] }) {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="account-card">
        <p className="account-loading">Loading...</p>
      </div>
    );
  }

  if (session?.user) {
    return (
      <div className="account-dashboard">
        <div className="account-card account-logged-in">
          <h4>Welcome, {session.user.name ?? session.user.email}</h4>
          <p className="account-email">{session.user.email}</p>
          <div className="account-actions">
            <a href="/basket" className="btn btn-default">
              My Basket
            </a>
            <button
              className="btn btn-outline"
              onClick={() => signOut({ callbackUrl: "/" })}
            >
              Log out
            </button>
          </div>
        </div>
        <OrderHistory orders={orders} />
      </div>
    );
  }

  return (
    <div className="account-card">
      <AuthForm />
    </div>
  );
}
