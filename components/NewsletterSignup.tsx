"use client";

import { useState } from "react";
import Input from "./Input";
import Button from "./Button";

interface NewsletterSignupProps {
  source?: string;
  variant?: "inline" | "stacked";
  placeholder?: string;
  buttonText?: string;
  className?: string;
}

export default function NewsletterSignup({
  source = "website",
  variant = "inline",
  placeholder = "ENTER YOUR EMAIL",
  buttonText = "SUBSCRIBE",
  className = "",
}: NewsletterSignupProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setMessage("Please enter your email address");
      setIsSuccess(false);
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setMessage("Please enter a valid email address");
      setIsSuccess(false);
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message || "Thank you for subscribing!");
        setIsSuccess(true);
        setEmail("");
      } else {
        setMessage(data.error || "Something went wrong. Please try again.");
        setIsSuccess(false);
      }
    } catch {
      setMessage("Network error. Please try again.");
      setIsSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  if (variant === "stacked") {
    return (
      <div className={className}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={placeholder}
            disabled={loading}
            required
          />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "SUBSCRIBING..." : buttonText}
          </Button>
        </form>
        {message && (
          <p
            className={`mt-4 text-[10px] font-bold uppercase tracking-widest ${
              isSuccess ? "text-green-400" : "text-red-400"
            }`}
          >
            {message}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className={className}>
      <form onSubmit={handleSubmit} className="flex gap-4">
        <div className="flex-1">
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={placeholder}
            disabled={loading}
            required
          />
        </div>
        <Button type="submit" disabled={loading} className="px-6">
          {loading ? "..." : buttonText}
        </Button>
      </form>
      {message && (
        <p
          className={`mt-3 text-[10px] font-bold uppercase tracking-widest ${
            isSuccess ? "text-green-400" : "text-red-400"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
