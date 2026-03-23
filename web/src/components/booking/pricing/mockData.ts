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
  { id: generateId(), width: 1, height: 1, additionalPrice: 0, additionalTime: 0 },
  { id: generateId(), width: 2, height: 2, additionalPrice: 0, additionalTime: 0 },
  { id: generateId(), width: 3, height: 3, additionalPrice: 0, additionalTime: 0 },
  { id: generateId(), width: 4, height: 4, additionalPrice: 0, additionalTime: 0 },
  { id: generateId(), width: 5, height: 5, additionalPrice: 0, additionalTime: 0 },
  { id: generateId(), width: 6, height: 6, additionalPrice: 27, additionalTime: 0 },
  { id: generateId(), width: 7, height: 7, additionalPrice: 47, additionalTime: 30 },
  { id: generateId(), width: 8, height: 8, additionalPrice: 57, additionalTime: 60 },
  { id: generateId(), width: 9, height: 9, additionalPrice: 77, additionalTime: 60 },
  { id: generateId(), width: 10, height: 10, additionalPrice: 100, additionalTime: 60 },
  { id: generateId(), width: 11, height: 11, additionalPrice: 157, additionalTime: 120 },
  { id: generateId(), width: 12, height: 12, additionalPrice: 207, additionalTime: 120 },
  { id: generateId(), width: 13, height: 13, additionalPrice: 277, additionalTime: 180 },
  { id: generateId(), width: 14, height: 14, additionalPrice: 337, additionalTime: 240 },
  { id: generateId(), width: 15, height: 15, additionalPrice: 407, additionalTime: 270 },
  { id: generateId(), width: 16, height: 16, additionalPrice: 497, additionalTime: 300 },
  { id: generateId(), width: 17, height: 17, additionalPrice: 577, additionalTime: 300 },
  { id: generateId(), width: 18, height: 18, additionalPrice: 667, additionalTime: 360 },
  { id: generateId(), width: 19, height: 19, additionalPrice: 747, additionalTime: 360 },
  { id: generateId(), width: 20, height: 20, additionalPrice: 837, additionalTime: 390 },
  { id: generateId(), width: 21, height: 21, additionalPrice: 917, additionalTime: 420 },
  { id: generateId(), width: 22, height: 22, additionalPrice: 1007, additionalTime: 450 },
  { id: generateId(), width: 23, height: 23, additionalPrice: 1007, additionalTime: 450 },
  { id: generateId(), width: 24, height: 24, additionalPrice: 1007, additionalTime: 450 },
  { id: generateId(), width: 25, height: 25, additionalPrice: 1007, additionalTime: 450 },
  { id: generateId(), width: 26, height: 26, additionalPrice: 1057, additionalTime: 570 },
  { id: generateId(), width: 27, height: 27, additionalPrice: 1107, additionalTime: 570 },
  { id: generateId(), width: 28, height: 28, additionalPrice: 1157, additionalTime: 690 },
  { id: generateId(), width: 29, height: 29, additionalPrice: 1207, additionalTime: 690 },
  { id: generateId(), width: 30, height: 30, additionalPrice: 1257, additionalTime: 690 },
];

export const mockBodyLocations: BodyLocation[] = [
  { id: "arm", name: "Braco", description: "Parte externa ou interna do braco", additionalPrice: 0, additionalTime: 0 },
  { id: "leg", name: "Perna", description: "Parte externa ou interna da perna", additionalPrice: 0, additionalTime: 0 },
  { id: "hand", name: "Mao", description: "Regiao da mao e dedos", additionalPrice: 50, additionalTime: 30 },
  { id: "foot", name: "Pe", description: "Regiao do pe e dedos", additionalPrice: 50, additionalTime: 30 },
  { id: "knee", name: "Joelho", description: "Regiao do joelho", additionalPrice: 50, additionalTime: 30 },
  { id: "elbow", name: "Cotovelo", description: "Regiao do cotovelo", additionalPrice: 50, additionalTime: 30 },
  { id: "neck", name: "Pescoco", description: "Regiao do pescoco", additionalPrice: 100, additionalTime: 45 },
  { id: "nape", name: "Nuca", description: "Regiao da nuca", additionalPrice: 75, additionalTime: 30 },
  { id: "face", name: "Rosto", description: "Regiao facial", additionalPrice: 150, additionalTime: 60 },
  { id: "head", name: "Cabeca", description: "Regiao do couro cabeludo", additionalPrice: 100, additionalTime: 45 },
  { id: "intimate", name: "Partes Intimas", description: "Areas intimas - consulte o tatuador", additionalPrice: 200, additionalTime: 60 },
  { id: "back", name: "Costas", description: "Regiao das costas", additionalPrice: 100, additionalTime: 45 },
  { id: "chest", name: "Peito", description: "Regiao do peito", additionalPrice: 100, additionalTime: 45 },
  { id: "ribs", name: "Costela", description: "Regiao das costelas", additionalPrice: 150, additionalTime: 60 },
  { id: "sternum", name: "Esterno", description: "Regiao do esterno entre os seios", additionalPrice: 150, additionalTime: 60 },
];

export const mockShadingOptions: ShadingOption[] = [
  { id: "none", name: "Sem Sombreamento", description: "Tatuagem sem sombreamento", additionalPrice: 0, additionalTime: 0 },
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
