import { CurrentCell, CurrentTable } from './types';
import * as Bus from './bus';

export type State = {
    selectedCell: CurrentCell | null;

    selectedTable: CurrentTable | null;

    dirty: boolean;
};

const _state: State = {
    selectedCell: null,
    selectedTable: null,
    dirty: false,
};

export function selectedTable() {
    return _state.selectedTable;
}

export function isDirty() {
    return _state.dirty;
}

export function selectCell(cell: CurrentCell) {
    _state.selectedCell = cell;

    Bus.emit('cell-selected', cell);
}

export function selectTable(table: CurrentTable) {
    _state.selectedTable = table;

    Bus.emit('table-selected', table);
}

export function setDirty(dirty: boolean) {
    _state.dirty = dirty;

    Bus.emit('db-dirtied', dirty);
}
