/*
 * Copyright 2023-present MysticEggs Co. All rights reserved.
 */

// import { DbWorkerInput } from '@mysticeggs/shared';
import { DbViewerWorker } from './DbViewerWorker';
import { DbWorkerInput } from './types';

const dbWorker = new DbViewerWorker();

onmessage = (message: MessageEvent<DbWorkerInput>) => {
    dbWorker.post(message);
};
