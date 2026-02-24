"use client";

import Image from "next/image";
import { Teko } from "next/font/google";
import { Shield, Users, ChevronDown } from "lucide-react";

const teko = Teko({ subsets: ["latin"], weight: ["400", "600"] });

type Props = {
  name?: string;
  role?: string;
  team?: string;
};

export default function UserPanel({
  name = "Coach",
  role = "Staff",
  team = "Équipe A",
}: Props) {
  return (
    <div className="px-4 py-5 border-b border-black/10">
      <div className="flex items-center gap-3">
        <div className="relative h-10 w-10 rounded-xl overflow-hidden border border-black/10 bg-black/5">
          <Image
            src="/brand/logo.png"
            alt="GBA"
            fill
            className="object-contain p-1"
          />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p
              className={`${teko.className} text-xl uppercase text-[color:var(--ui-fg)] leading-none truncate`}
            >
              {name}
            </p>
            <ChevronDown size={14} className="text-black/35" />
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full border border-black/10 bg-black/5 px-2 py-1 text-[9px] font-black uppercase tracking-[0.28em] text-black/60">
              <Shield size={11} className="text-[color:var(--ui-primary)]" />{" "}
              {role}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-black/10 bg-black/5 px-2 py-1 text-[9px] font-black uppercase tracking-[0.28em] text-black/60">
              <Users size={11} className="text-[color:var(--ui-primary)]" />{" "}
              {team}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
