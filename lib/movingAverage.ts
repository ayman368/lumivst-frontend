export function simpleMovingAverage(values: number[], window: number): (number | null)[] {
    const out: (number | null)[] = Array(values.length).fill(null);
    if (window <= 0) return out;
    let sum = 0;
    let count = 0;
    for (let i = 0; i < values.length; i++) {
        const v = values[i];
        sum += v;
        count++;
        if (i >= window) {
            sum -= values[i - window];
            count--;
        }
        if (i >= window - 1) out[i] = sum / window;
    }
    return out;
}

export function seriesMovingAverage<T extends { time: string }>(data: T[], accessor: (d: T) => number, window: number) {
    const vals = data.map(accessor);
    const ma = simpleMovingAverage(vals, window);
    return data.map((d, i) => ma[i] != null ? { time: d.time, value: ma[i] as number } : { time: d.time });
}
