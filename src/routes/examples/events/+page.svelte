<script lang="ts">
	import Shgrid from '$lib/shgrid.svelte';
	import { ServerGridBuilder } from '$lib/js/ServerGridBuilder.js';
	import '$lib/default-styles.scss';
	import { env } from '$env/dynamic/public';
	import type { ContactRow } from '../../../docLib/types';

	let mapper: ServerGridBuilder<ContactRow>['mapper'] = (res: any) => {
		return {
			data: res.data,
			count: res.count,
		};
	};
	const url = `${env.PUBLIC_API_URL}/contact`;
	let builder = new ServerGridBuilder<ContactRow>({
		columns: [
			{ id: 'id', label: 'Id', hidden: true },
			{ id: 'first_name', label: 'First Name', hidden: true },
			{ id: 'last_name', label: 'Last Name', hidden: true },
			{ id: 'email', label: 'Email' },
			{
				id: 'organisation',
				label: 'Organisation',
				formatter: row =>
					`<p><strong>Name: </strong>${row?.organisation?.name}</p><p><strong>Postcode: </strong>${row?.organisation?.postcode}</p>`,
				sortable: false,
				searchable: false,
			},
			{ id: 'active', label: 'Active', hidden: true },
			{ id: 'mobile', label: 'Mobile' },
			{ id: 'postcode', label: 'Postcode', hidden: true },
		],
		url,
		mapper,
	});
</script>

<h1>Events</h1>
<p>Events have listeners that log to the console</p>
<Shgrid {builder} on:updatedSelection={e => console.log({ e })} on:cellClick={e => console.log({ e })} />
