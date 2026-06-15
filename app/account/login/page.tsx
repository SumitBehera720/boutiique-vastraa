"use client";

import { useState } from "react";
import LoginForm from "@/components/account/LoginForm";
import RegisterForm from "@/components/account/RegisterForm";

export default function LoginPage() {
  const [view, setView] = useState<"login" | "register">("login");

  return (
    <div className="min-h-[70vh] bg-[#FDFBF7] flex items-center justify-center py-12 px-4">
      {view === "login" ? (
        <LoginForm onToggleView={() => setView("register")} />
      ) : (
        <RegisterForm onToggleView={() => setView("login")} />
      )}
    </div>
  );
}
