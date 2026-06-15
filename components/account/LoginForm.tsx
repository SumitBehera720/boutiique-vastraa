"use client";

import { useState } from "react";
import { loginAction } from "@/app/actions/auth";
import { useRouter } from "next/navigation";

export default function LoginForm({ onToggleView }: { onToggleView: () => void }) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const formData = new FormData(e.currentTarget);
    const result = await loginAction(formData);
    
    if (result.success) {
      router.push("/account");
      router.refresh();
    } else {
      setError(result.error || "An error occurred");
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-8 bg-white rounded-lg shadow-sm border border-gray-100">
      <h2 className="text-3xl font-serif text-gray-800 mb-2 text-center">Welcome Back</h2>
      <p className="text-gray-500 text-center mb-8 text-sm">Please login to your account.</p>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded mb-6 text-sm border border-red-100">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input 
            type="email" 
            name="email"
            required
            className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input 
            type="password" 
            name="password"
            required
            className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>
        
        <div className="flex justify-end">
          <a href="#" className="text-sm text-gray-500 hover:text-primary transition-colors">Forgot your password?</a>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-primary text-white py-3 rounded font-bold uppercase tracking-widest text-sm hover:bg-[#6A102A] transition-colors disabled:opacity-50"
        >
          {loading ? "Signing In..." : "Sign In"}
        </button>
      </form>

      <div className="mt-8 text-center text-sm text-gray-600 border-t border-gray-200 pt-6">
        Don't have an account?{" "}
        <button onClick={onToggleView} className="text-primary hover:underline font-semibold">
          Create one
        </button>
      </div>
    </div>
  );
}
