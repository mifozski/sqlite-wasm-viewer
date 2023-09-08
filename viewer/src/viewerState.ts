export interface SelectedCell {
    value: string;
    tableName: string;
    columnName: string;
    cellRowId: string;
}

export class ViewerState {
    private static _instance: ViewerState;

    static get instance(): ViewerState {
        return ViewerState._instance;
    }

    selectedCell: SelectedCell | undefined;

    selectedTable: string;

    hasChanges = false;

    constructor(private viewerElem: HTMLElement) {
        ViewerState._instance = this;
    }

    setSelectedCell(cell: SelectedCell) {
        this.selectedCell = cell;

        const event = new CustomEvent('cellSelected', { detail: cell });
        this.viewerElem.dispatchEvent(event);
    }

    setSelectedTable(tableName: string) {
        this.selectedTable = tableName;

        const event = new CustomEvent('tableSelected', { detail: tableName });
        this.viewerElem.dispatchEvent(event);
    }

    setHasChanges(hasChanges: boolean) {
        this.hasChanges = hasChanges;

        const event = new CustomEvent('hasChanges', { detail: hasChanges });
        this.viewerElem.dispatchEvent(event);
    }
}

export function initState(viewerElem: HTMLElement) {
    return new ViewerState(viewerElem);
}
