"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";

interface FormState {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export default function ContactForm() {
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    setErrorMessage("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to send message");
      }

      setStatus("success");
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  const inputClasses =
    "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-brand/50 focus:ring-1 focus:ring-brand/50 transition-colors";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="name" className="block text-sm text-gray-400 mb-1.5">
            Name *
          </label>
          <input
            id="name"
            type="text"
            required
            className={inputClasses}
            placeholder="Your name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm text-gray-400 mb-1.5">
            Email *
          </label>
          <input
            id="email"
            type="email"
            required
            className={inputClasses}
            placeholder="you@example.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>
      </div>

      <div>
        <label htmlFor="subject" className="block text-sm text-gray-400 mb-1.5">
          Subject
        </label>
        <input
          id="subject"
          type="text"
          className={inputClasses}
          placeholder="What is this about?"
          value={form.subject}
          onChange={(e) => setForm({ ...form, subject: e.target.value })}
        />
      </div>

      <div>
        <label htmlFor="message" className="block text-sm text-gray-400 mb-1.5">
          Message *
        </label>
        <textarea
          id="message"
          required
          rows={5}
          className={`${inputClasses} resize-none`}
          placeholder="Tell me about your project..."
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
        />
      </div>

      <Button type="submit" disabled={status === "sending"}>
        {status === "sending" ? "Sending..." : "Send Message"}
      </Button>

      {status === "success" && (
        <p className="text-brand text-sm">Message sent successfully! I will get back to you soon.</p>
      )}
      {status === "error" && (
        <p className="text-red-400 text-sm">{errorMessage}</p>
      )}
    </form>
  );
}
