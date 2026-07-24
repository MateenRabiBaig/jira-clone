export function timeAgo(dateString: string): string {
    const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000)
    const units: [number, string][] = [
        [60, 's'], [60, 'm'], [24, 'h'], [7, 'd'], [4.345, 'w'], [12, 'mo'], [Infinity, 'y']
    ]
    let value = seconds;
    let unit = 's';
    
    for (const [div, label] of units) {
        if (value < div) { unit = label; break; }
        value = Math.floor(value / div);
        unit = label;
    }
    return `${value}${unit} ago`;
}