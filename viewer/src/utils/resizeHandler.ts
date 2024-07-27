export function createResizeHandler(
    leftEl: HTMLElement,
    rightEl: HTMLElement,
    resizeLeft: boolean,
    containerEl: HTMLDivElement
): HTMLDivElement {
    let isDragging = false;
    let initialWidth = 0;
    let initialXPos = 0;
    let lastWidth: number | undefined;

    const controlledEl = resizeLeft ? leftEl : rightEl;

    const storageWidthKey = `sqlite-wasm-viewer_${controlledEl.id}`;

    const resizeHandlerEl = document.createElement('div');
    resizeHandlerEl.className = 'resizeDragHandler';

    const storedWidthStr = localStorage.getItem(storageWidthKey) as
        | string
        | null;
    if (storedWidthStr) {
        controlledEl.style.width = `${+storedWidthStr}px`;
    }

    resizeHandlerEl.addEventListener('dblclick', () => {
        controlledEl.style.width = '';

        localStorage.removeItem(storageWidthKey);
    });

    resizeHandlerEl.addEventListener('mousedown', (event) => {
        isDragging = true;

        containerEl.style.userSelect = 'none';

        initialXPos = event.x;
        initialWidth = controlledEl.offsetWidth;
        lastWidth = undefined;
    });

    document.addEventListener('mousemove', (event) => {
        if (isDragging) {
            event.preventDefault();
            event.stopPropagation();

            const newWidth = resizeLeft
                ? initialWidth - initialXPos + event.clientX
                : initialWidth + initialXPos - event.clientX;

            lastWidth = Math.max(newWidth, 0);

            controlledEl.style.width = `${lastWidth}px`;
        }
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;

        containerEl.style.userSelect = 'auto';

        if (lastWidth) {
            localStorage.setItem(storageWidthKey, lastWidth.toString());
        }
    });

    return resizeHandlerEl;
}
