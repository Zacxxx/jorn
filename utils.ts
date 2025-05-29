export function getRarityColorClass(rarity: number): string {
    if (rarity >= 9) return 'text-red-400'; // Relic
    if (rarity >= 7) return 'text-orange-400'; // Legendary
    if (rarity >= 5) return 'text-purple-400'; // Epic
    if (rarity >= 3) return 'text-blue-400'; // Rare
    if (rarity >= 1) return 'text-green-400'; // Uncommon
    return 'text-slate-400'; // Common / Basic (Rarity 0)
}

export function getScalingFactorFromRarity(rarity: number): number {
    switch (rarity) {
        case 0: return 0;    // 0%
        case 1: return 0.1;  // 10%
        case 2: return 0.2;  // 20%
        case 3: return 0.3;  // 30%
        case 4: return 0.5;  // 50%
        case 5: return 0.75; // 75%
        case 6: return 1.0;  // 100%
        case 7: return 1.25; // 125%
        case 8: return 1.5;  // 150%
        case 9: return 1.75; // 175%
        case 10: return 2.0; // 200%
        default: return 0;
    }
}

// You can add more utility functions here as needed.