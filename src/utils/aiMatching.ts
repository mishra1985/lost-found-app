import { Item, MatchingConfig } from '../types';

export const matchingConfig: MatchingConfig = {
  thresholds: {
    imageConfidence: 0.7,
    textSimilarity: 0.7,
    combinedThreshold: 0.70,
  },
  weights: {
    imageWeight: 0.6,
    textWeight: 0.4,
  },
};

// Cosine similarity
const calculateImageSimilarity = (img1: number[] | null, img2: number[] | null): number => {
  if (!img1 || !img2) return 0;
  const len = Math.min(img1.length, img2.length);
  let dot = 0, mag1 = 0, mag2 = 0;

  for (let i = 0; i < len; i++) {
    dot += img1[i] * img2[i];
    mag1 += img1[i] ** 2;
    mag2 += img2[i] ** 2;
  }

  const denom = Math.sqrt(mag1) * Math.sqrt(mag2);
  return denom === 0 ? 0 : Math.min(1, Math.max(0, dot / denom));
};

// Jaccard similarity + bigrams + bonus
const calculateTextSimilarity = (text1: string[] | null, text2: string[] | null): number => {
  if (!text1 || !text2) return 0;

  const set1 = new Set(text1.map(t => t.toLowerCase()));
  const set2 = new Set(text2.map(t => t.toLowerCase()));
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  const exactMatchBonus = 0.2;

  let similarity = intersection.size / union.size;
  if (intersection.size > 0) {
    similarity += exactMatchBonus * (intersection.size / Math.max(set1.size, set2.size));
  }

  return Math.min(1, similarity);
};

// Location heuristic similarity
const calculateLocationSimilarity = (loc1: string, loc2: string): number => {
  loc1 = loc1.toLowerCase();
  loc2 = loc2.toLowerCase();
  if (loc1 === loc2) return 1.0;

  const common = new Set(['the', 'in', 'at', 'on', 'near', 'by', 'to', 'and', 'or']);
  const words1 = loc1.split(/\s+/).filter(w => !common.has(w) && w.length > 2);
  const words2 = loc2.split(/\s+/).filter(w => !common.has(w) && w.length > 2);

  let matches = 0, partials = 0;
  for (const w1 of words1) {
    for (const w2 of words2) {
      if (w1 === w2) matches++;
      else if (w1.includes(w2) || w2.includes(w1)) partials++;
    }
  }

  const exact = matches / Math.max(words1.length, words2.length);
  const partial = (partials * 0.5) / Math.max(words1.length, words2.length);
  return Math.min(1, exact + partial);
};

const calculateCategorySimilarity = (c1: string, c2: string): number => {
  if (c1 === c2) return 1.0;

  const related: Record<string, string[]> = {
    'electronics': ['accessories'],
    'accessories': ['electronics', 'clothing'],
    'clothing': ['accessories'],
    'jewelry': ['accessories'],
    'documents': ['other'],
    'pets': ['other'],
  };

  return related[c1]?.includes(c2) || related[c2]?.includes(c1) ? 0.5 : 0;
};

export const calculateMatchConfidence = (lost: Item, found: Item): number => {
 const imageSim = calculateImageSimilarity(lost.image_features, found.image_features);
  const textSim = calculateTextSimilarity(lost.text_features, found.text_features);
  const locSim = calculateLocationSimilarity(lost.location, found.location);
  const catSim = calculateCategorySimilarity(lost.category, found.category);

  const { imageWeight, textWeight } = matchingConfig.weights;
  const locationWeight = 0.15;
  const categoryWeight = 0.15;

  const totalWeight = imageWeight + textWeight + locationWeight + categoryWeight;

  return Math.min(1, (
    imageSim * imageWeight +
    textSim * textWeight +
    locSim * locationWeight +
    catSim * categoryWeight
  ) / totalWeight);
};
//export const calculateMatchConfidence = () => 0.9; 


export const findPotentialMatches = (newItem: Item, existing: Item[]) => {
  const others = existing.filter(i =>
    ((newItem.type === 'lost' && i.type === 'found') || (newItem.type === 'found' && i.type === 'lost')) &&
    i.status !== 'matched'
  );

  const allMatches = others.map(item => {
    const lost = newItem.type === 'lost' ? newItem : item;
    const found = newItem.type === 'found' ? newItem : item;
    const confidence = calculateMatchConfidence(lost, found);

    console.log('🧠 Match Debug:', {
      lostTitle: lost.title,
      foundTitle: found.title,
      confidence,
    });

    return { item, confidence };
  });

  // Show full list before filtering
  console.log('🔍 Raw Matches (before filtering):', allMatches);

  // Return only those above threshold
  return allMatches
    .filter(match => match.confidence >= matchingConfig.thresholds.combinedThreshold)
    .sort((a, b) => b.confidence - a.confidence);
};


export const extractTextFeatures = (text: string): string[] => {
  const normalized = text.toLowerCase().replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();
  const words = normalized.split(' ').filter(w => w.length > 2);
  const bigrams = words.slice(1).map((w, i) => `${words[i]} ${w}`);
  return [...new Set([...words, ...bigrams])];
};

export const extractImageFeatures = async (imageFile: File): Promise<number[]> => {
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = () => {
      const features = Array(64).fill(0.5);
      resolve(features);
    };
    reader.readAsArrayBuffer(imageFile);
  });
};
