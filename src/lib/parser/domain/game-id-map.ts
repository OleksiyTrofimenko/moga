/**
 * Mapping of WC3 4-char game IDs to entity categories.
 * Used by the normalizer to classify actions.
 *
 * This is a curated subset — new IDs will be logged in diagnostics
 * and added incrementally from real replay data.
 *
 * Naming convention: lowercase first char = race prefix
 *   h = human, o = orc, e = elf (night elf), u = undead, n = neutral
 * Uppercase first char = hero ability or upgrade
 *   A = ability, R = upgrade (research), S = spell
 */

export type GameIdCategory =
  | "unit"
  | "building"
  | "hero"
  | "upgrade"
  | "ability"
  | "item";

export const GAME_ID_MAP: Record<string, { category: GameIdCategory; name: string }> = {
  // =====================
  // HUMAN UNITS
  // =====================
  hpea: { category: "unit", name: "Peasant" },
  hfoo: { category: "unit", name: "Footman" },
  hrif: { category: "unit", name: "Rifleman" },
  hkni: { category: "unit", name: "Knight" },
  hmpr: { category: "unit", name: "Priest" },
  hsor: { category: "unit", name: "Sorceress" },
  hspt: { category: "unit", name: "Spell Breaker" },
  hmtm: { category: "unit", name: "Mortar Team" },
  hmtt: { category: "unit", name: "Siege Engine" },
  hgry: { category: "unit", name: "Gryphon Rider" },
  hdhw: { category: "unit", name: "Dragonhawk Rider" },
  hwat: { category: "unit", name: "Water Elemental" },

  // =====================
  // HUMAN BUILDINGS
  // =====================
  htow: { category: "building", name: "Town Hall" },
  hkee: { category: "building", name: "Keep" },
  hcas: { category: "building", name: "Castle" },
  halt: { category: "building", name: "Altar of Kings" },
  hbar: { category: "building", name: "Barracks" },
  hbla: { category: "building", name: "Blacksmith" },
  harm: { category: "building", name: "Workshop" },
  hars: { category: "building", name: "Arcane Sanctum" },
  hlum: { category: "building", name: "Lumber Mill" },
  hhou: { category: "building", name: "Farm" },
  hwtw: { category: "building", name: "Scout Tower" },
  hatw: { category: "building", name: "Arcane Tower" },
  hgtw: { category: "building", name: "Guard Tower" },
  hctw: { category: "building", name: "Cannon Tower" },
  hvlt: { category: "building", name: "Arcane Vault" },
  hgra: { category: "building", name: "Gryphon Aviary" },

  // =====================
  // HUMAN HEROES
  // =====================
  Hamg: { category: "hero", name: "Archmage" },
  Hmkg: { category: "hero", name: "Mountain King" },
  Hpal: { category: "hero", name: "Paladin" },
  Hblm: { category: "hero", name: "Blood Mage" },

  // =====================
  // ORC UNITS
  // =====================
  opeo: { category: "unit", name: "Peon" },
  ogru: { category: "unit", name: "Grunt" },
  ohun: { category: "unit", name: "Troll Headhunter" },
  otbk: { category: "unit", name: "Troll Berserker" },
  orai: { category: "unit", name: "Raider" },
  oshm: { category: "unit", name: "Shaman" },
  odoc: { category: "unit", name: "Witch Doctor" },
  ospw: { category: "unit", name: "Spirit Walker" },
  okod: { category: "unit", name: "Kodo Beast" },
  owyv: { category: "unit", name: "Wind Rider" },
  otbr: { category: "unit", name: "Troll Batrider" },
  otau: { category: "unit", name: "Tauren" },

  // =====================
  // ORC BUILDINGS
  // =====================
  ogre: { category: "building", name: "Great Hall" },
  ostr: { category: "building", name: "Stronghold" },
  ofrt: { category: "building", name: "Fortress" },
  oalt: { category: "building", name: "Altar of Storms" },
  obar: { category: "building", name: "Barracks" },
  ofor: { category: "building", name: "War Mill" },
  obea: { category: "building", name: "Beastiary" },
  osld: { category: "building", name: "Spirit Lodge" },
  otrb: { category: "building", name: "Orc Burrow" },
  owtw: { category: "building", name: "Watch Tower" },
  ovln: { category: "building", name: "Voodoo Lounge" },
  otto: { category: "building", name: "Tauren Totem" },

  // =====================
  // ORC HEROES
  // =====================
  Obla: { category: "hero", name: "Blademaster" },
  Ofar: { category: "hero", name: "Far Seer" },
  Otch: { category: "hero", name: "Tauren Chieftain" },
  Oshd: { category: "hero", name: "Shadow Hunter" },

  // =====================
  // NIGHT ELF UNITS
  // =====================
  ewsp: { category: "unit", name: "Wisp" },
  earc: { category: "unit", name: "Archer" },
  esen: { category: "unit", name: "Huntress" },
  edry: { category: "unit", name: "Dryad" },
  edoc: { category: "unit", name: "Druid of the Claw" },
  edot: { category: "unit", name: "Druid of the Talon" },
  efdr: { category: "unit", name: "Faerie Dragon" },
  emtg: { category: "unit", name: "Mountain Giant" },
  ehip: { category: "unit", name: "Hippogryph" },
  echm: { category: "unit", name: "Chimaera" },
  ehpr: { category: "unit", name: "Hippogryph Rider" },
  ebal: { category: "unit", name: "Glaive Thrower" },

  // =====================
  // NIGHT ELF BUILDINGS
  // =====================
  etol: { category: "building", name: "Tree of Life" },
  etoa: { category: "building", name: "Tree of Ages" },
  etoe: { category: "building", name: "Tree of Eternity" },
  eaom: { category: "building", name: "Ancient of War" },
  eaow: { category: "building", name: "Ancient of Wind" },
  eaoe: { category: "building", name: "Ancient of Lore" },
  eate: { category: "building", name: "Altar of Elders" },
  edob: { category: "building", name: "Hunter's Hall" },
  emow: { category: "building", name: "Moon Well" },
  eden: { category: "building", name: "Ancient Protector" },
  etrp: { category: "building", name: "Ancient Protector" },
  edos: { category: "building", name: "Chimaera Roost" },

  // =====================
  // NIGHT ELF HEROES
  // =====================
  Edem: { category: "hero", name: "Demon Hunter" },
  Ekee: { category: "hero", name: "Keeper of the Grove" },
  Emoo: { category: "hero", name: "Priestess of the Moon" },
  Ewar: { category: "hero", name: "Warden" },

  // =====================
  // UNDEAD UNITS
  // =====================
  uaco: { category: "unit", name: "Acolyte" },
  ugho: { category: "unit", name: "Ghoul" },
  ucry: { category: "unit", name: "Crypt Fiend" },
  ugar: { category: "unit", name: "Gargoyle" },
  unec: { category: "unit", name: "Necromancer" },
  uban: { category: "unit", name: "Banshee" },
  uobs: { category: "unit", name: "Obsidian Statue" },
  ubsp: { category: "unit", name: "Destroyer" },
  umtw: { category: "unit", name: "Meat Wagon" },
  uabo: { category: "unit", name: "Abomination" },
  ufro: { category: "unit", name: "Frost Wyrm" },
  ushd: { category: "unit", name: "Shade" },

  // =====================
  // UNDEAD BUILDINGS
  // =====================
  unpl: { category: "building", name: "Necropolis" },
  unp1: { category: "building", name: "Halls of the Dead" },
  unp2: { category: "building", name: "Black Citadel" },
  ualt: { category: "building", name: "Altar of Darkness" },
  usep: { category: "building", name: "Crypt" },
  ugrv: { category: "building", name: "Graveyard" },
  utod: { category: "building", name: "Temple of the Damned" },
  uslh: { category: "building", name: "Slaughterhouse" },
  uzig: { category: "building", name: "Ziggurat" },
  uzg1: { category: "building", name: "Spirit Tower" },
  uzg2: { category: "building", name: "Nerubian Tower" },
  utom: { category: "building", name: "Tomb of Relics" },
  ubon: { category: "building", name: "Boneyard" },
  usap: { category: "building", name: "Sacrificial Pit" },

  // =====================
  // UNDEAD HEROES
  // =====================
  Udea: { category: "hero", name: "Death Knight" },
  Udre: { category: "hero", name: "Dreadlord" },
  Ulic: { category: "hero", name: "Lich" },
  Ucry: { category: "hero", name: "Crypt Lord" },

  // =====================
  // NEUTRAL / TAVERN HEROES
  // =====================
  Nalc: { category: "hero", name: "Alchemist" },
  Nbst: { category: "hero", name: "Beastmaster" },
  Nbrn: { category: "hero", name: "Dark Ranger" },
  Nfir: { category: "hero", name: "Firelord" },
  Nngs: { category: "hero", name: "Naga Sea Witch" },
  Npbm: { category: "hero", name: "Pandaren Brewmaster" },
  Nplh: { category: "hero", name: "Pit Lord" },
  Ntin: { category: "hero", name: "Tinker" },

  // =====================
  // COMMON UPGRADES (subset)
  // =====================
  Rhme: { category: "upgrade", name: "Iron Forged Swords" },
  Rhra: { category: "upgrade", name: "Iron Plating" },
  Rhac: { category: "upgrade", name: "Improved Masonry" },
  Rhri: { category: "upgrade", name: "Long Rifles" },
  Rhan: { category: "upgrade", name: "Animal War Training" },
  Rhpt: { category: "upgrade", name: "Priest Training" },
  Rhst: { category: "upgrade", name: "Sorceress Training" },
  Rhse: { category: "upgrade", name: "Magic Sentry" },
  Rhfl: { category: "upgrade", name: "Flare" },
  Rhss: { category: "upgrade", name: "Control Magic" },
  Rhla: { category: "upgrade", name: "Leather Armor" },
  Rhlh: { category: "upgrade", name: "Lumber Harvesting" },

  Rome: { category: "upgrade", name: "Steel Melee Weapons" },
  Rora: { category: "upgrade", name: "Steel Ranged Weapons" },
  Roar: { category: "upgrade", name: "Unit Armor" },
  Ropg: { category: "upgrade", name: "Pillage" },
  Robs: { category: "upgrade", name: "Berserker Upgrade" },
  Rows: { category: "upgrade", name: "Pulverize" },
  Rost: { category: "upgrade", name: "Shaman Training" },
  Rowt: { category: "upgrade", name: "Witch Doctor Training" },
  Rosp: { category: "upgrade", name: "Spiked Barricades" },
  Roen: { category: "upgrade", name: "Ensnare" },
  Rovs: { category: "upgrade", name: "Envenomed Spears" },

  Reib: { category: "upgrade", name: "Improved Bows" },
  Rema: { category: "upgrade", name: "Moon Armor" },
  Rerh: { category: "upgrade", name: "Reinforced Hides" },
  Reuv: { category: "upgrade", name: "Ultravision" },
  Renb: { category: "upgrade", name: "Nature's Blessing" },
  Resc: { category: "upgrade", name: "Sentinel" },
  Remg: { category: "upgrade", name: "Strength of the Moon" },
  Redt: { category: "upgrade", name: "Druid of the Talon Training" },
  Redc: { category: "upgrade", name: "Druid of the Claw Training" },
  Remk: { category: "upgrade", name: "Marksmanship" },
  Reht: { category: "upgrade", name: "Hippogryph Taming" },

  Rume: { category: "upgrade", name: "Unholy Strength" },
  Rura: { category: "upgrade", name: "Creature Attack" },
  Ruar: { category: "upgrade", name: "Unholy Armor" },
  Ruac: { category: "upgrade", name: "Cannibalize" },
  Rugf: { category: "upgrade", name: "Ghoul Frenzy" },
  Ruwb: { category: "upgrade", name: "Web" },
  Rusf: { category: "upgrade", name: "Stone Form" },
  Rune: { category: "upgrade", name: "Necromancer Training" },
  Ruba: { category: "upgrade", name: "Banshee Training" },
  Rufb: { category: "upgrade", name: "Freezing Breath" },
  Ruex: { category: "upgrade", name: "Exhume Corpses" },
  Rusl: { category: "upgrade", name: "Skeletal Longevity" },

  // =====================
  // ITEMS — Potions / Charged
  // =====================
  phea: { category: "item", name: "Potion of Healing" },
  pman: { category: "item", name: "Potion of Mana" },
  pinv: { category: "item", name: "Potion of Invisibility" },
  pnvl: { category: "item", name: "Potion of Invulnerability" },
  shea: { category: "item", name: "Scroll of Healing" },
  stel: { category: "item", name: "Staff of Teleportation" },
  sreg: { category: "item", name: "Scroll of Regeneration" },
  shas: { category: "item", name: "Scroll of Speed" },
  stwp: { category: "item", name: "Scroll of Town Portal" },
  dust: { category: "item", name: "Dust of Appearance" },
  plcl: { category: "item", name: "Lesser Clarity Potion" },
  tret: { category: "item", name: "Tome of Retraining" },

  // ITEMS — Permanent
  rlif: { category: "item", name: "Ring of Protection +2" },
  rde1: { category: "item", name: "Ring of Protection +3" },
  rst1: { category: "item", name: "Gauntlets of Ogre Strength +3" },
  rat6: { category: "item", name: "Claws of Attack +6" },
  rat9: { category: "item", name: "Claws of Attack +9" },
  bspd: { category: "item", name: "Boots of Speed" },
  belv: { category: "item", name: "Boots of Quel'Thalas +6" },
  bgst: { category: "item", name: "Belt of Giant Strength +6" },
  ciri: { category: "item", name: "Robe of the Magi +6" },
  hslv: { category: "item", name: "Healing Salve" },

  // ITEMS — Charged / Artifacts
  hval: { category: "item", name: "Health Stone" },
  mana: { category: "item", name: "Mana Stone" },
  ofro: { category: "item", name: "Orb of Frost" },
  olig: { category: "item", name: "Orb of Lightning" },
  oven: { category: "item", name: "Orb of Venom" },

  // ITEMS — Creep Drop: Claws of Attack
  rat3: { category: "item", name: "Claws of Attack +3" },
  ratc: { category: "item", name: "Claws of Attack +12" },
  ratf: { category: "item", name: "Claws of Attack +15" },

  // ITEMS — Creep Drop: Stat items
  rags: { category: "item", name: "Slippers of Agility +3" },
  rmpi: { category: "item", name: "Mantle of Intelligence +3" },
  rnec: { category: "item", name: "Circlet of Nobility" },
  rhth: { category: "item", name: "Kelen's Dagger of Escape" },

  // ITEMS — Creep Drop: Rings
  rre1: { category: "item", name: "Ring of Regeneration" },
  rre2: { category: "item", name: "Ring of Regeneration +2" },
  rde2: { category: "item", name: "Ring of Protection +4" },
  rde3: { category: "item", name: "Ring of Protection +5" },

  // ITEMS — Creep Drop: Pendants/Periapts
  penr: { category: "item", name: "Pendant of Energy" },
  pmna: { category: "item", name: "Pendant of Mana" },
  prvt: { category: "item", name: "Periapt of Vitality" },

  // ITEMS — Creep Drop: Masks/Amulets/Gems
  modt: { category: "item", name: "Mask of Death" },
  lhst: { category: "item", name: "Medallion of Courage" },
  gemt: { category: "item", name: "Gem of True Seeing" },

  // ITEMS — Creep Drop: Gloves/Cloaks
  gcel: { category: "item", name: "Gloves of Haste" },
  clsd: { category: "item", name: "Cloak of Shadows" },
  clfm: { category: "item", name: "Cloak of Flames" },

  // ITEMS — Creep Drop: Orbs
  odef: { category: "item", name: "Orb of Darkness" },
  ocor: { category: "item", name: "Orb of Corruption" },
  ofir: { category: "item", name: "Orb of Fire" },

  // ITEMS — Creep Drop: Wands
  wcyc: { category: "item", name: "Wand of the Wind" },
  wneu: { category: "item", name: "Wand of Neutralization" },

  // ITEMS — Creep Drop: Charged drops
  ankh: { category: "item", name: "Ankh of Reincarnation" },
  pghe: { category: "item", name: "Potion of Greater Healing" },
  pgma: { category: "item", name: "Potion of Greater Mana" },
  pams: { category: "item", name: "Anti-magic Potion" },

  // ITEMS — Creep Drop: Miscellaneous
  ward: { category: "item", name: "Sentry Ward" },
  skul: { category: "item", name: "Sacrificial Skull" },
  gold: { category: "item", name: "Gold Coins" },
  lmbr: { category: "item", name: "Bundle of Lumber" },
  sbch: { category: "item", name: "Scroll of the Beast" },
  spre: { category: "item", name: "Scroll of Protection" },
  ssan: { category: "item", name: "Staff of Sanctuary" },
  ssil: { category: "item", name: "Staff of Silence" },
  spro: { category: "item", name: "Amulet of Spell Shield" },
  sori: { category: "item", name: "Sobi Mask" },
  sor1: { category: "item", name: "Shadow Orb +1" },
  sor2: { category: "item", name: "Shadow Orb +2" },
  sor3: { category: "item", name: "Shadow Orb +3" },
  moon: { category: "item", name: "Moon Key" },
  cnob: { category: "item", name: "Circlet of Nobility" },
  tdex: { category: "item", name: "Tome of Agility +2" },
  tpow: { category: "item", name: "Tome of Strength +2" },
  tknl: { category: "item", name: "Tome of Intelligence +2" },
  pdiv: { category: "item", name: "Potion of Divinity" },
  pres: { category: "item", name: "Potion of Restoration" },

  // ITEMS — Powerups (Tomes)
  tstr: { category: "item", name: "Tome of Strength" },
  tagi: { category: "item", name: "Tome of Agility" },
  tint: { category: "item", name: "Tome of Intelligence" },
  txp2: { category: "item", name: "Tome of Experience" },

  // =====================
  // HERO ABILITIES — Human
  // =====================
  AHbz: { category: "ability", name: "Blizzard" },
  AHwe: { category: "ability", name: "Summon Water Elemental" },
  AHab: { category: "ability", name: "Brilliance Aura" },
  AHmt: { category: "ability", name: "Mass Teleport" },
  AHtb: { category: "ability", name: "Storm Bolt" },
  AHtc: { category: "ability", name: "Thunder Clap" },
  AHbh: { category: "ability", name: "Bash" },
  AHav: { category: "ability", name: "Avatar" },
  AHhb: { category: "ability", name: "Holy Light" },
  AHds: { category: "ability", name: "Divine Shield" },
  AHad: { category: "ability", name: "Devotion Aura" },
  AHre: { category: "ability", name: "Resurrection" },
  AHdr: { category: "ability", name: "Flame Strike" },
  AHfs: { category: "ability", name: "Banish" },
  AHsb: { category: "ability", name: "Siphon Mana" },
  AHpx: { category: "ability", name: "Phoenix" },

  // HERO ABILITIES — Orc
  AOcr: { category: "ability", name: "Critical Strike" },
  AOmw: { category: "ability", name: "Mirror Image" },
  AOwk: { category: "ability", name: "Wind Walk" },
  AObd: { category: "ability", name: "Bladestorm" },
  AOcl: { category: "ability", name: "Chain Lightning" },
  AOfs: { category: "ability", name: "Far Sight" },
  AOsf: { category: "ability", name: "Feral Spirit" },
  AOeq: { category: "ability", name: "Earthquake" },
  AOsh: { category: "ability", name: "Shockwave" },
  AOws: { category: "ability", name: "War Stomp" },
  AOre: { category: "ability", name: "Endurance Aura" },
  AOr2: { category: "ability", name: "Reincarnation" },
  AOhw: { category: "ability", name: "Healing Wave" },
  AOhx: { category: "ability", name: "Hex" },
  AOsw: { category: "ability", name: "Serpent Ward" },
  AOvd: { category: "ability", name: "Big Bad Voodoo" },

  // HERO ABILITIES — Night Elf
  AEmb: { category: "ability", name: "Mana Burn" },
  AEim: { category: "ability", name: "Immolation" },
  AEev: { category: "ability", name: "Evasion" },
  AEme: { category: "ability", name: "Metamorphosis" },
  AEer: { category: "ability", name: "Entangling Roots" },
  AEfn: { category: "ability", name: "Force of Nature" },
  AEah: { category: "ability", name: "Thorns Aura" },
  AEtq: { category: "ability", name: "Tranquility" },
  AEst: { category: "ability", name: "Scout" },
  AEsf: { category: "ability", name: "Searing Arrows" },
  AEar: { category: "ability", name: "Trueshot Aura" },
  AEsv: { category: "ability", name: "Starfall" },
  AEfk: { category: "ability", name: "Fan of Knives" },
  AEbl: { category: "ability", name: "Blink" },
  AEsh: { category: "ability", name: "Shadow Strike" },
  AEve: { category: "ability", name: "Vengeance" },

  // HERO ABILITIES — Undead
  AUdc: { category: "ability", name: "Death Coil" },
  AUdp: { category: "ability", name: "Death Pact" },
  AUau: { category: "ability", name: "Unholy Aura" },
  AUan: { category: "ability", name: "Animate Dead" },
  AUcs: { category: "ability", name: "Carrion Swarm" },
  AUsl: { category: "ability", name: "Sleep" },
  AUav: { category: "ability", name: "Vampiric Aura" },
  AUin: { category: "ability", name: "Inferno" },
  AUfn: { category: "ability", name: "Frost Nova" },
  AUfa: { category: "ability", name: "Frost Armor" },
  AUdr: { category: "ability", name: "Dark Ritual" },
  AUdd: { category: "ability", name: "Death and Decay" },
  AUim: { category: "ability", name: "Impale" },
  AUts: { category: "ability", name: "Spiked Carapace" },
  AUcb: { category: "ability", name: "Carrion Beetles" },
  AUls: { category: "ability", name: "Locust Swarm" },
};
