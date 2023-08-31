interface Config {
    width: number;
    height: number;
    totalRows: number;
    itemHeight: number;
    container: HTMLElement;
    contentRoot: HTMLElement;
    generatorFn: (index: number) => HTMLElement | null;
}

export class ListVirtualizer {
    private height: number;

    private itemHeight: number;

    private totalRows: number;

    private container: HTMLElement;

    private contentRoot: HTMLElement;

    private lastRepaintY: number;

    private screenItemsLen: number;

    private scrollTop: number;

    private generatorFn: (index: number) => HTMLElement | null;

    constructor(config: Config) {
        this.height = config.height;
        this.itemHeight = config.itemHeight;

        this.lastRepaintY = 0;

        this.scrollTop = 0;

        this.generatorFn = config.generatorFn;
        this.totalRows = config.totalRows;

        this.container = config.container;
        this.contentRoot = config.contentRoot;

        this.renderChunk(0);

        this.container.addEventListener('scroll', this.handleScroll.bind(this));
    }

    handleScroll(e: MouseEvent) {
        const { scrollTop } = e.target as HTMLElement;

        this.scrollTop = scrollTop;
        const screenItemsLen = Math.ceil(this.height / this.itemHeight);
        const maxBuffer = this.screenItemsLen * this.itemHeight;
        let first = Math.ceil(scrollTop / this.itemHeight - screenItemsLen);
        first = first < 0 ? 0 : first;
        if (
            !this.lastRepaintY ||
            Math.abs(scrollTop - this.lastRepaintY) > maxBuffer
        ) {
            this.renderChunk(first);
            this.lastRepaintY = scrollTop;
        }

        e.preventDefault();
    }

    renderChunk(fromPos: number) {
        this.screenItemsLen = Math.ceil(this.height / this.itemHeight);

        // Cache 4 times the number of items that fit in the container viewport
        const cachedItemsLen = this.screenItemsLen * 3;

        const fragment = document.createDocumentFragment();

        let itemCount = fromPos + cachedItemsLen;
        if (itemCount > this.totalRows) {
            itemCount = this.totalRows;
        }

        if (fromPos > 0) {
            const offsetterRowEl = document.createElement('tr');
            const offsetterEl = document.createElement('td');
            offsetterEl.style.height = `${fromPos * this.itemHeight}px`;
            offsetterRowEl.appendChild(offsetterEl);

            fragment.appendChild(offsetterRowEl);
        }

        for (let i = fromPos; i < itemCount; i++) {
            const item = this.generatorFn(i);

            if (!item) {
                break;
            }

            fragment.appendChild(item);
        }

        if (itemCount < this.totalRows) {
            const bottomOffsetterRow = document.createElement('tr');
            const offsetterEl = document.createElement('td');
            offsetterEl.style.height = `${
                (this.totalRows - itemCount) * this.itemHeight
            }px`;
            bottomOffsetterRow.appendChild(offsetterEl);

            fragment.appendChild(bottomOffsetterRow);
        }

        this.contentRoot.innerHTML = '';
        this.contentRoot.appendChild(fragment);
    }

    public setRowCount(rowCount: number) {
        this.totalRows = rowCount;

        let first = Math.ceil(
            this.scrollTop / this.itemHeight - this.screenItemsLen
        );
        first = first < 0 ? 0 : first;

        this.renderChunk(first);
    }
}
