"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

interface AuthFormProps {
  onSuccess?: () => void;
  defaultTab?: "login" | "register";
}

export default function AuthForm({
  onSuccess,
  defaultTab = "login",
}: AuthFormProps) {
  const router = useRouter();
  const [tab, setTab] = useState<"login" | "register">(defaultTab);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [regEmail, setRegEmail] = useState("");
  const [regFirstName, setRegFirstName] = useState("");
  const [regLastName, setRegLastName] = useState("");
  const [regPassword, setRegPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email: loginEmail,
      password: loginPassword,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid email or password");
      return;
    }

    router.refresh();
    onSuccess?.();
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: regEmail,
          password: regPassword,
          firstName: regFirstName,
          lastName: regLastName,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Registration failed");
        setLoading(false);
        return;
      }

      const signInResult = await signIn("credentials", {
        email: regEmail,
        password: regPassword,
        redirect: false,
      });

      setLoading(false);

      if (signInResult?.error) {
        setTab("login");
        setError("Account created. Please log in.");
        return;
      }

      router.refresh();
      onSuccess?.();
    } catch {
      setLoading(false);
      setError("Registration failed. Please try again.");
    }
  };

  return (
    <>
      <div className="login-tabs">
        <button
          type="button"
          className={tab === "login" ? "active" : ""}
          onClick={() => {
            setTab("login");
            setError("");
          }}
        >
          Login
        </button>
        <button
          type="button"
          className={tab === "register" ? "active" : ""}
          onClick={() => {
            setTab("register");
            setError("");
          }}
        >
          Sign Up
        </button>
      </div>

      <div className="login-form-wrap">
        {error && <p className="auth-error">{error}</p>}

        {tab === "login" ? (
          <form className="login-form" onSubmit={handleLogin}>
            <div className="form-group">
              <label>Username or email address</label>
              <input
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
              />
            </div>
            <label className="form-checkbox">
              <input type="checkbox" /> Remember me
            </label>
            <button
              type="submit"
              className="btn btn-default btn-full"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Log in"}
            </button>
            <p className="form-link">
              <a href="#">Lost your password?</a>
            </p>
          </form>
        ) : (
          <form className="login-form" onSubmit={handleRegister}>
            <div className="form-group">
              <label>Email address</label>
              <input
                type="email"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>First name</label>
              <input
                type="text"
                value={regFirstName}
                onChange={(e) => setRegFirstName(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Last name</label>
              <input
                type="text"
                value={regLastName}
                onChange={(e) => setRegLastName(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                minLength={8}
                required
              />
            </div>
            <label className="form-checkbox">
              <input type="checkbox" required /> I accept the Terms of Service
              and Privacy Policy
            </label>
            <button
              type="submit"
              className="btn btn-default btn-full"
              disabled={loading}
            >
              {loading ? "Signing up..." : "Sign Up"}
            </button>
          </form>
        )}
      </div>
    </>
  );
}
