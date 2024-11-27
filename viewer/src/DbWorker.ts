import { DbViewerWorker } from './DbViewerWorker';
import { DbWorkerInput } from './types';

const dbWorker = new DbViewerWorker();

onmessage = (message: MessageEvent<DbWorkerInput>) => {
    try {
        dbWorker.post(message);
    } catch (e) {
        if (message.data.type === 'query') {
            postMessage({
                type: 'error',
                sql: message.data.query.sql,
                errorMsg: e.toString(),
            });
        }
    }
};
