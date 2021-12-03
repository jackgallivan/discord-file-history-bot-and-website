// TABLE FILTERS

// tablefilter object in global scope, for access by other functions.
let tf
document.addEventListener('DOMContentLoaded', addFilters)

function addFilters() {
	const data_table = document.querySelector('table')
	tf = new TableFilterClass(data_table)
	tf.addTableFilter()
}

// Creating a tablefilter class
class TableFilterClass {
	constructor(tbl) {
		this.table = tbl
		this.tf = this.createTableFilter()
	}

	createTableFilter() {
		// Adds filter and sorting functionality to the given DOM table element.

		// Create filter config for the given table
		const filterConfig = {
			base_path: '/tablefilter/',
			// Filter types:
			col_0: 'checklist', // Channel
			col_1: 'checklist', // Username
			col_2: 'input', // Date
			col_3: 'checklist', // File Type
			col_4: 'input', // File Name
			col_5: 'none', // Preview
			// Data types, used for column sorting:
			col_types: [
				'string',
				'string',
				{type: 'date', locale: 'en-US'},
				'string',
				'string',
				'none',
			],
			popup_filters: {
				image_active: '/tablefilter/style/themes/custom/icn_filter_black.png',
				image: '/tablefilter/style/themes/custom/icn_filter_white.png',
			},
			paging: {
				results_per_page: ['Results per page: ', [10, 25, 50, 100]],
			},
			extensions: [{name: 'sort'}],
			btn_reset: {
				text: 'Clear Filters',
			},
			help_instructions: {
				text:
					'Click the headers cells to sort the data.<br><br>' +
					'Use the drop-down menus to filter by individual values.<br>',
				btn_text: 'Help',
				load_filters_on_demand: true,
				themes: [
					{
						name: 'transparent',
					},
				],
			},
		}

		// Create the filter using the above config
		tf = new TableFilter(this.table, filterConfig)
		return tf
	}

	addTableFilter() {
		// Initialize the table filter
		this.tf.init()
	}
}
