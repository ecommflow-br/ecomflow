export const generateSKU = (title, options = {}) => {
    if (!title) return "SKU-000";

    // 1. Extract first significant words
    const cleanTitle = title.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
    const words = cleanTitle.split(" ").filter(w => w.length > 2 && !['COM', 'PARA', 'UMA', 'QUE'].includes(w));

    // Get first 3 letters of first 2 words
    const part1 = words[0] ? words[0].substring(0, 3) : "PRO";
    const part2 = words[1] ? words[1].substring(0, 3) : "G";

    // Get size if present (VERY rough logic, relying on common sizes)
    const size = options.size || "U";

    // Generate Random Suffix
    const random = Math.floor(Math.random() * 900) + 100;

    return `${part1}-${part2}-${size}-${random}`;
};
