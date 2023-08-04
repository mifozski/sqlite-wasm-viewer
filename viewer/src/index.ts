const viewer = document.createElement('div');
// viewer.style..add('viewer-container');

export function showViewer(): void {
    document.body.appendChild(viewer);
}

function hideViewer(): void {
    document.body.removeChild(viewer);
}
