export const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('en-US', {
        maximumFractionDigits: 2,
        minimumFractionDigits: 0,
    }).format(num);
};

export const formatCompactNumber = (num: number): string => {
    return new Intl.NumberFormat('en-US', {
        notation: "compact",
        maximumFractionDigits: 2,
    }).format(num);
};
