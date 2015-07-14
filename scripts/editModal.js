var editModal = {};
editModal.div = null;
editModal.modal_id = 'edit-modal';
editModal.inputTemplate = '<div class="form-group"></div>';
editModal.updater = {
	"subject" : "",
	"predicates": {
		"asdasd" : {
			"object": "",
			"oldObject": "",
		},
		"asdasd" : {
			"object": "",
			"oldObject": ""
		}
	},
	"author" : "Jon Doe",
	"time" : "",
}

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
		.done(function() {
			alert('success');
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
		var $input = editModal.getInput($jqElem.attr('data-type'), $jqElem.attr('data-name'), $jqElem.attr('data-value'));
		$('#'+editModal.modal_id+' form.updater').append(editModal.attachInputToTemplate($input));
	});
}

editModal.getInput = function(type, name, value) {
	switch (type) {
		case 'text':
		return editModal.getInputText(name, value);
		break;
	}
	return null;
}

editModal.getInputHidden = function(name, value) {
	return $('<input/>').attr({name: name, type: 'hidden', value: value});
}

editModal.getInputText = function(name, value) {
	return $('<input/>').attr({name: name, type: 'text', value: value, class: 'form-control', 'data-old-value': value});
}

editModal.attachInputToTemplate = function(input) {
	return $(editModal.inputTemplate).append(input);
}