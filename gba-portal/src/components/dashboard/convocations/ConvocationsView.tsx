"use client";

import * as React from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

type Team = { id: string; name: string; category: string };

type Player = {
  id: string;
  firstname: string;
  lastname: string;
};

function inputBaseClassName() {
  return "w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/35 outline-none transition focus:border-white/25 focus:ring-2 focus:ring-white/20";
}

export function ConvocationsView({ teams }: { teams: Team[] }) {
  const [teamId, setTeamId] = React.useState<string>(teams[0]?.id ?? "");
  const [opponent, setOpponent] = React.useState("");
  const [datetime, setDatetime] = React.useState("");
  const [location, setLocation] = React.useState("");
  const [note, setNote] = React.useState("");

  const [players, setPlayers] = React.useState<Player[]>([]);
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (!teamId) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("players")
          .select("id, firstname, lastname")
          .eq("team_id", teamId)
          .order("lastname");

        if (cancelled) return;
        if (error) {
          setPlayers([]);
          return;
        }
        setPlayers(
          (
            (data ?? []) as Array<{
              id: string;
              firstname: string;
              lastname: string;
            }>
          ).map((p) => ({
            ...p,
            id: String(p.id),
          })),
        );
        setSelected(new Set());
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [teamId]);

  const team = teams.find((t) => t.id === teamId);

  const message = React.useMemo(() => {
    const list = players
      .filter((p) => selected.has(String(p.id)))
      .map((p) => `- ${p.firstname} ${p.lastname}`)
      .join("\n");

    const when = datetime ? `\n🕒 ${datetime}` : "";
    const where = location ? `\n📍 ${location}` : "";
    const vs = opponent ? `\n🆚 ${opponent}` : "";
    const extra = note ? `\n\n${note}` : "";

    return `CONVOCATION — ${team?.name ?? ""}${vs}${when}${where}\n\nJoueurs convoqués :\n${list || "- (à compléter)"}${extra}`;
  }, [players, selected, datetime, location, opponent, note, team?.name]);

  const copyMessage = async () => {
    await navigator.clipboard.writeText(message);
  };

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
      <Card className="premium-card card-shell rounded-3xl">
        <CardHeader>
          <CardTitle>Paramètres</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <label className="grid gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-white/60">
              Équipe
            </span>
            <select
              value={teamId}
              onChange={(e) => setTeamId(e.target.value)}
              className={inputBaseClassName()}
            >
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.category} • {t.name}
                </option>
              ))}
            </select>
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.25em] text-white/60">
                Adversaire
              </span>
              <input
                value={opponent}
                onChange={(e) => setOpponent(e.target.value)}
                className={inputBaseClassName()}
                placeholder="Ex: FC Strasbourg"
              />
            </label>
            <label className="grid gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.25em] text-white/60">
                Date / heure
              </span>
              <input
                value={datetime}
                onChange={(e) => setDatetime(e.target.value)}
                className={inputBaseClassName()}
                placeholder="Ex: Sam 16:00"
              />
            </label>
          </div>

          <label className="grid gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-white/60">
              Lieu
            </span>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className={inputBaseClassName()}
              placeholder="Ex: Stade municipal"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-white/60">
              Note
            </span>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className={inputBaseClassName()}
              rows={4}
              placeholder="Ex: RDV 45 min avant, tenue complète…"
            />
          </label>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/60">
              Joueurs
            </p>
            <p className="mt-2 text-sm text-white/70">
              {loading
                ? "Chargement…"
                : `${selected.size} sélectionné(s) / ${players.length}`}
            </p>

            <div className="mt-3 max-h-[380px] overflow-y-auto pr-1 custom-scrollbar space-y-2">
              {players.map((p) => {
                const id = String(p.id);
                const on = selected.has(id);
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => toggle(id)}
                    className={
                      `w-full rounded-xl border p-3 text-left transition ` +
                      (on
                        ? "border-emerald-400/40 bg-emerald-500/10"
                        : "border-white/10 bg-white/5 hover:bg-white/10")
                    }
                  >
                    <p className="text-sm font-semibold text-white">
                      {p.firstname} {p.lastname}
                    </p>
                  </button>
                );
              })}
              {players.length === 0 && !loading ? (
                <p className="text-sm text-white/50">
                  Aucun joueur trouvé pour cette équipe.
                </p>
              ) : null}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="premium-card card-shell rounded-3xl">
        <CardHeader>
          <CardTitle>Message</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
            <pre className="whitespace-pre-wrap text-sm text-white/80 font-medium">
              {message}
            </pre>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={copyMessage}>Copier</Button>
            <Button
              variant="secondary"
              onClick={() => {
                setSelected(new Set(players.map((p) => String(p.id))));
              }}
            >
              Tout sélectionner
            </Button>
            <Button variant="ghost" onClick={() => setSelected(new Set())}>
              Vider
            </Button>
          </div>
          <p className="text-xs text-white/45">
            (Étape suivante : envoi WhatsApp/SMS + suivi “vu/confirmé”.)
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
