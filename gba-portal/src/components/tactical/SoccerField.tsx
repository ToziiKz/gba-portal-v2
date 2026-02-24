"use client";

import * as React from "react";

export function SoccerField() {
  return (
    <div className="relative aspect-[3/4] w-full max-w-[500px] select-none overflow-hidden rounded-xl border border-white/20 bg-emerald-800 shadow-2xl">
      {/* Texture herbe (subtile) */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.1)_1px,transparent_1px)] bg-[size:20px_20px] opacity-20" />

      {/* Lignes du terrain */}
      <div className="absolute inset-4 border-2 border-white/40">
        {/* Ligne médiane */}
        <div className="absolute left-0 top-1/2 h-0.5 w-full -translate-y-1/2 bg-white/40" />

        {/* Rond central */}
        <div className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/40" />
        <div className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/40" />

        {/* Surface de réparation (Haut - Gardien) */}
        <div className="absolute left-1/2 top-0 h-24 w-48 -translate-x-1/2 border-2 border-t-0 border-white/40" />
        <div className="absolute left-1/2 top-0 h-10 w-20 -translate-x-1/2 border-2 border-t-0 border-white/40" />
        <div className="absolute left-1/2 top-16 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-white/40" />
        {/* Arc de cercle surface haut */}
        <div className="absolute left-1/2 top-24 h-12 w-24 -translate-x-1/2 rounded-b-full border-b-2 border-white/40 bg-transparent clip-path-top-arc" />

        {/* Surface de réparation (Bas - Attaque) */}
        <div className="absolute bottom-0 left-1/2 h-24 w-48 -translate-x-1/2 border-2 border-b-0 border-white/40" />
        <div className="absolute bottom-0 left-1/2 h-10 w-20 -translate-x-1/2 border-2 border-b-0 border-white/40" />
        <div className="absolute bottom-16 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-white/40" />
        {/* Arc de cercle surface bas */}
        <div className="absolute bottom-24 left-1/2 h-12 w-24 -translate-x-1/2 rounded-t-full border-t-2 border-white/40 bg-transparent clip-path-bottom-arc" />

        {/* Corners */}
        <div className="absolute left-0 top-0 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/40" />
        <div className="absolute right-0 top-0 h-6 w-6 translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/40" />
        <div className="absolute bottom-0 left-0 h-6 w-6 -translate-x-1/2 translate-y-1/2 rounded-full border-2 border-white/40" />
        <div className="absolute bottom-0 right-0 h-6 w-6 translate-x-1/2 translate-y-1/2 rounded-full border-2 border-white/40" />
      </div>

      {/* Slots pour les joueurs (Visualisation uniquement pour l'instant) */}
      <div className="absolute inset-0 grid grid-rows-6 p-4">
        {/* Ligne 1 : Gardien */}
        <div className="flex items-center justify-center">{/* Slot GK */}</div>

        {/* Ligne 2 : Défenseurs Centraux */}
        <div className="flex items-center justify-around px-8">
          {/* Slot DC G / D */}
        </div>

        {/* Ligne 3 : Latéraux / Milieux Déf */}
        <div className="flex items-center justify-between px-2">
          {/* Slot Latéral G / D */}
        </div>

        {/* Ligne 4 : Milieux */}
        <div className="flex items-center justify-around px-12">
          {/* Slot MC */}
        </div>

        {/* Ligne 5 : Attaquants Soutien / Ailiers */}
        <div className="flex items-center justify-between px-6">
          {/* Slot MO / Ailier */}
        </div>

        {/* Ligne 6 : Buteur */}
        <div className="flex items-center justify-center">{/* Slot BU */}</div>
      </div>
    </div>
  );
}
