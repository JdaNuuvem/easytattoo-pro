/**
 * Configuração padrão de preços - usada como estado inicial do store
 * antes de carregar a configuração real do artista via API.
 * NÃO são dados fake - são defaults razoáveis que serão substituídos.
 */
import {
  BodyLocation,
  ColorOption,
  PriceTableEntry,
  PricingConfig,
  ShadingOption,
  TattooTypeOption,
} from "./types";

let idCounter = 0;
function generateId(): string {
  idCounter += 1;
  return `mock-${idCounter}`;
}

export const mockPriceTable: PriceTableEntry[] = [
  // Desenho (altura x largura)
  { id: generateId(), type: "drawing", width: 1, height: 1, additionalPrice: 150, additionalTime: 30 },
  { id: generateId(), type: "drawing", width: 2, height: 2, additionalPrice: 150, additionalTime: 30 },
  { id: generateId(), type: "drawing", width: 3, height: 3, additionalPrice: 150, additionalTime: 30 },
  { id: generateId(), type: "drawing", width: 4, height: 4, additionalPrice: 150, additionalTime: 30 },
  { id: generateId(), type: "drawing", width: 5, height: 5, additionalPrice: 147, additionalTime: 30 },
  { id: generateId(), type: "drawing", width: 6, height: 6, additionalPrice: 177, additionalTime: 30 },
  { id: generateId(), type: "drawing", width: 7, height: 7, additionalPrice: 197, additionalTime: 60 },
  { id: generateId(), type: "drawing", width: 8, height: 8, additionalPrice: 207, additionalTime: 90 },
  { id: generateId(), type: "drawing", width: 9, height: 9, additionalPrice: 227, additionalTime: 90 },
  { id: generateId(), type: "drawing", width: 10, height: 10, additionalPrice: 247, additionalTime: 90 },
  { id: generateId(), type: "drawing", width: 11, height: 11, additionalPrice: 307, additionalTime: 150 },
  { id: generateId(), type: "drawing", width: 12, height: 12, additionalPrice: 357, additionalTime: 150 },
  { id: generateId(), type: "drawing", width: 13, height: 13, additionalPrice: 427, additionalTime: 210 },
  { id: generateId(), type: "drawing", width: 14, height: 14, additionalPrice: 487, additionalTime: 270 },
  { id: generateId(), type: "drawing", width: 15, height: 15, additionalPrice: 557, additionalTime: 300 },
  { id: generateId(), type: "drawing", width: 16, height: 16, additionalPrice: 647, additionalTime: 330 },
  { id: generateId(), type: "drawing", width: 17, height: 17, additionalPrice: 727, additionalTime: 330 },
  { id: generateId(), type: "drawing", width: 18, height: 18, additionalPrice: 817, additionalTime: 390 },
  { id: generateId(), type: "drawing", width: 19, height: 19, additionalPrice: 897, additionalTime: 390 },
  { id: generateId(), type: "drawing", width: 20, height: 20, additionalPrice: 987, additionalTime: 420 },
  { id: generateId(), type: "drawing", width: 21, height: 21, additionalPrice: 1067, additionalTime: 450 },
  { id: generateId(), type: "drawing", width: 22, height: 22, additionalPrice: 1157, additionalTime: 480 },
  { id: generateId(), type: "drawing", width: 23, height: 23, additionalPrice: 1157, additionalTime: 480 },
  { id: generateId(), type: "drawing", width: 24, height: 24, additionalPrice: 1157, additionalTime: 480 },
  { id: generateId(), type: "drawing", width: 25, height: 25, additionalPrice: 1157, additionalTime: 480 },
  { id: generateId(), type: "drawing", width: 26, height: 26, additionalPrice: 1207, additionalTime: 600 },
  { id: generateId(), type: "drawing", width: 27, height: 27, additionalPrice: 1257, additionalTime: 600 },
  { id: generateId(), type: "drawing", width: 28, height: 28, additionalPrice: 1307, additionalTime: 720 },
  { id: generateId(), type: "drawing", width: 29, height: 29, additionalPrice: 1357, additionalTime: 720 },
  { id: generateId(), type: "drawing", width: 30, height: 30, additionalPrice: 1407, additionalTime: 720 },
  // Escrita (somente largura, altura fixa = 2cm)
  { id: generateId(), type: "text", width: 1, height: 0, additionalPrice: 150, additionalTime: 30 },
  { id: generateId(), type: "text", width: 2, height: 0, additionalPrice: 150, additionalTime: 30 },
  { id: generateId(), type: "text", width: 3, height: 0, additionalPrice: 150, additionalTime: 30 },
  { id: generateId(), type: "text", width: 4, height: 0, additionalPrice: 150, additionalTime: 30 },
  { id: generateId(), type: "text", width: 5, height: 0, additionalPrice: 147, additionalTime: 30 },
  { id: generateId(), type: "text", width: 6, height: 0, additionalPrice: 177, additionalTime: 30 },
  { id: generateId(), type: "text", width: 7, height: 0, additionalPrice: 197, additionalTime: 30 },
  { id: generateId(), type: "text", width: 8, height: 0, additionalPrice: 207, additionalTime: 30 },
  { id: generateId(), type: "text", width: 9, height: 0, additionalPrice: 227, additionalTime: 30 },
  { id: generateId(), type: "text", width: 10, height: 0, additionalPrice: 247, additionalTime: 60 },
  { id: generateId(), type: "text", width: 15, height: 0, additionalPrice: 357, additionalTime: 90 },
  { id: generateId(), type: "text", width: 20, height: 0, additionalPrice: 487, additionalTime: 120 },
  { id: generateId(), type: "text", width: 25, height: 0, additionalPrice: 647, additionalTime: 150 },
  { id: generateId(), type: "text", width: 30, height: 0, additionalPrice: 817, additionalTime: 180 },
];

