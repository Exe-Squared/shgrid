import { ServerGridBuilder, Shgrid } from '../../index.js';

const wrapper = document.getElementById('wrapper');
if (wrapper == null) throw Error('missing wrapper');
const url = 'https://api.shgrid.dev/contact';

/**@typedef {{id: string, email: string, first_name: string, last_name: string}} Row */
/** @type {ServerGridBuilder<Row>} */
const builder = new ServerGridBuilder({
	columns: [
		{ id: 'id', label: 'Id', hidden: true },
		{ id: 'first_name', label: 'First Name' },
		{ id: 'last_name', label: 'Last Name' },
		{ id: 'email', label: 'Email' },
	],
	url,
	mapper: res => ({
		data: res.data,
		count: res.count,
	}),
	rowLink: row => `${url}/${row.id}`,
	selected: new Map(),
	limitOptions: [5, 10, 15, 25, 50],
});

const shgrid = new Shgrid({
	target: wrapper,
	props: {
		builder,
	},
});
shgrid.$on('updatedSelection', e => setSelectionWrapper(e.detail));
// shgrid.addEventListener('selectionUpdated', (e)=>console.log(e));
const selectionWrapper = document.getElementById('selection-wrapper');
if (selectionWrapper === null) throw Error('missing selection wrapper');

/**
 * Renders the selected data in a list
 * @type {(selected: Map<string | number, Row>)=>void} selected
 **/
const setSelectionWrapper = selected => {
	let innerHtml = '<ul>';

	for (const [_, row] of selected) innerHtml += `<li>${row.first_name} ${row.last_name}</li>`;

	innerHtml += '</ul>';
	selectionWrapper.innerHTML = innerHtml;
};
