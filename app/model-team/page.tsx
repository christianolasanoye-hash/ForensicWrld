import SectionHeader from "@/components/SectionHeader";
import Card from "@/components/Card";
import Image from "next/image";

export default function ModelTeamPage() {
    const models = [
        { name: "Archive 01", role: "Editorial", image: "/forensicStudioPortraits.JPG" },
        { name: "Archive 02", role: "Commercial", image: "/forensicEditorials.JPG" },
    ];

    return (
        <div className="max-w-[1400px] mx-auto px-6 sm:px-12 pb-32">
            <SectionHeader
                eyebrow="Talent"
                title="Model Team"
                subtitle="THE FACES OF THE WRLD."
            />

            <div className="mt-20 grid gap-12 sm:grid-cols-2 lg:grid-cols-3">
                {models.map((model) => (
                    <div key={model.name} className="group relative aspect-[3/4] overflow-hidden bg-white/[0.02] border border-white/5">
                        <Image
                            src={model.image}
                            alt={`Model portfolio for ${model.name} - ${model.role} category`}
                            fill
                            className="object-cover opacity-60 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                        />
                        <div className="absolute inset-x-0 bottom-0 p-8 bg-gradient-to-t from-black via-transparent to-transparent">
                            <h3 className="font-giants italic text-2xl text-white uppercase tracking-tighter mb-1">{model.name}</h3>
                            <p className="font-polar text-[8px] tracking-[0.2em] text-white/60 uppercase">{model.role}</p>
                        </div>
                    </div>
                ))}

                {/* Placeholder for more */}
                <div className="aspect-[3/4] border border-dashed border-white/20 bg-white/[0.01] flex flex-col items-center justify-center p-12 text-center">
                    <span className="font-giants italic text-4xl text-white/10 mb-4">++</span>
                    <p className="font-polar text-[8px] tracking-[0.2em] text-white/40 uppercase">Accepting applications via intake</p>
                </div>
            </div>
        </div>
    );
}
