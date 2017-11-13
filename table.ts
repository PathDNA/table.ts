import * as utils from "node_modules/utils/utils";

export class Table {
	private e: HTMLElement;
	private header: HTMLElement;
	private content: HTMLElement;

	private cols: Column[];
	private rows: Row[];
	private numCols: number;

	constructor(target: parent, ...cols: Column[]) {
		this.e = document.createElement("table-container");
		this.header = document.createElement("table-header");
		this.content = document.createElement("table-content");
		this.cols = new Array();
		this.rows = new Array();
		this.numCols = cols.length;

		this.setHeader(cols);

		this.e.appendChild(this.header);
		this.e.appendChild(this.content);
		target.appendChild(this.e);
	}

	private setHeader(cols: Column[]) {
		const hr = new Row(this.header, 0, null);
		cols.forEach((c: Column) => {
			this.cols.push(c)
			const kv = new KeyValue(c.Title(), c.Title());
			hr.Push(kv, c);
		});
	}

	Push(kvs: KeyValue[], onClick: CallbackFn | null) {
		if (kvs.length !== this.numCols) {
			console.error("invalid number of columns");
			return
		}

		const cs: Cell[] = new Array();
		const ri = this.rows.length;
		const r = new Row(this.content, ri, onClick);

		kvs.forEach((kv: KeyValue, i: number) => {
			const col = this.cols[i];
			r.Push(kv, col)
		});

		this.rows.push(r);
	}

	Clear() {
		while (this.rows.length > 0) {
			const r = this.rows.pop();
			if (!r) {
				continue;
			}

			r.Close();
		}
	}
}

export class Column {
	private title: string;
	private width: number;

	constructor(title: string, width: number) {
		this.title = title;
		this.width = width;
	}

	Title() {
		return this.title;
	}

	Width() {
		return this.width;
	}
}

class Row {
	private e: HTMLElement | null;
	private i: number;
	private cs: Cell[];
	private fn: CallbackFn | null;

	constructor(target: parent, i: number, onClick: CallbackFn | null) {
		this.e = document.createElement("table-row");
		this.i = i;
		this.cs = new Array();
		this.fn = onClick;

		if (!!this.fn) {
			this.e.addEventListener("click", this.fn);
		}

		target.appendChild(this.e);
	}

	Push(kv: KeyValue, col: Column) {
		if (this.e === null) {
			return;
		}

		const coords = new Coords(this.i, this.cs.length);
		const cell = new Cell(this.e, kv, coords, col.Width());
		this.cs.push(cell);
	}

	Close() {
		if (this.e === null) {
			return;
		}

		while (this.cs.length > 0) {
			const c = this.cs.pop();
			if (!c) {
				continue;
			}

			c.Close();
		}

		utils.RemoveElement(this.e);
		this.e = null;
	}
}

export class Cell {
	private e: HTMLElement | null;
	private kv: KeyValue;
	private coords: Coords;
	private width: number;

	constructor(target: parent, kv: KeyValue, coords: Coords, width: number) {
		this.e = document.createElement("table-cell");
		this.kv = kv;
		this.coords = coords;
		this.width = width;

		this.e.textContent = this.kv.Key();
		this.e.style.width = width + "px";
		target.appendChild(this.e);
	}

	Close() {
		if (this.e === null) {
			return;
		}

		utils.RemoveElement(this.e);
		this.e = null;
	}
}

export class Coords {
	Row: number;
	Column: number;

	constructor(row: number, column: number) {
		this.Row = row;
		this.Column = column
	}
}

export class KeyValue {
	private key: string;
	private value: any;

	constructor(key: string, value: any) {
		this.key = key;
		this.value = value;
	}

	Key() {
		return this.key;
	}

	Value() {
		return this.value;
	}
}

interface parent {
	appendChild(e: HTMLElement): void
}

export type CallbackFn = () => void;