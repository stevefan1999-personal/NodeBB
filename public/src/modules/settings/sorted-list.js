'use strict';

define('settings/sorted-list', [
	'benchpress',
	'hooks',
	'jquery-ui/widgets/sortable',
], function (benchpress, hooks) {
	var SortedList;
	var Settings;


	SortedList = {
		types: ['sorted-list'],
		use: function () {
			Settings = this;
		},
		set: function ($container, values) {
			var key = $container.attr('data-sorted-list');

			values[key] = [];
			$container.find('[data-type="item"]').each(function (idx, item) {
				var itemUUID = $(item).attr('data-sorted-list-uuid');

				var formData = Settings.helper.serializeForm($('[data-sorted-list-object="' + key + '"][data-sorted-list-uuid="' + itemUUID + '"]'));
				stripTags(formData);
				values[key].push(formData);
			});
		},
		get: function ($container, hash) {
			var $list = $container.find('[data-type="list"]');
			var key = $container.attr('data-sorted-list');
			var formTpl = $container.attr('data-form-template');

			benchpress.render(formTpl, {}).then(function (formHtml) {
				var addBtn = $('[data-sorted-list="' + key + '"] [data-type="add"]');

				addBtn.on('click', function () {
					var modal = bootbox.confirm(formHtml, function (save) {
						if (save) {
							SortedList.addItem(modal.find('form').children(), $container);
						}
					});
				});

				var call = $container.parents('form').attr('data-socket-get');
				var list = ajaxify.data[call ? hash : 'settings'][key];

				if (Array.isArray(list) && typeof list[0] !== 'string') {
					list.forEach(function (item) {
						var itemUUID = utils.generateUUID();
						var form = $(formHtml).deserialize(item);
						form.attr('data-sorted-list-uuid', itemUUID);
						form.attr('data-sorted-list-object', key);
						$('#content').append(form.hide());

						parse($container, itemUUID, item).then(() => {
							hooks.fire('action:settings.sorted-list.loaded', { element: $list.get(0) });
						});
					});
				}
			});

			$list.sortable().addClass('pointer');
		},
		addItem: function ($formElements, $target) {
			const key = $target.attr('data-sorted-list');
			const itemUUID = utils.generateUUID();
			const form = $('<form class="" data-sorted-list-uuid="' + itemUUID + '" data-sorted-list-object="' + key + '"></form>');
			form.append($formElements);

			$('#content').append(form.hide());

			const data = Settings.helper.serializeForm(form);
			parse($target, itemUUID, data);
		},
	};

	function setupRemoveButton($container, itemUUID) {
		var removeBtn = $container.find('[data-sorted-list-uuid="' + itemUUID + '"] [data-type="remove"]');
		removeBtn.on('click', function () {
			$('[data-sorted-list-uuid="' + itemUUID + '"]').remove();
		});
	}

	function setupEditButton($container, itemUUID) {
		var $list = $container.find('[data-type="list"]');
		var key = $container.attr('data-sorted-list');
		var itemTpl = $container.attr('data-item-template');
		var editBtn = $('[data-sorted-list-uuid="' + itemUUID + '"] [data-type="edit"]');

		editBtn.on('click', function () {
			var form = $('[data-sorted-list-uuid="' + itemUUID + '"][data-sorted-list-object="' + key + '"]').clone(true).show();

			var modal = bootbox.confirm(form, function (save) {
				if (save) {
					var form = $('<form class="" data-sorted-list-uuid="' + itemUUID + '" data-sorted-list-object="' + key + '"></form>');
					form.append(modal.find('form').children());

					$('#content').find('[data-sorted-list-uuid="' + itemUUID + '"][data-sorted-list-object="' + key + '"]').remove();
					$('#content').append(form.hide());


					var data = Settings.helper.serializeForm(form);
					stripTags(data);

					app.parseAndTranslate(itemTpl, data, function (itemHtml) {
						itemHtml = $(itemHtml);
						var oldItem = $list.find('[data-sorted-list-uuid="' + itemUUID + '"]');
						oldItem.after(itemHtml);
						oldItem.remove();
						itemHtml.attr('data-sorted-list-uuid', itemUUID);

						setupRemoveButton($container, itemUUID);
						setupEditButton($container, itemUUID);
					});
				}
			});
		});
	}

	function parse($container, itemUUID, data) {
		var $list = $container.find('[data-type="list"]');
		var itemTpl = $container.attr('data-item-template');

		stripTags(data);

		return new Promise((resolve) => {
			app.parseAndTranslate(itemTpl, data, function (itemHtml) {
				itemHtml = $(itemHtml);
				$list.append(itemHtml);
				itemHtml.attr('data-sorted-list-uuid', itemUUID);

				setupRemoveButton($container, itemUUID);
				setupEditButton($container, itemUUID);
				resolve();
			});
		});
	}

	function stripTags(data) {
		return Object.entries(data || {}).forEach(([field, value]) => {
			data[field] = utils.stripHTMLTags(value, utils.stripTags);
		});
	}

	return SortedList;
});
