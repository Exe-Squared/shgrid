import type { Sorter, Paginator, ListenerFunc, DefaultRow, Column } from './types.js';
import { BaseGridBuilder } from './BaseGridBuilder.js';

export class ServerGridBuilder<T extends DefaultRow> extends BaseGridBuilder<T> {
	count: number;
	data: T[];
	paginator: Paginator;
	pageCount: number | undefined;
	columns: Column<T>[];
	sorters: Sorter<T>[];
	mapper: (data: unknown) => { data: T[]; count: number };
	url: URL;
	additionalFetchOptions: RequestInit;
	res: Response | undefined;
	listener?: ListenerFunc;
	loading: boolean;
	rowLink?: (row: T) => string;
	error: { code: number; message: string } | null;
	buildQueryForSorters: (searchParams: URLSearchParams, sorters: ServerGridBuilder<T>['sorters']) => void;
	buildQueryForFilters: (searchParams: URLSearchParams, filters: [keyof T, string][]) => void;
	buildQueryForOffset: (searchParams: URLSearchParams, offset: number) => void;
	buildQueryForLimit: (searchParams: URLSearchParams, limit: number) => void;
	selected?: BaseGridBuilder<T>['selected'];
	buildDataOnLoad: boolean;
	debounce: number;
	timeout: NodeJS.Timeout | null = null;

	constructor({
		columns,
		url,
		mapper,
		additionalFetchOptions,
		sorters,
		rowLink,
		limit,
		offset,
		limitOptions,
		buildQueryForFilters,
		buildQueryForSorters,
		buildQueryForOffset,
		buildQueryForLimit,
		selected,
		initialData,
		debounce,
	}: {
		columns: Column<T>[];
		url: string;
		mapper?: (data: unknown) => {
			data: ServerGridBuilder<T>['data'];
			count: number;
		};
		additionalFetchOptions?: RequestInit;
		sorters?: Sorter<T>[];
		rowLink?: ServerGridBuilder<T>['rowLink'];
		limit?: number;
		offset?: number;
		limitOptions?: number[] | null;
		buildQueryForSorters?: ServerGridBuilder<T>['buildQueryForSorters'];
		buildQueryForFilters?: ServerGridBuilder<T>['buildQueryForFilters'];
		buildQueryForOffset?: ServerGridBuilder<T>['buildQueryForOffset'];
		buildQueryForLimit?: ServerGridBuilder<T>['buildQueryForLimit'];
		selected?: ServerGridBuilder<T>['selected'];
		initialData?: { data: T[]; count: number } | Promise<{ data: T[]; count: number }>;
		debounce?: number;
	}) {
		super();
		this.columns = columns;
		this.mapper = mapper ?? (data => data as { data: T[]; count: number });
		this.paginator = {
			limit: limit ?? 15,
			offset: offset ?? 0,
			limitOptions: limitOptions ?? null,
		};
		this.url = new URL(url);
		this.data = [];
		this.count = 0;
		this.additionalFetchOptions = additionalFetchOptions ?? {};
		this.sorters = sorters ?? [];
		this.loading = true;
		this.rowLink = rowLink;
		this.error = null;
		this.selected = selected;

		this.buildQueryForSorters =
			buildQueryForSorters ?? ((searchParams, sorters) => searchParams.append('sort', JSON.stringify(sorters)));

		this.buildQueryForFilters =
			buildQueryForFilters ??
			((searchParams, filters) => searchParams.append('filters', JSON.stringify(filters)));

		this.buildQueryForOffset =
			buildQueryForOffset ?? ((searchParams, offset) => searchParams.append('offset', offset.toString()));

		this.buildQueryForLimit =
			buildQueryForLimit ?? ((searchParams, limit) => searchParams.append('limit', limit.toString()));

		this.buildDataOnLoad = initialData !== undefined;
		if (initialData !== undefined) {
			this.loading = true;
			if (initialData instanceof Promise) {
				Promise.resolve(initialData).then(val => {
					this.loading = false;
					this.data = val.data;
					this.count = val.count;
					this.triggerRender();
				});
			} else {
				this.loading = false;
				this.data = initialData.data;
				this.count = initialData.count;
				this.triggerRender();
			}
		}
		this.debounce = debounce ?? 250;
	}
	buildQueryUrl(): string {
		// clone the url so we do not mutate the original url
		const urlCopy = new URL(this.url);

		// the filters are stored inside the column values
		const filters: [keyof T, string][] = [];
		for (const column of this.columns) {
			if (column.filter === undefined || column.filter === '') continue;
			filters.push([column.id, column.filter]);
		}
		this.buildQueryForFilters(urlCopy.searchParams, filters);
		this.buildQueryForSorters(urlCopy.searchParams, this.sorters);
		this.buildQueryForOffset(urlCopy.searchParams, this.paginator.offset);
		this.buildQueryForLimit(urlCopy.searchParams, this.paginator.limit);

		const urlString = urlCopy.toString();
		// console.log({ urlString });
		return urlString;
	}
	buildData(): void {
		const innerBuildData = async () => {
			this.loading = true;
			this.triggerRender();
			try {
				this.res = await this.query(this.buildQueryUrl(), {});

				if (this.res.status >= 200 && this.res.status < 300) {
					this.error = null;
					const { data, count } = await this.res.json().then(jsonRes => this.mapper(jsonRes));
					this.data = data;
					this.count = count;
				} else {
					this.error = { code: this.res.status, message: this.res?.statusText };
				}
			} catch (e: any) {
				console.log({ e });
				this.error = {
					code: 500,
					message: this.res?.statusText ?? e.message ?? 'Unknown error occurred',
				};
			}
			this.loading = false;
			this.triggerRender();
		};
		clearTimeout(this.timeout);
		this.timeout = setTimeout(innerBuildData, this.debounce);
	}
	async query(url: string, options: any) {
		return await fetch(url, Object.assign(options, this.additionalFetchOptions));
	}
	async setPage(pageNum: number) {
		this.paginator.offset = this.paginator.limit * pageNum;
		this.buildData();
	}
}
