const viewer = document.createElement('div');
// viewer.style..add('viewer-container');

export function showViewer() {
    document.body.appendChild(viewer);
}

export function hideViewer() {
    document.body.removeChild(viewer);
}
