// TABLE FILTERS

// tablefilter object in global scope, for access by other functions.
let tf
document.addEventListener('DOMContentLoaded', addFilters)

function addFilters() {
	const data_table = document.querySelector('table')
	console.log(data_table)
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

		// Get the table header elements
		const tableHeaders = this.table.querySelector('tr').children
		// Determine num columns, and num that house buttons (header textContent = 'Update' or 'Delete').
		const numCols = tableHeaders.length

		// Create filter config for the given table
		const filterConfig = {
			base_path: '/tablefilter/',
			// Filter types:
			col_0: 'checklist',		// Channel
			col_1: 'checklist',		// Username
			col_2: 'input',				// Date
			col_3: 'checklist',		// File Type
			col_4: 'input',				// File Name
			col_5: 'none',				// Preview
			// Data types, used for column sorting:
			col_types: [
				'string',
				'string',
				{type: 'date', locale: 'en-US'},
				'string',
				'string',
				'none'
			],
			col_widths: ['150px', '150px', '100px', '120px', '300px', '250px'],
			popup_filters: true,
			paging: {
				results_per_page: ['Results per page: ', [10, 25, 50, 100]]
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
				load_filters_on_demand: true
			},
		}

		// Create the filter using thte config, and return it
		tf = new TableFilter(this.table, filterConfig)
		return tf
	}

	addTableFilter() {
		// Initializee the table filter
		this.tf.init()
	}

	refreshFilters() {
		// Refresh table filter dropdowns
		const feature = this.tf.feature('dropdown')
		feature.refreshAll()
	}
}
