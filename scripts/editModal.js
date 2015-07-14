var editModal = {};
editModal.div = null;
editModal.modal_id = 'edit-modal';
editModal.labelTemplate = '<label></label>'
editModal.inputWrapperTemplate = '<div class="form-group"></div>';

editModal.open = function(div_class) {
	self.div = $('.'+div_class);
	if (self.div.length <= 0) {
		return;
	}
	this.emptyForm();
	this.addSubjectInputToForm();
	this.addInputsToForm();
	this.bindSaveButton();
	$('#'+editModal.modal_id).modal();
}

editModal.bindSaveButton = function() {
	$('#'+editModal.modal_id+' button.submit-form').off('click.subm-ajax').on('click.subm-ajax', function(e){
		e.preventDefault();
		var updater = {};
		updater.subject = $('#'+editModal.modal_id+' form.updater input[name="subject"]').val();
		updater.author = "John Doe";
		updater.time = Math.floor(Date.now() / 1000);
		updater.predicates = {};
		$.each($('#'+editModal.modal_id+' form.updater input'), function(index, input) {
			 var $jqInput = $(input);
			 if ($jqInput.attr('name') != 'subject') {
			 	updater.predicates[$jqInput.attr('name')] = {
			 		'object' : $jqInput.val(),
			 		'oldObject' : $jqInput.attr('data-old-value'),
			 	};
			 }
		});
		$.ajax({
			url: $('#'+editModal.modal_id+' form.updater').attr('action'),
			type: 'get',
			data: {updater: updater},
		})
		.always(function() {
			$('#'+editModal.modal_id).modal('hide');
		});
	});
}

editModal.emptyForm = function() {
	$('#'+editModal.modal_id+' form.updater').html('');
	return;
}

editModal.addSubjectInputToForm = function() {
	$('#'+editModal.modal_id+' form.updater').append(editModal.getInputHidden('subject', self.div.attr('data-id')));
	return;
}

editModal.addInputsToForm = function() {
	var $elems = self.div.find('[data-name]');
	$.each($elems, function(key, elem){
		var $jqElem = $(elem);
		var $input = editModal.getInput($jqElem.attr('data-type'), $jqElem.attr('data-name'), $jqElem.attr('data-value'), $jqElem.attr('data-misc'));
		var $label = undefined;
		if (typeof $jqElem.attr('data-label-text') !== 'undefined') {
			$label = editModal.getLabel($jqElem.attr('data-label-text'));
		}
		$('#'+editModal.modal_id+' form.updater').append(editModal.attachInputToTemplate($input, $label));
	});
}

editModal.getInput = function(type, name, value, misc_data) {
	switch (type) {
		case 'text':
		return editModal.getInputText(name, value);
		break;
		case 'select':
		var json_data = JSON.parse(misc_data);
		return editModal.getSelect(name, value, json_data);
		break;
	}
	return null;
}

editModal.getLabel = function(text) {
	var $label = $(editModal.labelTemplate);
	$label.html(text);
	return $label;
}

editModal.getInputHidden = function(name, value) {
	return $('<input/>').attr({name: name, type: 'hidden', value: value});
}

editModal.getInputText = function(name, value) {
	return $('<input/>').attr({name: name, type: 'text', value: value, class: 'form-control', 'data-old-value': value});
}

editModal.getSelect = function(name, value, data) {
	var $select = $('<select class="form-control"/>').attr({name: name});
	$.each(data, function(index, val) {
		 var $option = $('<option value="'+val+'"/>').text(val);
		 if (value == val) {
		 	$option.attr('selected', 'selected');
		 }
		 $select.prepend($option);
	});
	return $select;
}

editModal.attachInputToTemplate = function(input, label) {
	var $ret = $(editModal.inputWrapperTemplate).append(input);
	if (typeof label != 'undefined') {
		$ret.prepend(label);
	}
	return $ret;
}