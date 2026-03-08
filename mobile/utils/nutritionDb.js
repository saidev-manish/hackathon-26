/**
 * Nutrition keyword → macros lookup (grams per typical serving).
 * Used by the PCOS Diet screen to estimate carbs/protein/fat from
 * both the predefined weekly plan and user-entered food logs.
 */

const NUTRITION_DB = [
    // Grains / carbs
    { keywords: ['oats', 'oatmeal', 'porridge'], carbs: 27, protein: 5, fat: 3 },
    { keywords: ['brown rice', 'rice'], carbs: 45, protein: 4, fat: 1 },
    { keywords: ['roti', 'chapati', 'phulka'], carbs: 18, protein: 3, fat: 1 },
    { keywords: ['millet', 'bajra'], carbs: 40, protein: 4, fat: 1.5 },
    { keywords: ['quinoa'], carbs: 39, protein: 8, fat: 4 },
    { keywords: ['ragi'], carbs: 32, protein: 4, fat: 1 },
    { keywords: ['upma'], carbs: 30, protein: 4, fat: 3 },
    { keywords: ['poha'], carbs: 35, protein: 3, fat: 2 },
    { keywords: ['idli'], carbs: 20, protein: 3, fat: 0.5 },
    { keywords: ['khichdi'], carbs: 35, protein: 6, fat: 3 },

    // Legumes / protein
    { keywords: ['dal', 'lentil', 'daal'], carbs: 20, protein: 9, fat: 0.5 },
    { keywords: ['chickpea', 'chana', 'chole'], carbs: 27, protein: 9, fat: 2 },
    { keywords: ['rajma', 'kidney bean'], carbs: 28, protein: 9, fat: 1 },
    { keywords: ['sprout'], carbs: 8, protein: 4, fat: 0.3 },

    // Dairy
    { keywords: ['milk'], carbs: 12, protein: 8, fat: 5 },
    { keywords: ['yogurt', 'curd', 'raita'], carbs: 5, protein: 4, fat: 2 },
    { keywords: ['paneer'], carbs: 3, protein: 7, fat: 5 },

    // Eggs & meat
    { keywords: ['egg'], carbs: 1, protein: 6, fat: 5 },
    { keywords: ['chicken'], carbs: 0, protein: 25, fat: 3 },
    { keywords: ['fish'], carbs: 0, protein: 22, fat: 5 },

    // Soy / plant protein
    { keywords: ['tofu', 'soy'], carbs: 2, protein: 10, fat: 5 },

    // Fruits
    { keywords: ['banana'], carbs: 27, protein: 1, fat: 0 },
    { keywords: ['apple'], carbs: 25, protein: 0.5, fat: 0 },
    { keywords: ['papaya'], carbs: 11, protein: 0.5, fat: 0 },
    { keywords: ['berr'], carbs: 12, protein: 1, fat: 0.5 },
    { keywords: ['fruit'], carbs: 20, protein: 1, fat: 0 },

    // Nuts & seeds
    { keywords: ['almond'], carbs: 3, protein: 3, fat: 7 },
    { keywords: ['walnut'], carbs: 4, protein: 4, fat: 18 },
    { keywords: ['peanut'], carbs: 5, protein: 4, fat: 8 },
    { keywords: ['nut', 'seed', 'chia'], carbs: 4, protein: 3, fat: 7 },

    // Vegetables / salad
    { keywords: ['spinach', 'palak'], carbs: 4, protein: 2, fat: 0.3 },
    { keywords: ['broccoli'], carbs: 6, protein: 3, fat: 0.4 },
    { keywords: ['vegetable', 'sabzi', 'sabji', 'veggie', 'curry'], carbs: 10, protein: 2, fat: 1 },
    { keywords: ['salad', 'cucumber'], carbs: 5, protein: 1, fat: 0.2 },
    { keywords: ['soup'], carbs: 8, protein: 3, fat: 1 },

    // Chilla / besan
    { keywords: ['besan', 'chilla'], carbs: 22, protein: 6, fat: 3 },

    // Smoothie
    { keywords: ['smoothie'], carbs: 30, protein: 8, fat: 3 },

    // Misc
    { keywords: ['sambar'], carbs: 10, protein: 3, fat: 1 },
    { keywords: ['chutney'], carbs: 4, protein: 1, fat: 0.5 },
    { keywords: ['ghee'], carbs: 0, protein: 0, fat: 5 },
];

/** Default fallback macros when no keyword matches */
const DEFAULT_MACROS = { carbs: 20, protein: 5, fat: 3 };

/**
 * Estimate macros from a free-text food description.
 * Accumulates matching keywords (each token contributes once max).
 * @param {string} text
 * @returns {{ carbs: number, protein: number, fat: number }}
 */
export function estimateMacros(text) {
    if (!text) return { ...DEFAULT_MACROS };

    const lower = text.toLowerCase();
    let carbs = 0, protein = 0, fat = 0;
    let matched = false;

    NUTRITION_DB.forEach((entry) => {
        const hits = entry.keywords.filter((kw) => lower.includes(kw));
        if (hits.length > 0) {
            carbs += entry.carbs;
            protein += entry.protein;
            fat += entry.fat;
            matched = true;
        }
    });

    if (!matched) return { ...DEFAULT_MACROS };
    return { carbs: Math.round(carbs), protein: Math.round(protein), fat: Math.round(fat) };
}

/**
 * The predefined 7-day PCOS meal plan with macro estimates pre-computed.
 * Each day has breakfast + lunch + dinner strings from which macros are derived.
 */
const PLAN_DAYS = [
    {
        day: 'Monday',
        meals: [
            'Oats milk apple almonds',
            'Brown rice dal spinach curry salad',
            '2 rotis vegetable curry yogurt',
        ],
    },
    {
        day: 'Tuesday',
        meals: [
            'Upma egg sprouts',
            'Millet roti chickpea curry salad',
            'Soup paneer vegetable',
        ],
    },
    {
        day: 'Wednesday',
        meals: [
            'Smoothie banana spinach milk chia',
            'Quinoa chicken tofu broccoli',
            '2 rotis lentil dal salad',
        ],
    },
    {
        day: 'Thursday',
        meals: [
            'Ragi porridge banana walnut',
            'Brown rice rajma curry salad',
            '2 rotis vegetable sabzi curd',
        ],
    },
    {
        day: 'Friday',
        meals: [
            'Besan chilla chutney',
            'Quinoa vegetable raita',
            'Fish tofu vegetable soup',
        ],
    },
    {
        day: 'Saturday',
        meals: [
            'Oats idli sambar chutney',
            'Millet khichdi ghee raita',
            '2 rotis dal tadka broccoli',
        ],
    },
    {
        day: 'Sunday',
        meals: [
            'Poha peanut fruit',
            'Brown rice dal palak sabzi salad',
            'Paneer tikka roti soup',
        ],
    },
];

/**
 * Returns the predefined plan macros for all 7 days.
 * @returns {Array<{day: string, carbs: number, protein: number, fat: number}>}
 */
export function getPlanWeeklyMacros() {
    return PLAN_DAYS.map(({ day, meals }) => {
        let carbs = 0, protein = 0, fat = 0;
        meals.forEach((meal) => {
            const m = estimateMacros(meal);
            carbs += m.carbs;
            protein += m.protein;
            fat += m.fat;
        });
        return { day, carbs, protein, fat };
    });
}
