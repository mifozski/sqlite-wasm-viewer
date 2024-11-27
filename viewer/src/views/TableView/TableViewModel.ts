export class TableViewModel {
    public rows;

    public tableName: string;

    public columnNames: string[] = [];

    public fitlers: { [column: string]: string } = {};

    public selectedCell: HTMLElement | null = null;
}
