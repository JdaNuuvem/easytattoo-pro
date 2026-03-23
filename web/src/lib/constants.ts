// Standard body locations - single source of truth
export const BODY_LOCATIONS = [
  { id: "arm", name: "Braco" },
  { id: "leg", name: "Perna" },
  { id: "hand", name: "Mao" },
  { id: "foot", name: "Pe" },
  { id: "knee", name: "Joelho" },
  { id: "elbow", name: "Cotovelo" },
  { id: "neck", name: "Pescoco" },
  { id: "nape", name: "Nuca" },
  { id: "face", name: "Rosto" },
  { id: "head", name: "Cabeca" },
  { id: "intimate", name: "Partes Intimas" },
  { id: "back", name: "Costas" },
  { id: "chest", name: "Peito" },
  { id: "ribs", name: "Costela" },
  { id: "sternum", name: "Esterno" },
] as const;

// Standard shading options - single source of truth
export const SHADING_OPTIONS = [
  { id: "none", name: "Sem Sombreamento" },
  { id: "light", name: "Sombreamento Leve" },
  { id: "medium", name: "Sombreamento Medio" },
  { id: "realism", name: "Realismo" },
] as const;

// Standard tattoo style categories - single source of truth
export const STYLE_CATEGORIES = [
  "Blackwork",
  "Fineline",
  "Realismo",
  "Aquarela",
  "Traditional",
  "New School",
  "Old School",
  "Geometrico",
  "Pontilhismo",
  "Tribal",
  "Lettering",
  "Minimalista",
  "Oriental",
  "Cobertura",
  "Outro",
] as const;
