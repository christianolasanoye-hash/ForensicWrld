import Link from "next/link";
import Image from "next/image";
import Badge from "./Badge";

export default function Footer() {
  return (
    <footer className="bg-black py-20 px-6 sm:px-12 border-t border-white/5">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex flex-col md:flex-row justify-between gap-12 mb-20">
          <div className="max-w-sm">
            <Link href="/" className="flex flex-col -gap-1 mb-8 opacity-50 hover:opacity-100 transition-opacity">
              <span className="font-giants text-2xl italic font-black uppercase tracking-tighter leading-none">FORENSIC</span>
              <span className="font-polar text-[10px] tracking-[0.4em] text-white/50 -mt-1">WRLD STUDIO</span>
            </Link>
            <p className="text-white/40 text-xs uppercase tracking-widest leading-relaxed">
              MANIFESTING THE NEXT ERA OF CULTURE THROUGH IMMERSIVE VISUALS AND STRATEGIC CREATIVE DIRECTION.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-12">
            <div className="flex flex-col gap-4">
              <span className="font-polar text-[10px] tracking-widest text-white/20 uppercase mb-2">Navigation</span>
              <Link href="/" className="text-[10px] font-bold uppercase tracking-widest text-white/50 hover:text-white transition-colors">Home</Link>
              <Link href="/film" className="text-[10px] font-bold uppercase tracking-widest text-white/50 hover:text-white transition-colors">Film</Link>
              <Link href="/photography" className="text-[10px] font-bold uppercase tracking-widest text-white/50 hover:text-white transition-colors">Photography</Link>
            </div>
            <div className="flex flex-col gap-4">
              <span className="font-polar text-[10px] tracking-widest text-white/20 uppercase mb-2">Collective</span>
              <Link href="/social" className="text-[10px] font-bold uppercase tracking-widest text-white/50 hover:text-white transition-colors">Social</Link>
              <Link href="/model-team" className="text-[10px] font-bold uppercase tracking-widest text-white/50 hover:text-white transition-colors">Models</Link>
              <Link href="/merch" className="text-[10px] font-bold uppercase tracking-widest text-white/50 hover:text-white transition-colors">Merch</Link>
            </div>
            <div className="flex flex-col gap-4">
              <span className="font-polar text-[10px] tracking-widest text-white/20 uppercase mb-2">Connect</span>
              <Link href="/intake" className="text-[10px] font-bold uppercase tracking-widest text-white/50 hover:text-white transition-colors">Intake</Link>
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/50 hover:text-white cursor-pointer transition-colors">Instagram</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-6 pt-12 border-t border-white/5">
          <span className="font-polar text-[8px] tracking-[0.5em] text-white/20 uppercase text-center sm:text-left">
            © {new Date().getFullYear()} FORENSIC WRLD // ALL RIGHTS RESERVED // CONCEPT TO MANIFESTATION
          </span>
          <div className="flex gap-8">
            <span className="font-polar text-[8px] tracking-[0.5em] text-white/20 uppercase">NYC</span>
            <span className="font-polar text-[8px] tracking-[0.5em] text-white/20 uppercase">LDN</span>
            <span className="font-polar text-[8px] tracking-[0.5em] text-white/20 uppercase">TYO</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

