export function cleanSymbol(symbol: string): string {
    if (!symbol) return '';
    return symbol.replace(/\D/g, '');
}

export function cleanName(value: any): string {
    if (!value || value === 'N/A') return 'N/A';
    return String(value).trim().replace(/\.$/, '');
}

export function parseFormattedNumber(value: any, handleParentheses = false): number {
    if (!value || value === 'N/A' || value === '') return 0;

    if (typeof value === 'number') return value;

    const strValue = value.toString().trim();

    if (handleParentheses && strValue.startsWith('(') && strValue.endsWith(')')) {
        return -parseFloat(strValue.slice(1, -1).replace(/,/g, ''));
    }

    if (strValue.includes('%')) {
        return parseFloat(strValue.replace('%', ''));
    }

    return parseFloat(strValue.replace(/,/g, '')) || 0;
}

export function formatNumber(value: any): string {
    if (value === null || value === undefined || value === 'N/A') return 'N/A';

    const num = parseFormattedNumber(value);
    if (isNaN(num)) return 'N/A';

    return num.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

export function formatNumberOneDecimal(value: any): string {
    if (value === null || value === undefined || value === 'N/A') return 'N/A';

    const num = parseFormattedNumber(value);
    if (isNaN(num)) return 'N/A';

    return num.toLocaleString('en-US', {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1
    });
}

export function formatChange(value: any): string {
    if (value === null || value === undefined || value === 'N/A') return 'N/A';

    const num = parseFormattedNumber(value, true);
    if (isNaN(num)) return 'N/A';

    const absNum = Math.abs(num);
    const formatted = absNum.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

    return num < 0 ? `(${formatted})` : formatted;
}

export function formatChangePercent(value: any): string {
    if (value === null || value === undefined || value === 'N/A') return 'N/A';

    const num = parseFormattedNumber(value);
    if (isNaN(num)) return 'N/A';

    const absNum = Math.abs(num);
    return num < 0 ? `(${absNum.toFixed(2)}%)` : `${absNum.toFixed(2)}%`;
}

export function formatChangePercentOneDecimal(value: any): string {
    if (value === null || value === undefined || value === 'N/A') return 'N/A';

    const num = parseFormattedNumber(value);
    if (isNaN(num)) return 'N/A';

    const absNum = Math.abs(num);
    return num < 0 ? `(${absNum.toFixed(1)}%)` : `${absNum.toFixed(1)}%`;
}

export function formatText(value: any): string {
    if (!value || value === 'N/A') return 'N/A';
    return String(value);
}

export function displayRawValue(value: any): string {
    if (value === null || value === undefined || value === '') return 'N/A';

    if (typeof value === 'number') {
        return value.toLocaleString('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        });
    }

    const strValue = String(value).trim();
    if (strValue === 'N/A') return 'N/A';

    const num = parseFloat(strValue.replace(/,/g, ''));
    if (!isNaN(num)) {
        return num.toLocaleString('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        });
    }

    return strValue;
}
