import type { Metadata } from "next";
import GlassCard from "@/components/ui/GlassCard";
import ContactForm from "@/components/contact/ContactForm";
import WhatsAppButton from "@/components/contact/WhatsAppButton";
import SocialLinks from "@/components/contact/SocialLinks";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with Maciej Szamowski.",
};

export default function ContactPage() {
  return (
    <section className="max-w-2xl mx-auto px-4 sm:px-6 py-20">
      <h1 className="text-4xl sm:text-5xl font-bold mb-4">
        <span className="text-gradient">Get in Touch</span>
      </h1>
      <p className="text-gray-400 mb-10">
        Have a project in mind? Let&apos;s talk.
      </p>

      <GlassCard className="p-6 sm:p-8 mb-8">
        <ContactForm />
      </GlassCard>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <WhatsAppButton />
        <SocialLinks />
      </div>
    </section>
  );
}
