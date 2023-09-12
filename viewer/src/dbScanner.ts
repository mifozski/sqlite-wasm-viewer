export async function collectDbFiles(
    isSqliteDatabase: (fileName: string) => boolean
): Promise<string[]> {
    if (!navigator.storage) {
        // eslint-disable-next-line no-console
        console.error('navigator.storage is not available in this context');
        return [];
    }

    const root = await navigator.storage.getDirectory();

    const dbFileHandlers = await getDbFiles(root, isSqliteDatabase);

    return Promise.all(
        dbFileHandlers.map((dbFile) => {
            return root.resolve(dbFile).then((parts) => parts?.join('/') || '');
        })
    );
}

async function getDbFiles(
    root: FileSystemDirectoryHandle,
    isSqliteDatabase: (fileName: string) => boolean
): Promise<FileSystemFileHandle[]> {
    let dbs: FileSystemFileHandle[] = [];

    for await (const handle of root.values()) {
        const child = handle;

        if (child.kind === 'directory') {
            const childDbs = await getDbFiles(child, isSqliteDatabase);
            dbs = dbs.concat(dbs, ...childDbs);
        } else if (isSqliteDatabase(child.name)) {
            dbs.push(child);
        }
    }

    return dbs;
}
