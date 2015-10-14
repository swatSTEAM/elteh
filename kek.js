'use strict';
$('#myModal').modal({
	backdrop: 'static',
	keyboard: false
})

$("#myModal").modal('show');

$("#load1").click(function(event) {
	var arr = [1.679, 1.694, 1.632, 1.644, 1.782, 1.676, 1.707, 1.675, 1.654, 1.622, 1.694, 1.64];
	$("#input").val(arr.join('\n'));
});

$("#load2").click(function(event) {
	var arr = [1.698, 1.684, 1.641, 1.703, 1.666, 1.628, 1.664, 1.575, 1.672, 1.579, 1.691, 1.631, 1.704, 1.583, 1.639, 1.613];
	$("#input").val(arr.join('\n'));
});

$("#goBtn").click(function(event) {
	$('#myModal').modal({
		backdrop: '',
		keyboard: true
  	});
	//Парсим строку в массив float
	var paramsRaw = $("#input").val().split(/\n| /);

	for (var i=0;i<paramsRaw.length;i++) {
		paramsRaw[i] = parseFloat(paramsRaw[i].replace(",", "."));
		if (isNaN(paramsRaw[i]) === true) {
			$("#myModalLabel").text("Invalid args");
			$("#input").addClass('bg-danger');
			return;
		}
	}

	if (paramsRaw.length < 4) {
		$("#myModalLabel").text("Need at least 4 args");
		$("#input").addClass('bg-danger');
		return;
	}

	//Записываем в UI
	$("#myModal").modal('hide');
	var samples = $('#samples');

	toTable(paramsRaw, samples);
	samples.prepend(
		$('<li>').attr('class','list-group-item active').append(
			'Выборка ('+paramsRaw.length + ')'
		)
	);

	var paramsDick = [];
	$.each(paramsRaw, function(i, el){
	    if($.inArray(el, paramsDick) === -1) paramsDick.push(el);
	});
	paramsDick = paramsDick.sort();
	toTable(paramsDick, $('#varser'));
	$('#varser').prepend(
		$('<li>').attr('class','list-group-item active').append(
			'Вар. ряд ('+paramsDick.length + ')'
		)
	);

	parseDicson(paramsDick, paramsRaw.length);

	$('#cont').css('display','block');
});

function toTable(params, table) {
	table.empty();
	for (var i=0; i<params.length; i++) {
		table.append(
		    $('<li>').attr('class','list-group-item').append(params[i])
		);
	}
}

function generalToUI(params, coeffs) {
	console.log(coeffs);
}

function dickToUI(errors, dickCoeffs) {
	for (var i in errors) {
		for (var j in errors[i]) {
			$('#q'+i).append(
				$('<p>').attr('class','list-group-item-text').append(
					errors[i][j]
				)
			);
		}
	}
}

function parseDicson(params, count) {
	var errors = [[],[],[],[]];
	//Таблица критических критериев
	//уровни значимости 0.1 0.05 0.02 0.01
	var levels = [
			 0.10, 0.05, 0.02, 0.01
	];
	var critical = [
		[4, [0.68, 0.76, 0.85, 0.89]],
		[5, [0.56, 0.64, 0.78, 0.82]],
		[6, [0.48, 0.56, 0.64, 0.7 ]],
		[8, [0.4,  0.47, 0.54, 0.59]],
		[10,[0.35, 0.41, 0.48, 0.53]],
		[14,[0.29, 0.35, 0.41, 0.45]],
		[16,[0.28, 0.33, 0.39, 0.43]],
		[18,[0.26, 0.31, 0.37, 0.41]],
		[20,[0.26, 0.3,  0.36, 0.39]],
		[30,[0.22, 0.26, 0.31, 0.34]]
	];

	var criticalCoeffs = [];
	for (var i = critical.length-1;i>=0;i--) {
		if (count >= critical[i][0]) {
			criticalCoeffs = critical[i][1];
			generalToUI(params, criticalCoeffs);
			break;
		}
	}

	var dickCoeffs = [0,0];
	console.log(params);
	for (var i=2; i<params.length; i++) {
		var coeff = (params[i]-params[i-1])/(params[i]-params[0]);
		dickCoeffs.push(coeff);
		for (var p=0; p<criticalCoeffs.length; p++) {
			if (coeff>criticalCoeffs[p]) {
				errors[p].push(params[i]);
			}
		}
	}
	dickToUI(errors, dickCoeffs);
};
