import SectionHeader from "@/components/SectionHeader";
import Card from "@/components/Card";

export default function ConnectionsPage() {
    const links = [
        { name: "Instagram", url: "https://instagram.com/forensicwrld", label: "@FORENSICWRLD" },
        { name: "YouTube", url: "https://youtube.com/@forensicwrld", label: "FORENSIC MEDIA" },
        { name: "TikTok", url: "https://tiktok.com/@forensicwrld", label: "WRLD VIBES" },
    ];

    return (
        <div className="max-w-[1400px] mx-auto px-6 sm:px-12 pb-32">
            <SectionHeader
                eyebrow="Network"
                title="Connections"
                subtitle="WHERE THE COLLECTIVE LIVES."
            />

            <div className="mt-20 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {links.map((link) => (
                    <a
                        key={link.name}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group block p-10 border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-all"
                    >
                        <div className="flex justify-between items-start mb-8">
                            <h3 className="font-giants italic text-3xl text-white/40 group-hover:text-white transition-colors uppercase tracking-tighter">
                                {link.name}
                            </h3>
                            <span className="text-white/20 group-hover:text-white transition-colors">↗</span>
                        </div>
                        <p className="font-polar text-[10px] tracking-[0.3em] text-white/40 uppercase group-hover:text-white/60 transition-colors">
                            {link.label}
                        </p>
                    </a>
                ))}
            </div>

            <div className="mt-20 border-t border-white/5 pt-20">
                <div className="max-w-2xl">
                    <h2 className="font-giants italic text-5xl text-white uppercase tracking-tighter mb-8">Join the Collective</h2>
                    <p className="text-white/60 text-sm uppercase tracking-widest leading-relaxed mb-12 italic">
                        We are always looking for high-fidelity creators, designers, and strategists to expand our manifest.
                    </p>
                    <a href="/intake" className="inline-block text-[10px] font-bold uppercase tracking-[0.3em] bg-white text-black px-10 py-6 hover:bg-white/90 transition-all">
                        Submit Inquiry →
                    </a>
                </div>
            </div>
        </div>
    );
}
