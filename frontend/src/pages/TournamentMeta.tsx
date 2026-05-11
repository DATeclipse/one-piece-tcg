import { useState } from "react";
import { useLeaderStats, useMetaTournaments, useSaveMetaDeck } from "../hooks/useMeta";
import type { MetaDeckEntry, MetaDecklistCard, MetaDecklist } from "../types";

export default function TournamentMeta() {
  const { data: stats = [], isLoading: statsLoading } = useLeaderStats(10);
  const { data: tournaments = [], isLoading: tournamentsLoading } = useMetaTournaments(5);
  const [expandedTournament, setExpandedTournament] = useState<string | null>(null);
  const [expandedDeck, setExpandedDeck] = useState<string | null>(null);

  const maxAppearances = Math.max(...stats.map((s) => s.appearances), 1);

  return (
    <div>
      <h3 className="text-accent text-xl font-bold font-serif tracking-wide mb-3">
        Leader Popularity (Top 8 across recent tournaments)
      </h3>
      {statsLoading && <div className="text-muted-dim">Loading stats...</div>}
      <div className="flex flex-col gap-1.5 mb-6">
        {stats.map((s) => (
          <div key={s.leader_id || s.leader_name} className="flex items-center gap-2">
            <span className="w-36 text-sm text-light truncate">{s.leader_name}</span>
            <div className="flex-1 flex items-center gap-2">
              <div
                className="bg-accent rounded h-6 min-w-1"
                style={{ width: `${(s.appearances / maxAppearances) * 100}%` }}
              />
              <span className="text-xs text-muted whitespace-nowrap">
                {s.appearances} app · {s.wins}W
              </span>
            </div>
          </div>
        ))}
      </div>

      <h3 className="text-accent text-xl font-bold font-serif tracking-wide mb-3">
        Recent Tournaments
      </h3>
      {tournamentsLoading && <div className="text-muted-dim">Loading tournaments...</div>}
      <div className="flex flex-col gap-3">
        {tournaments.map((t) => {
          const isExpanded = expandedTournament === t.id;
          return (
            <div key={t.id} className="bg-panel rounded-lg overflow-hidden">
              <button
                onClick={() => setExpandedTournament(isExpanded ? null : t.id)}
                className="w-full bg-transparent! text-left px-4 py-3 flex justify-between items-center"
              >
                <div>
                  <div className="text-light font-bold text-sm">{t.name}</div>
                  <div className="text-muted-dim text-xs">
                    {new Date(t.date).toLocaleDateString()} · {t.players} players
                  </div>
                </div>
                <span className="text-muted">{isExpanded ? "▲" : "▼"}</span>
              </button>

              {isExpanded && (
                <div className="px-4 pb-3">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-muted-dim text-xs text-left">
                        <th className="pb-1 w-8">#</th>
                        <th className="pb-1">Player</th>
                        <th className="pb-1">Leader</th>
                        <th className="pb-1 w-20">Record</th>
                        <th className="pb-1 w-12"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {t.top_decks.map((d, i) => {
                        const deckKey = `${t.id}-${i}`;
                        const isDeckExpanded = expandedDeck === deckKey;
                        return (
                          <DeckRow
                            key={deckKey}
                            entry={d}
                            tournamentName={t.name}
                            tournamentDate={t.date}
                            isExpanded={isDeckExpanded}
                            onToggle={() => setExpandedDeck(isDeckExpanded ? null : deckKey)}
                          />
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function decklistToCards(decklist: MetaDecklist) {
  const cards: { card_set_id: string; quantity: number }[] = [];
  for (const group of [decklist.character, decklist.event, decklist.stage]) {
    for (const c of group) {
      cards.push({ card_set_id: `${c.set}-${c.number}`, quantity: c.count });
    }
  }
  return cards;
}

function DeckRow({
  entry,
  tournamentName,
  tournamentDate,
  isExpanded,
  onToggle,
}: {
  entry: MetaDeckEntry;
  tournamentName: string;
  tournamentDate: string;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const saveMutation = useSaveMetaDeck();
  const record = entry.record;
  const recordStr = record ? `${record.wins}-${record.losses}-${record.ties}` : "—";

  const handleSave = () => {
    if (!entry.decklist) return;
    const leaderSetId = `${entry.decklist.leader.set}-${entry.decklist.leader.number}`;
    saveMutation.mutate({
      name: `${entry.player} - ${entry.leader} (${tournamentName})`,
      leader_card_set_id: leaderSetId,
      tournament_name: tournamentName,
      tournament_date: tournamentDate,
      player_name: entry.player,
      placing: entry.placing,
      cards: decklistToCards(entry.decklist),
    });
  };

  const renderCards = (cards: MetaDecklistCard[], label: string) => {
    if (!cards || cards.length === 0) return null;
    return (
      <div className="mb-2">
        <div className="text-muted-dim text-xs font-bold mb-1">{label}</div>
        {cards.map((c, i) => (
          <div key={i} className="text-light-dim text-xs">
            {c.count}x {c.name}
            <span className="text-muted-dark ml-1">
              {c.set}-{c.number}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      <tr
        onClick={entry.decklist ? onToggle : undefined}
        className={`border-t border-border-subtle ${entry.decklist ? "cursor-pointer hover:bg-card-bg" : ""}`}
      >
        <td className="py-1.5 text-muted">{entry.placing}</td>
        <td className="py-1.5 text-light-dim">{entry.player}</td>
        <td className="py-1.5 text-light">{entry.leader}</td>
        <td className="py-1.5 text-muted-dim">{recordStr}</td>
        <td className="py-1.5">
          {entry.decklist && (
            <button
              onClick={(e) => { e.stopPropagation(); handleSave(); }}
              disabled={saveMutation.isPending}
              className="text-[0.65rem] px-1.5 py-0.5"
            >
              {saveMutation.isPending ? "..." : saveMutation.isSuccess ? "Saved" : "Save"}
            </button>
          )}
        </td>
      </tr>
      {isExpanded && entry.decklist && (
        <tr>
          <td colSpan={5} className="bg-card-bg px-3 py-2">
            <div className="text-accent text-xs font-bold mb-2">
              Leader: {entry.decklist.leader.name} ({entry.decklist.leader.set}-{entry.decklist.leader.number})
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {renderCards(entry.decklist.character, "Character")}
              {renderCards(entry.decklist.event, "Event")}
              {renderCards(entry.decklist.stage, "Stage")}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
