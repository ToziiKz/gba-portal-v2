"use client";

import { Trash2 } from "lucide-react";

export function DeleteProfileSubmitButton() {
  return (
    <button
      type="submit"
      onClick={(e) => {
        if (
          !window.confirm(
            "Confirmer la suppression totale de ce profil ? Cette action est irréversible.",
          )
        ) {
          e.preventDefault();
        }
      }}
      className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-300 hover:text-red-500 transition-all group px-2"
    >
      <Trash2 className="h-3.5 w-3.5 group-hover:scale-110 transition-transform" />
      Supprimer le profil
    </button>
  );
}
