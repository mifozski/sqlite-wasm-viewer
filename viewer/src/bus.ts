import { Query } from './QueryRunner';
import { CurrentCell, CurrentTable, Database } from './types';
import { DatabaseItem } from './views/ExplorerView/ExplorerView';

type BusEventMap = {
    'cell-selected': CurrentCell;
    'table-selected': CurrentTable;
    'db-dirtied': boolean;
    'db-found': DatabaseItem;
    'query-results':
        | {
              result: {
                  resultRows?: any[];
                  tableName: string;
                  updates?: { changes: any[]; lastInsertRowid: number };
              };
              label?: string;
          }
        | undefined;
    'query-run': Query;
    'db-connector-ready': Database;
    'query-runner-ready': true;
    'cell-edited': { cell: CurrentCell; value: string };
};

type BusEventListener<K extends keyof BusEventMap> = (
    event: BusEventMap[K]
) => void;

const _listeners: { [K in keyof BusEventMap]?: BusEventListener<K>[] } = {};

export function listen<K extends keyof BusEventMap>(
    type: K,
    listener: BusEventListener<K>
) {
    let listeners = _listeners[type];
    if (!listeners) {
        listeners = _listeners[type] = [];
    }

    listeners.push(listener);
}

export function remove<K extends keyof BusEventMap>(
    type: K,
    listener: BusEventListener<K>
) {
    const listeners = _listeners[type];
    if (!listeners) {
        return;
    }

    const idx = listeners.indexOf(listener);
    if (idx >= 0) {
        listeners.splice(idx, 1);
    }
}

export function emit<K extends keyof BusEventMap>(
    type: K,
    event: BusEventMap[K]
) {
    const listeners = _listeners[type];
    if (!listeners) {
        return;
    }

    for (const listener of listeners) {
        listener(event);
    }
}
