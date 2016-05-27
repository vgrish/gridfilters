/****** gridfilters *********

 $controller->addCss($this->config['jsUrl'] . 'mgr/gridfilters/css/filters.grid.css');
 $controller->addCss($this->config['jsUrl'] . 'mgr/gridfilters/css/menu.range.css');

 $controller->addJavascript($this->config['jsUrl'] . 'mgr/gridfilters/menu/range.menu.js');
 $controller->addJavascript($this->config['jsUrl'] . 'mgr/gridfilters/menu/list.menu.js');
 $controller->addJavascript($this->config['jsUrl'] . 'mgr/gridfilters/filters.grid.js');

 $controller->addJavascript($this->config['jsUrl'] . 'mgr/gridfilters/filter/filter.js');
 $controller->addJavascript($this->config['jsUrl'] . 'mgr/gridfilters/filter/boolean.filter.js');
 $controller->addJavascript($this->config['jsUrl'] . 'mgr/gridfilters/filter/date.filter.js');
 $controller->addJavascript($this->config['jsUrl'] . 'mgr/gridfilters/filter/list.filter.js');
 $controller->addJavascript($this->config['jsUrl'] . 'mgr/gridfilters/filter/numeric.filter.js');
 $controller->addJavascript($this->config['jsUrl'] . 'mgr/gridfilters/filter/string.filter.js');

****** gridfilters *********/
example.grid.Items = function (config) {
	config = config || {};

	this.exp = new Ext.grid.RowExpander({
		expandOnDblClick: false,
		enableCaching: false,
		tpl: new Ext.XTemplate(
			'<tpl for=".">',

			'<table class="example-expander"><tbody>',

			'<tr>',
			'<tpl if="article">',
			'<td><b>' + _('example_article') + ': </b>{article}</td>',
			'</tpl>',
			'<tpl if="unique">',
			'<td><b>' + _('example_unique') + ': </b>{unique}</td>',
			'</tpl>',
			'</tr>',

			'<tr>',
			'<td><b>' + _('example_price') + ': </b>{price:this.renderPrice}</td>',
			'<td><b>' + _('example_weight') + ': </b>{weight:this.renderWeight}</td>',
			'</tr>',

			'<tpl if="brend">',
			'<tr>',
			'<td><b>' + _('example_brend') + ': </b>{brend}</td>',
			'</tr>',
			'</tpl>',

			'<tpl if="description">',
			'<tr>',
			'<td><b>' + _('example_description') + ': </b>{description}</td>',
			'</tr>',
			'</tpl>',

			' </tbody></table>',

			'</tpl>',
			{
				compiled: true,
				renderPrice: function (value, record) {
					return example.tools.renderPrice(value);
				},
				renderWeight: function (value, record) {
					return example.tools.renderWeight(value);
				}
			}
		)
	});

	this.exp.on('beforeexpand', function (rowexpander, record, body, rowIndex) {
		record['data']['json'] = record['json'];
		record['data'] = Ext.applyIf(record['data'], record['json']);
		return true;
	});

	this.dd = function (grid) {
		this.dropTarget = new Ext.dd.DropTarget(grid.container, {
			ddGroup: 'dd',
			copy: false,
			notifyDrop: function (dd, e, data) {
				var store = grid.store.data.items;
				var target = store[dd.getDragData(e).rowIndex].id;
				var source = store[data.rowIndex].id;
				if (target != source) {
					dd.el.mask(_('loading'), 'x-mask-loading');
					MODx.Ajax.request({
						url: example.config.connector_url,
						params: {
							action: config.action || 'mgr/item/sort',
							source: source,
							target: target
						},
						listeners: {
							success: {
								fn: function (r) {
									dd.el.unmask();
									grid.refresh();
								},
								scope: grid
							},
							failure: {
								fn: function (r) {
									dd.el.unmask();
								},
								scope: grid
							}
						}
					});
				}
			}
		});
	};

	this.sm = new Ext.grid.CheckboxSelectionModel();


	/****** gridfilters *********/
	this.filters = new Ext.ux.grid.GridFilters({
		menuFilterText : _('example_filter'),
		filters: this.getFilters(config)
	});
	/****** gridfilters *********/

	Ext.applyIf(config, {
		id: 'example-grid-items',
		url: example.config.connector_url,
		baseParams: {
			action: 'mgr/item/getlist',
			parent: config.parent || 0,
			sort: 'menuindex',
			dir: 'asc'
		},
		save_action: 'mgr/item/updatefromgrid',
		autosave: true,
		save_callback: this._updateRow,
		fields: this.getFields(config),
		columns: this.getColumns(config),
		tbar: this.getTopBar(config),
		listeners: this.getListeners(config),

		sm: this.sm,

		/****** gridfilters *********/
		plugins: [this.exp, this.filters],
		/****** gridfilters *********/

		ddGroup: 'dd',
		enableDragDrop: true,

		paging: true,
		pageSize: 10,
		remoteSort: true,
		viewConfig: {
			forceFit: true,
			enableRowBody: true,
			autoFill: true,
			showPreview: true,
			scrollOffset: 0
		},
		autoHeight: true,
		cls: 'example-grid',
		bodyCssClass: 'grid-with-buttons',
		stateful: true,
		stateId: 'example-grid-items'
	});
	example.grid.Items.superclass.constructor.call(this, config);
	this.exp.addEvents('beforeexpand', 'beforecollapse');

};
Ext.extend(example.grid.Items, MODx.grid.Grid, {
	windows: {},

	getFields: function (config) {
		var fields = example.config.grid_item_fields;

		return fields;
	},


	/****** gridfilters *********/
	getFilters: function (config) {
		var filters = [];

		var columns = this.getColumns(config);
		columns.filter(function (column) {
			if (!!column['dataIndex'] && !column['noFilter']) {

				var add = {
					dataIndex: column['dataIndex'],
					disabled: column['disabled'] || column['noFilter'] || false,
				};

				Ext.applyIf(add, {
					type: 'string'
				});
				filters.push(add);
			}
		});

		return filters;
	},
	/****** gridfilters *********/


	getTopBar: function (config) {
		var tbar1 = [];
		var tbar2 = [];

		var component1 = ['menu', 'update', 'left', 'parent', 'search', 'spacer'];
		var component2 = ['check3'];

		if (!!config.compact) {
			component1.remove('parent');
		}


		var add = {
			menu: {
				text: '<i class="icon icon-cogs"></i> ',
				menu: [{
					text: '<i class="icon icon-plus"></i> ' + _('example_action_create'),
					cls: 'example-cogs',
					handler: this.create,
					scope: this
				}, {
					text: '<i class="icon icon-trash-o red"></i> ' + _('example_action_remove'),
					cls: 'example-cogs',
					handler: this.remove,
					scope: this
				}, '-', {
					text: '<i class="icon icon-toggle-on green"></i> ' + _('example_action_turnon'),
					cls: 'example-cogs',
					handler: this.publish,
					scope: this
				}, {
					text: '<i class="icon icon-toggle-off red"></i> ' + _('example_action_turnoff'),
					cls: 'example-cogs',
					handler: this.unpublish,
					scope: this
				}]
			},
			update: {
				text: '<i class="icon icon-refresh"></i>',
				handler: this._updateRow,
				scope: this
			},
			left: '->',

			parent: {
				xtype: 'example-combo-resource',
				name: 'parent',
				emptyText: _('example_parent'),
				width: 190,
				custm: true,
				clear: true,
				addall: true,
				value: '',
				listeners: {
					select: {
						fn: this._filterByCombo,
						scope: this
					},
					afterrender: {
						fn: this._filterByCombo,
						scope: this
					}
				}
			},
			search: {
				xtype: 'example-field-search',
				width: 190,
				listeners: {
					search: {
						fn: function (field) {
							this._doSearch(field);
						},
						scope: this
					},
					clear: {
						fn: function (field) {
							field.setValue('');
							this._clearSearch();
						},
						scope: this
					}
				}
			},

			spacer: {
				xtype: 'spacer',
				style: 'width:1px;'
			}
		};

		component1.filter(function (item) {
			if (add[item]) {
				tbar1.push(add[item]);
			}
		});

		component2.filter(function (item) {
			if (add[item]) {
				tbar2.push(add[item]);
			}
		});

		var items = [];
		if (tbar1.length > 0) {
			items.push(new Ext.Toolbar(tbar1));
		}
		if (tbar2.length > 0) {
			items.push(new Ext.Panel({items: tbar2}));
		}

		return new Ext.Panel({items: items});
	},

	getColumns: function (config) {
		var columns = [this.exp, this.sm];
		var add = {
			id: {
				width: 10,
				hidden: true,
				sortable: true
			},
			pagetitle: {
				width: 25,
				sortable: true,
				editor: {
					xtype: 'textfield',
					allowBlank: false
				},
				/*renderer: function(value, metaData, record) {
				 return example.tools.actionUrl(record.get('id'), 'item_update', record.get('pagetitle'));
				 }*/
			},
			article: {
				width: 15,
				sortable: true,
				editor: {
					xtype: 'textfield',
					allowBlank: true
				}
			},
			unique: {
				width: 15,
				sortable: true,
				editor: {
					xtype: 'textfield',
					allowBlank: false
				}
			},
			price: {
				width: 15,
				sortable: true,
				editor: {
					xtype: 'numberfield',
					allowNegative: false,
					allowDecimals: true,
					decimalPrecision: 2,
					allowBlank: true
				},
				renderer: function (value, metaData, record) {
					return example.tools.renderPrice(value);
				}
			},
			weight: {
				width: 15,
				sortable: true,
				editor: {
					xtype: 'numberfield',
					allowNegative: false,
					allowDecimals: true,
					decimalPrecision: 2,
					allowBlank: true
				},
				renderer: function (value, metaData, record) {
					return example.tools.renderWeight(value);
				}
			},
			brend: {
				width: 15,
				sortable: true,
				editor: {
					xtype: 'textfield',
					allowBlank: true
				}
			},
			menuindex: {
				width: 15,
				sortable: true,
				editor: {
					xtype: 'numberfield',
					decimalPrecision: 0,
					allowBlank: true
				}
			},
			thumb: {
				width: 5,
				sortable: false,
				/****** gridfilters *********/
				noFilter: true,
				/****** gridfilters *********/
				id: 'example-thumb',
				renderer: function(value, metaData, record){
					return example.tools.imageUrl(value, record.get('source'), record.get('pagetitle'));
				}
			},
			actions: {
				width: 25,
				sortable: false,
				/****** gridfilters *********/
				noFilter: true,
				/****** gridfilters *********/
				id: 'actions',
				renderer: example.tools.renderActions,

			}
		};

		var fields = this.getFields();
		fields.filter(function (field) {
			if (add[field]) {
				Ext.applyIf(add[field], {
					header: _('example_header_' + field),
					tooltip: _('example_tooltip_' + field),
					dataIndex: field
				});
				columns.push(add[field]);
			}
		});

		return columns;
	},

	getListeners: function (config) {
		return {
			render: {
				fn: this.dd,
				scope: this
			}
		};
	},

	getMenu: function (grid, rowIndex) {
		var ids = this._getSelectedIds();
		var row = grid.getStore().getAt(rowIndex);
		var menu = example.tools.getMenu(row.data['actions'], this, ids);
		this.addContextMenuItem(menu);
	},


	onClick: function (e) {
		var elem = e.getTarget();
		if (elem.nodeName == 'BUTTON') {
			var row = this.getSelectionModel().getSelected();
			if (typeof(row) != 'undefined') {
				var action = elem.getAttribute('action');
				if (action == 'showMenu') {
					var ri = this.getStore().find('id', row.id);
					return this._showMenu(this, ri, e);
				} else if (typeof this[action] === 'function') {
					this.menu.record = row.data;
					return this[action](this, e);
				}
			}
		}
		return this.processEvent('click', e);
	},


	setAction: function (method, field, value) {
		var ids = this._getSelectedIds();
		if (!ids.length && (field !== 'false')) {
			return false;
		}
		MODx.Ajax.request({
			url: example.config.connector_url,
			params: {
				action: 'mgr/item/multiple',
				method: method,
				field_name: field,
				field_value: value,
				ids: Ext.util.JSON.encode(ids)
			},
			listeners: {
				success: {
					fn: function () {
						this.refresh();
					},
					scope: this
				},
				failure: {
					fn: function (response) {
						MODx.msg.alert(_('error'), response.message);
					},
					scope: this
				}
			}
		})
	},

	remove: function () {
		Ext.MessageBox.confirm(
			_('example_action_remove'),
			_('example_confirm_remove'),
			function (val) {
				if (val == 'yes') {
					this.setAction('remove');
				}
			},
			this
		);
	},


	publish: function (btn, e) {
		this.setAction('setproperty', 'published', 1);
	},

	unpublish: function (btn, e) {
		this.setAction('setproperty', 'published', 0);
	},

	create: function (btn, e) {
		var record = {
			published: 1,
			createdby: MODx.config.user || 0,
			updatedby: MODx.config.user || 0,
			parent: this.config.parent || MODx.config.site_start,
		};

		var w = MODx.load({
			xtype: 'example-window-item-update',
			action: 'mgr/item/create',
			record: record,
			class: this.config.class,
			listeners: {
				success: {
					fn: function () {
						this.refresh();
					}, scope: this
				}
			}
		});
		w.reset();
		w.setValues(record);
		w.show(e.target);
	},

	update: function (btn, e, row) {
		if (typeof(row) != 'undefined') {
			this.menu.record = row.data;
		}
		else if (!this.menu.record) {
			return false;
		}
		var id = this.menu.record.id;
		MODx.Ajax.request({
			url: this.config.url,
			params: {
				action: 'mgr/item/get',
				id: id
			},
			listeners: {
				success: {
					fn: function (r) {
						var record = r.object;
						var w = MODx.load({
							xtype: 'example-window-item-update',
							title: _('example_action_update'),
							action: 'mgr/item/update',
							record: record,
							update: true,
							listeners: {
								success: {
									fn: this.refresh,
									scope: this
								}
							}
						});
						w.reset();
						w.setValues(record);
						w.show(e.target);
					}, scope: this
				}
			}
		});
	},

	_filterByCombo: function (cb) {
		this.getStore().baseParams[cb.name] = cb.value;
		this.getBottomToolbar().changePage(1);
	},

	_doSearch: function (tf) {
		this.getStore().baseParams.query = tf.getValue();
		this.getBottomToolbar().changePage(1);
	},

	_clearSearch: function () {
		this.getStore().baseParams.query = '';
		this.getBottomToolbar().changePage(1);
	},

	_updateRow: function () {
		this.refresh();
	},

	_getSelectedIds: function () {
		var ids = [];
		var selected = this.getSelectionModel().getSelections();

		for (var i in selected) {
			if (!selected.hasOwnProperty(i)) {
				continue;
			}
			ids.push(selected[i]['id']);
		}

		return ids;
	}

});
Ext.reg('example-grid-items', example.grid.Items);
