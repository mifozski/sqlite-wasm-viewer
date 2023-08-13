import { showViewer } from 'sqlite-wasm-viewer';

const importDbBtn = document.getElementById(
    'import_db_btn'
) as HTMLButtonElement;

importDbBtn.onclick = async () => {
    const [handle] = await window.showOpenFilePicker();
    if (!handle) {
        return;
    }

    const root = await navigator.storage.getDirectory();

    const targetFile = await root.getFileHandle('ImportedDB.db', {
        create: true,
    });

    const file = await handle.getFile();

    const writable = await targetFile.createWritable();

    writable.write(await file.arrayBuffer());

    writable.close();
};

const showViewerBtn = document.getElementById(
    'show_viewer_btn'
) as HTMLButtonElement;

// showViewerBtn.onclick = () => {
showViewer();
// };
