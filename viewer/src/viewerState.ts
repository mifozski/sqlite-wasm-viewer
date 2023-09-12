import { CurrentCell, CurrentTable } from './types';

export class ViewerState {
    private static _instance: ViewerState;

    static get instance(): ViewerState {
        return ViewerState._instance;
    }

    selectedCell: CurrentCell | undefined;

    selectedTable: CurrentTable | undefined;

    hasChanges = false;

    constructor(private viewerElem: HTMLElement) {
        ViewerState._instance = this;
    }

    setSelectedCell(cell: CurrentCell) {
        this.selectedCell = cell;

        const event = new CustomEvent('cellSelected', { detail: cell });
        this.viewerElem.dispatchEvent(event);
    }

    setSelectedTable(table: CurrentTable) {
        this.selectedTable = table;

        const event = new CustomEvent('tableSelected', { detail: table });
        this.viewerElem.dispatchEvent(event);
    }

    setHasChanges(hasChanges: boolean) {
        this.hasChanges = hasChanges;

        const event = new CustomEvent('dbHasChanges', { detail: hasChanges });
        this.viewerElem.dispatchEvent(event);
    }
}

export function initState(viewerElem: HTMLElement) {
    return new ViewerState(viewerElem);
}
