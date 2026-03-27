// Standard body locations - single source of truth
export const BODY_LOCATIONS = [
  { id: "arm", name: "Braço" },
  { id: "arm-forearm", name: "Antebraço", parentId: "arm" },
  { id: "arm-biceps", name: "Bíceps", parentId: "arm" },
  { id: "arm-triceps", name: "Tríceps", parentId: "arm" },
  { id: "leg", name: "Perna" },
  { id: "leg-thigh", name: "Coxa", parentId: "leg" },
  { id: "leg-shin", name: "Canela", parentId: "leg" },
  { id: "leg-calf", name: "Panturrilha", parentId: "leg" },
  { id: "hand", name: "Mão" },
  { id: "fingers", name: "Dedos" },
  { id: "foot", name: "Pé" },
  { id: "knee", name: "Joelho" },
  { id: "elbow", name: "Cotovelo" },
  { id: "neck", name: "Pescoço" },
  { id: "nape", name: "Nuca" },
  { id: "face", name: "Rosto" },
  { id: "head", name: "Cabeça" },
  { id: "intimate", name: "Partes Íntimas" },
  { id: "back", name: "Costas" },
  { id: "back-cervical", name: "Cervical", parentId: "back" },
  { id: "back-thoracic", name: "Torácica", parentId: "back" },
  { id: "back-lumbar", name: "Lombar", parentId: "back" },
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

// Standard color options - single source of truth
export const COLOR_OPTIONS = [
  { id: "black", name: "Preto", description: "Tatuagem tradicional em preto" },
  { id: "oneColor", name: "1 Cor", description: "Preto e uma cor adicional" },
  { id: "twoColors", name: "2 Cores", description: "Preto e duas cores adicionais" },
  { id: "threeColors", name: "3 Cores", description: "Preto e três cores adicionais" },
] as const;

// Standard tattoo types - single source of truth
export const TATTOO_TYPES = [
  { id: "drawing", name: "Desenho", description: "Tatuagem de desenho personalizado" },
  { id: "text", name: "Texto/Escrita", description: "Tatuagem de texto ou lettering" },
  { id: "closure", name: "Fechamento", description: "Fechamento completo de uma parte do corpo" },
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
