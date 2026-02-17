import type { Metadata } from "next";
import GlassCard from "@/components/ui/GlassCard";
import ContactForm from "@/components/contact/ContactForm";
import WhatsAppButton from "@/components/contact/WhatsAppButton";
import SocialLinks from "@/components/contact/SocialLinks";
import { getProfileData } from "@/lib/get-profile-data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with Maciej Szamowski.",
};

export default async function ContactPage() {
  const data = await getProfileData();

  return (
    <section className="max-w-2xl mx-auto px-4 sm:px-6 py-20">
      <h1 className="text-4xl sm:text-5xl font-bold mb-4">
        <span className="text-gradient">Get in Touch</span>
      </h1>
      <p className="text-gray-400 mb-10">
        {data.pages.contact_subtitle}
      </p>

      <GlassCard className="p-6 sm:p-8 mb-8">
        <ContactForm />
      </GlassCard>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <WhatsAppButton href={data.social.whatsapp} />
        <SocialLinks linkedin={data.social.linkedin} github={data.social.github} />
      </div>
    </section>
  );
}
