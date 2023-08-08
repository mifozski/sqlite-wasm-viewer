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
              updates?: { changes: any[]; lastInsertRowid: number };
          };
      };
