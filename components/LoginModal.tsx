"use client";

import { useModal } from "@/contexts/ModalContext";
import AuthForm from "./AuthForm";

export default function LoginModal() {
  const { loginOpen, closeLogin } = useModal();

  if (!loginOpen) return null;

  return (
    <div className="modal-overlay" onClick={closeLogin}>
      <div className="login-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={closeLogin} aria-label="Close">
          ✕
        </button>
        <AuthForm onSuccess={closeLogin} />
      </div>
    </div>
  );
}
