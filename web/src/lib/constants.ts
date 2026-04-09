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
  { id: "none", name: "Somente Linhas" },
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

// Booking status labels - single source of truth
export const BOOKING_STATUS_LABELS: Record<string, string> = {
  PENDING: "Pendente",
  CONFIRMED: "Confirmado",
  IN_PROGRESS: "Em Andamento",
  COMPLETED: "Concluido",
  CANCELLED: "Cancelado",
};

// Booking status badge colors - single source of truth
export const BOOKING_STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700 border-amber-300",
  CONFIRMED: "bg-emerald-100 text-emerald-700 border-emerald-300",
  IN_PROGRESS: "bg-sky-100 text-sky-700 border-sky-300",
  COMPLETED: "bg-emerald-100 text-emerald-700 border-emerald-300",
  CANCELLED: "bg-red-100 text-red-700 border-red-300",
};
