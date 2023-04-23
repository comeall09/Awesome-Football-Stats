export const isEqual = (a: string, b: string) => a.toLowerCase() === b.toLowerCase();
export const contains = (array: string[], item: string) =>
    array.some((arrItem) => arrItem.toLowerCase() === item.toLowerCase());