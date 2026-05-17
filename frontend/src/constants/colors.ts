export const CARD_COLORS = {
  Red: { hex: "#e63946", glow: "rgba(230,57,70,.55)" },
  Blue: { hex: "#3a7ad9", glow: "rgba(58,122,217,.55)" },
  Green: { hex: "#3aaa64", glow: "rgba(58,170,100,.55)" },
  Purple: { hex: "#8b5cf6", glow: "rgba(139,92,246,.55)" },
  Black: { hex: "#5b6470", glow: "rgba(91,100,112,.55)" },
  Yellow: { hex: "#e6b53a", glow: "rgba(230,181,58,.55)" },
} as const;

export type CardColorName = keyof typeof CARD_COLORS;

export const COLOR_NAMES: CardColorName[] = [
  "Red", "Blue", "Green", "Purple", "Black", "Yellow",
];

export function colorHex(color: string): string {
  return CARD_COLORS[color as CardColorName]?.hex ?? "#444";
}

export function colorGlow(color: string): string {
  return CARD_COLORS[color as CardColorName]?.glow ?? "transparent";
}
