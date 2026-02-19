"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import SectionHeader from "@/components/SectionHeader";
import Button from "@/components/Button";
import Card from "@/components/Card";
import Field from "@/components/Field";
import Input from "@/components/Input";
import Select from "@/components/Select";
import Textarea from "@/components/Textarea";
import { supabase } from "@/lib/supabase";

export default function IntakePage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    service: "film",
    details: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Service options with internal value and display label
  const services = [
    { value: "film", label: "Film Campaigns" },
    { value: "photography", label: "Photography" },
    { value: "social", label: "Social Marketing" },
    { value: "events", label: "Events" },
    { value: "mentorship", label: "Mentorship" },
    { value: "other", label: "Merch / Other" },
  ];

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!supabase) throw new Error("Supabase client not initialized.");

      const { error: supabaseError } = await (supabase.from("intakes") as any).insert([
        {
          name: form.name,
          email: form.email,
          service: form.service,
          description: form.details,
        },
      ]);

      if (supabaseError) {
        throw supabaseError;
      }

      setSubmitted(true);
      setForm({ name: "", email: "", service: "film", details: "" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit intake. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-[1400px] mx-auto px-6 sm:px-12 pb-32">
      <SectionHeader
        eyebrow="Initiation"
        title="Start your project"
        subtitle="MANIFEST YOUR VISION THROUGH OUR COLLECTIVE."
        actions={
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] border border-white/20 text-white/40 px-8 py-4 hover:bg-white/5 transition-all cursor-pointer">
            View Availability
          </span>
        }
      />

      <div className="mt-20 grid gap-20 lg:grid-cols-2 relative">
        <div className="absolute -left-20 top-0 hidden lg:block">
          <span className="font-polar text-[8px] tracking-[1em] text-white/40 uppercase text-vertical">
            INTAKE // FORM // MMXXIV
          </span>
        </div>

        <Card title="Project Details" desc="Tell us what you're building.">
          <form onSubmit={onSubmit} className="space-y-8">
            <Field label="Identity">
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="FIRST + LAST NAME"
                required
              />
            </Field>
            <Field label="Connection" hint="WE'LL REPLY HERE">
              <Input
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="YOU@DOMAIN.COM"
                type="email"
                required
              />
            </Field>
            <Field label="Selection">
              <Select
                value={form.service}
                onChange={(e) => setForm({ ...form, service: e.target.value })}
                required
              >
                {services.map((s) => (
                  <option key={s.value} value={s.value} className="bg-black text-white">
                    {s.label.toUpperCase()}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Scope" hint="SUBSTANCE OVER STYLE">
              <Textarea
                rows={4}
                value={form.details}
                onChange={(e) => setForm({ ...form, details: e.target.value })}
                placeholder="WHAT ARE YOU MANIFESTING? TIMELINE + BUDGET + VISION."
                required
              />
            </Field>

            {error && (
              <div className="border border-white/10 bg-white/5 p-6 text-[10px] font-bold uppercase tracking-widest text-white/60">
                NOTIFICATION: {error}
              </div>
            )}

            {submitted ? (
              <div className="border border-white bg-white p-6 text-[10px] font-bold uppercase tracking-widest text-black">
                SUCCESS: INTAKE RECEIVED. WE WILL CONNECT SOON.
              </div>
            ) : null}

            <div className="pt-8">
              <button
                type="submit"
                disabled={loading}
                className="w-full text-center text-[10px] font-bold uppercase tracking-[0.3em] bg-white text-black px-10 py-6 hover:bg-white/90 transition-all disabled:opacity-50"
              >
                {loading ? "PROCESSING..." : "SUBMIT INTAKE →"}
              </button>
            </div>
          </form>
        </Card>

        <Card title="The Process" desc="What happens next.">
          <div className="space-y-12">
            <div className="grid grid-cols-[40px_1fr] gap-6">
              <span className="font-giants italic text-3xl text-white/20">01</span>
              <div>
                <h4 className="text-white font-bold uppercase tracking-widest mb-2">Audit</h4>
                <p className="text-white/40 text-[10px] uppercase tracking-widest leading-relaxed">We review your project and reply with a recommended roadmap.</p>
              </div>
            </div>
            <div className="grid grid-cols-[40px_1fr] gap-6">
              <span className="font-giants italic text-3xl text-white/20">02</span>
              <div>
                <h4 className="text-white font-bold uppercase tracking-widest mb-2">Refinement</h4>
                <p className="text-white/40 text-[10px] uppercase tracking-widest leading-relaxed">We finalize the scope, timeline, and deliverables.</p>
              </div>
            </div>
            <div className="grid grid-cols-[40px_1fr] gap-6">
              <span className="font-giants italic text-3xl text-white/20">03</span>
              <div>
                <h4 className="text-white font-bold uppercase tracking-widest mb-2">Manifestation</h4>
                <p className="text-white/40 text-[10px] uppercase tracking-widest leading-relaxed">Execution phase begins. High-fidelity results delivered.</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}









