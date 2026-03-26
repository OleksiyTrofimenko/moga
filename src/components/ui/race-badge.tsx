export const RACE_COLORS: Record<string, string> = {
  human: "bg-blue-600",
  orc: "bg-red-600",
  night_elf: "bg-green-600",
  undead: "bg-purple-600",
  random: "bg-zinc-600",
};

export const RACE_LABELS: Record<string, string> = {
  human: "Human",
  orc: "Orc",
  night_elf: "Night Elf",
  undead: "Undead",
  random: "Random",
};

export const RACE_SHORT_LABELS: Record<string, string> = {
  human: "HU",
  orc: "ORC",
  night_elf: "NE",
  undead: "UD",
  random: "RND",
};

export function RaceBadge({
  race,
  short = true,
}: {
  race: string | null;
  short?: boolean;
}) {
  if (!race) return <span className="text-zinc-500 text-xs">???</span>;
  const label = short
    ? RACE_SHORT_LABELS[race] || race.toUpperCase()
    : RACE_LABELS[race] || race;
  return (
    <span
      className={`inline-block px-1.5 py-0.5 rounded text-xs font-bold text-white ${RACE_COLORS[race] || "bg-zinc-600"}`}
    >
      {label}
    </span>
  );
}
