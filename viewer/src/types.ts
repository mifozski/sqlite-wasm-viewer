export type DbWorkerInput =
    | {
          readonly type: 'init';
      }
    | {
          readonly type: 'query';
          readonly query: { sql: string; parameters: ReadonlyArray<unknown> };
      }
    | {
          readonly type: 'readSchema';
          readonly path: string;
      };

export type DbWorkerOutput =
    | { readonly type: 'onReady'; dbs: string[] }
    | { readonly type: 'onSchema'; schema: string[] }
    | {
          readonly type: 'onQuery';
          readonly requestId: number;
          readonly result: {
              resultRows?: any[];
              tableName: string;
              updates?: { changes: any[]; lastInsertRowid: number };
          };
      };

export type Database = {
    post: (message: DbWorkerInput) => void;
    on: (message: MessageEvent<DbWorkerOutput>) => void;
};
