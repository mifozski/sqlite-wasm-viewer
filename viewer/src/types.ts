export type DbWorkerInput =
    | {
          readonly type: 'init';
      }
    | {
          readonly type: 'query';
          readonly query: {
              sql: string;
              parameters: ReadonlyArray<unknown>;
          };
          databasePath: string;
          label?: string;
      }
    | {
          readonly type: 'readSchema';
          readonly path: string;
      };

export type DbWorkerOutput =
    | { readonly type: 'onReady' }
    | { readonly type: 'onSchema'; dbName: string; schema: string[] }
    | {
          readonly type: 'onQuery';
          readonly result: {
              resultRows?: any[];
              tableName: string;
              updates?: { changes: any[]; lastInsertRowid: number };
          };
          label?: string;
      };

export type Database = {
    post: (message: DbWorkerInput) => void;
    on: (message: MessageEvent<DbWorkerOutput>) => void;
};