export const mockBodyLocations: BodyLocation[] = [
  { id: "arm", name: "Braço", description: "Escolha a região do braço", additionalPrice: 0, additionalTime: 0 },
  { id: "arm-forearm", name: "Antebraço", description: "Região do antebraço", additionalPrice: 0, additionalTime: 0, parentId: "arm" },
  { id: "arm-biceps", name: "Bíceps", description: "Região do bíceps", additionalPrice: 0, additionalTime: 0, parentId: "arm" },
  { id: "arm-triceps", name: "Tríceps", description: "Região do tríceps", additionalPrice: 0, additionalTime: 0, parentId: "arm" },
  { id: "leg", name: "Perna", description: "Escolha a região da perna", additionalPrice: 0, additionalTime: 0 },
  { id: "leg-thigh", name: "Coxa", description: "Região da coxa", additionalPrice: 0, additionalTime: 0, parentId: "leg" },
  { id: "leg-shin", name: "Canela", description: "Região da canela", additionalPrice: 0, additionalTime: 0, parentId: "leg" },
  { id: "leg-calf", name: "Panturrilha", description: "Região da panturrilha", additionalPrice: 0, additionalTime: 0, parentId: "leg" },
  { id: "hand", name: "Mão", description: "Região da mão", additionalPrice: 50, additionalTime: 30 },
  { id: "fingers", name: "Dedos", description: "Região dos dedos", additionalPrice: 50, additionalTime: 30 },
  { id: "foot", name: "Pé", description: "Região do pé", additionalPrice: 50, additionalTime: 30 },
  { id: "knee", name: "Joelho", description: "Região do joelho", additionalPrice: 50, additionalTime: 30 },
  { id: "elbow", name: "Cotovelo", description: "Região do cotovelo", additionalPrice: 50, additionalTime: 30 },
  { id: "neck", name: "Pescoço", description: "Região do pescoço", additionalPrice: 100, additionalTime: 45 },
  { id: "nape", name: "Nuca", description: "Região da nuca", additionalPrice: 75, additionalTime: 30 },
  { id: "face", name: "Rosto", description: "Região facial", additionalPrice: 150, additionalTime: 60 },
  { id: "head", name: "Cabeça", description: "Região do couro cabeludo", additionalPrice: 100, additionalTime: 45 },
  { id: "intimate", name: "Partes Íntimas", description: "Áreas íntimas - consulte o tatuador", additionalPrice: 200, additionalTime: 60 },
  { id: "back", name: "Costas", description: "Escolha a região das costas", additionalPrice: 100, additionalTime: 45 },
  { id: "back-cervical", name: "Cervical", description: "Região cervical (costas superior)", additionalPrice: 100, additionalTime: 45, parentId: "back" },
  { id: "back-thoracic", name: "Torácica", description: "Região torácica (costas meio)", additionalPrice: 100, additionalTime: 45, parentId: "back" },
  { id: "back-lumbar", name: "Lombar", description: "Região lombar (costas inferior)", additionalPrice: 100, additionalTime: 45, parentId: "back" },
  { id: "chest", name: "Peito", description: "Região do peito", additionalPrice: 100, additionalTime: 45 },
  { id: "ribs", name: "Costela", description: "Região das costelas", additionalPrice: 150, additionalTime: 60 },
  { id: "sternum", name: "Esterno", description: "Região do esterno entre os seios", additionalPrice: 150, additionalTime: 60 },
];

export const mockShadingOptions: ShadingOption[] = [
  { id: "none", name: "Somente Linhas", description: "Tatuagem somente com linhas", additionalPrice: 0, additionalTime: 0 },
  { id: "light", name: "Sombreamento Leve", description: "Sombreamento suave e delicado", additionalPrice: 50, additionalTime: 30 },
  { id: "medium", name: "Sombreamento Medio", description: "Sombreamento com mais contraste e profundidade", additionalPrice: 100, additionalTime: 60 },
  { id: "realism", name: "Realismo", description: "Sombreamento realista com alto nivel de detalhes", additionalPrice: 200, additionalTime: 120 },
];

export const mockColorOptions: ColorOption[] = [
  { id: "black", name: "Preto", description: "Tatuagem tradicional em preto", additionalPrice: 0, additionalTime: 0 },
  { id: "oneColor", name: "1 Cor", description: "Tatuagem com preto e uma cor adicional", additionalPrice: 50, additionalTime: 30 },
  { id: "twoColors", name: "2 Cores", description: "Tatuagem com preto e duas cores adicionais", additionalPrice: 100, additionalTime: 60 },
  { id: "threeColors", name: "3 Cores", description: "Tatuagem com preto e tres cores adicionais", additionalPrice: 150, additionalTime: 90 },
];

export const mockTattooTypes: TattooTypeOption[] = [
  { id: "drawing", name: "Desenho", description: "Tatuagem de desenho personalizado", basePrice: 50, baseTime: 120 },
  { id: "text", name: "Texto/Escrita", description: "Tatuagem de texto ou lettering", basePrice: 50, baseTime: 60 },
  { id: "closure", name: "Fechamento", description: "Fechamento completo de uma parte do corpo", basePrice: 200, baseTime: 300 },
];

export const mockPricingConfig: PricingConfig = {
  priceTable: mockPriceTable,
  bodyLocations: mockBodyLocations,
  shadingOptions: mockShadingOptions,
  colorOptions: mockColorOptions,
  tattooTypes: mockTattooTypes,
  maxDailyTime: 240,
  fixedDeposit: 50,
};
