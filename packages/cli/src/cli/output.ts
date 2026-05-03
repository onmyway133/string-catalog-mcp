import chalk from 'chalk';

export function printTable(headers: string[], rows: string[][]): void {
    if (rows.length === 0) {
        console.log('(no results)');
        return;
    }

    const colWidths = headers.map((h, i) =>
        Math.max(h.length, ...rows.map((r) => (r[i] ?? '').length)),
    );

    const pad = (str: string, width: number) => str.padEnd(width);
    const separator = colWidths.map((w) => '─'.repeat(w)).join('  ');

    console.log(chalk.bold(headers.map((h, i) => pad(h, colWidths[i])).join('  ')));
    console.log(separator);
    for (const row of rows) {
        console.log(row.map((cell, i) => pad(cell ?? '', colWidths[i])).join('  '));
    }
}

export function printJson(data: unknown): void {
    console.log(JSON.stringify(data, null, 2));
}

export function printError(msg: string): void {
    console.error(chalk.red(`Error: ${msg}`));
}
