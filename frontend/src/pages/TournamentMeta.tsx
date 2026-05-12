import { useState } from "react";
import { useLeaderStats, useMetaTournaments, useSaveMetaDeck } from "../hooks/useMeta";
import type { MetaDeckEntry, MetaDecklistCard, MetaDecklist } from "../types";

export default function TournamentMeta() {
  const { data: stats = [], isLoading: statsLoading } = useLeaderStats(10);
  const { data: tournaments = [], isLoading: tournamentsLoading } = useMetaTournaments(5);
  const [expandedTournament, setExpandedTournament] = useState<string | null>(null);
  const [expandedDeck, setExpandedDeck] = useState<string | null>(null);

  const maxAppearances = Math.max(...stats.map(s => s.appearances), 1);
  const totalAppearances = stats.reduce((s, x) => s + x.appearances, 0);
  const totalWins = stats.reduce((s, x) => s + x.wins, 0);
  const winrate = totalAppearances > 0 ? Math.round((totalWins / totalAppearances) * 100) : 0;

  return (
    <div>
      {/* Stats grid */}
      <div className="stat-grid">
        <div className="stat">
          <div className="stat-label">Events Tracked</div>
          <div className="stat-value">{tournaments.length}</div>
        </div>
        <div className="stat">
          <div className="stat-label">Appearances</div>
          <div className="stat-value">{totalAppearances}</div>
        </div>
        <div className="stat">
          <div className="stat-label">Meta Winrate</div>
          <div className="stat-value">{winrate}%</div>
        </div>
        <div className="stat">
          <div className="stat-label">Hottest Leader</div>
          <div className="stat-value" style={{ fontSize: 16 }}>{stats[0]?.leader_name ?? "—"}</div>
        </div>
      </div>

      {/* Leader Popularity */}
      <div className="band">
        <h2>LEADER POPULARITY</h2>
        <div className="band-line" />
      </div>
      {statsLoading && <div style={{ color: "var(--color-muted-dim)" }}>Loading stats...</div>}
      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 24 }}>
        {stats.map((s, i) => (
          <div key={s.leader_id || s.leader_name} className="bar-row">
            <span className="bar-label" style={{ display: "flex", alignItems: "center", gap: 6 }}>
              {i < 3 && (
                <span className={`rank`} style={{
                  width: 22, height: 22, borderRadius: 6, display: "inline-grid", placeItems: "center",
                  fontSize: 11, fontWeight: 800,
                  background: i === 0 ? "linear-gradient(135deg, #fbbf24, #f59e0b)" : i === 1 ? "linear-gradient(135deg, #d1d5db, #9ca3af)" : "linear-gradient(135deg, #d97706, #b45309)",
                  color: i === 1 ? "#000" : i === 0 ? "#000" : "#fff",
                }}>
                  {i + 1}
                </span>
              )}
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.leader_name}</span>
            </span>
            <div className="bar-wrap">
              <div className="bar-fill" style={{ width: `${(s.appearances / maxAppearances) * 100}%`, transition: "width 1.1s cubic-bezier(0.2,0.7,0.2,1)" }} />
            </div>
            <span className="bar-val">{s.appearances} · {s.wins}W</span>
          </div>
        ))}
      </div>

      {/* Tournaments */}
      <div className="band">
        <h2>RECENT TOURNAMENTS</h2>
        <div className="band-line" />
      </div>
      {tournamentsLoading && <div style={{ color: "var(--color-muted-dim)" }}>Loading tournaments...</div>}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {tournaments.map(t => {
          const isExpanded = expandedTournament === t.id;
          return (
            <div key={t.id} style={{ background: "var(--color-panel)", borderRadius: 12, overflow: "hidden", border: "1px solid var(--color-border)" }}>
              <button
                onClick={() => setExpandedTournament(isExpanded ? null : t.id)}
                style={{ width: "100%", background: "transparent", textAlign: "left", padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", border: "none" }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "var(--color-light)" }}>{t.name}</div>
                  <div style={{ fontSize: 12, color: "var(--color-muted)", marginTop: 2 }}>
                    {new Date(t.date).toLocaleDateString()} · {t.players} players
                  </div>
                </div>
                <span style={{ color: "var(--color-muted)" }}>{isExpanded ? "▲" : "▼"}</span>
              </button>

              {isExpanded && (
                <div style={{ padding: "0 16px 12px" }}>
                  <div className="tlist">
                    {t.top_decks.map((d, i) => {
                      const deckKey = `${t.id}-${i}`;
                      return (
                        <DeckRow
                          key={deckKey}
                          entry={d}
                          index={i}
                          tournamentName={t.name}
                          tournamentDate={t.date}
                          isExpanded={expandedDeck === deckKey}
                          onToggle={() => setExpandedDeck(expandedDeck === deckKey ? null : deckKey)}
                        />
                      );
                    })}
                  </div>
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
  index,
  tournamentName,
  tournamentDate,
  isExpanded,
  onToggle,
}: {
  entry: MetaDeckEntry;
  index: number;
  tournamentName: string;
  tournamentDate: string;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const saveMutation = useSaveMetaDeck();
  const record = entry.record;
  const recordStr = record ? `${record.wins}W-${record.losses}L` : "—";

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

  const topClass = index < 3 ? ` top${index + 1}` : "";

  return (
    <>
      <div
        className={`trow${topClass}`}
        onClick={entry.decklist ? onToggle : undefined}
        style={{ cursor: entry.decklist ? "pointer" : "default" }}
      >
        <div className="rank">{entry.placing}</div>
        <div className="trow-info">
          <div className="trow-name">{entry.leader}</div>
          <div className="trow-sub">{entry.player}</div>
        </div>
        <div className="trow-stat">{recordStr}</div>
        <div className="trow-stat">{entry.decklist ? `${[...entry.decklist.character, ...entry.decklist.event, ...entry.decklist.stage].reduce((s, c) => s + c.count, 0)} cards` : "—"}</div>
        <div>
          {entry.decklist && (
            <button
              onClick={(e) => { e.stopPropagation(); handleSave(); }}
              disabled={saveMutation.isPending}
              className={saveMutation.isSuccess ? "" : "btn primary"}
              style={{ fontSize: 11, padding: "4px 10px" }}
            >
              {saveMutation.isPending ? "..." : saveMutation.isSuccess ? "Saved ✓" : "Import"}
            </button>
          )}
        </div>
      </div>
      {isExpanded && entry.decklist && (
        <div style={{ background: "var(--color-card-bg)", borderRadius: 8, padding: "10px 14px", margin: "-4px 0 4px" }}>
          <div style={{ fontWeight: 700, fontSize: 12, color: "var(--color-accent)", marginBottom: 6 }}>
            Leader: {entry.decklist.leader.name}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
            <CardList cards={entry.decklist.character} label="Character" />
            <CardList cards={entry.decklist.event} label="Event" />
            <CardList cards={entry.decklist.stage} label="Stage" />
          </div>
        </div>
      )}
    </>
  );
}

function CardList({ cards, label }: { cards: MetaDecklistCard[]; label: string }) {
  if (!cards || cards.length === 0) return null;
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 700, color: "var(--color-muted-dim)", marginBottom: 4, fontFamily: "var(--font-mono)" }}>{label.toUpperCase()}</div>
      {cards.map((c, i) => (
        <div key={i} style={{ fontSize: 12, color: "var(--color-light)", lineHeight: 1.6 }}>
          {c.count}× {c.name}
          <span style={{ color: "var(--color-muted-dim)", marginLeft: 4, fontSize: 10 }}>{c.set}-{c.number}</span>
        </div>
      ))}
    </div>
  );
}
