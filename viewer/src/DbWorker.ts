import { DbViewerWorker } from './DbViewerWorker';
import { DbWorkerInput } from './types';

const dbWorker = new DbViewerWorker();

onmessage = (message: MessageEvent<DbWorkerInput>) => {
    dbWorker.post(message);
};
