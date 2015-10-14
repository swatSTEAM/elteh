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

	function sortFunction(a, b){
	  if(a<b)
	     return -1 // Или любое число, меньшее нуля
	  if(a>b)
	     return 1  // Или любое число, большее нуля
	  return 0
	}

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
	paramsDick = paramsDick.sort(sortFunction);
	toTable(paramsDick, $('#varser'));
	$('#varser').prepend(
		$('<li>').attr('class','list-group-item active').append(
			'Вар. ряд ('+paramsDick.length + ')'
		)
	);

	parseDicson(paramsDick, paramsRaw);

	$('#cont').css('display','block');
});

function toTable(params, table) {
	table.empty();
	for (var i=0; i<params.length; i++) {
		table.append(
		    $('<a>').attr('href','#').attr(
				'data-toggle','popover'
			).popover(
				{placement:'right'}
			).addClass('list-group-item').append(params[i])
		);
	}
}

function generalToUI(params, coeffs) {
	var levels = [
			 0.10, 0.05, 0.02, 0.01
	];
	var total = 0;

	$.each(params,function() {
	    total += this;
	});

	var avAr = total/params.length;
	total = 0;
	$.each(params,function() {
	    total += Math.pow((this-avAr),2);
	});
	var avSq = Math.sqrt(total/params.length);
	$('#genParams').append(
		$('<p>').attr('class','list-group-item-text').append(
			'Ср. арифметическое: ' + avAr.toFixed(2)
		)
	).append(
		$('<p>').attr('class','list-group-item-text').append(
			'Ср. квадр. откл.: ' + avSq.toFixed(2)
		)
	);
	for (var i=0; i<coeffs.length; i++) {
		$('#genParams').append(
			$('<p>').attr('class','list-group-item-text').append(
				'Z('+levels[i]+'): ' + coeffs[i]
			)
		);
	};
}

function dickToUI(errors, dickCoeffs, paramsDick, paramsRaw, criticalCoeffs) {
	console.log(dickCoeffs);
	for (var i=0; i<dickCoeffs.length; i++) {
		$('#varser').children().eq(
			i+1
		).addClass(
			'list-group-item-success'
		).attr(
			'data-content', dickCoeffs[i].toFixed(2)
		);
	}
	for (var i=0; i<errors.length; i++) {
		if (errors[i].length == 0) {
			$('#q'+i).addClass('list-group-item-success').append(
				$('<p>').attr('class','list-group-item-text').append(
					'Нет промахов по данной значимости'
				)
			);
		} else {
			for (var j=0; j<errors[j].length; j++) {
				if (i<2) {
					$('#varser').children().eq(
						$.inArray(errors[i][j], paramsDick)+1
					).addClass(
						'list-group-item-warning'
					);
					$('#q'+i).addClass('list-group-item-warning');
				} else {
					$('#varser').children().eq(
						$.inArray(errors[i][j], paramsDick)+1
					).addClass(
						'list-group-item-danger'
					);
					$('#q'+i).addClass('list-group-item-danger');
				}
				$('#q'+i).append(
					$('<p>').attr('class','list-group-item-text').append(
						errors[i][j] + ' (' +
						dickCoeffs[$.inArray(errors[i][j], paramsDick)].toFixed(2)
						+ ' > ' + criticalCoeffs[i] + ')'
					)
				);
			}
		}
	}
}

function parseDicson(paramsDick, paramsRaw) {
	var errors = [[],[],[],[]];
	var count = paramsRaw.length;
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
			generalToUI(paramsRaw, criticalCoeffs);
			break;
		}
	}

	var dickCoeffs = [0,0];
	console.log(paramsDick);
	for (var i=2; i<paramsDick.length; i++) {
		var coeff = (paramsDick[i]-paramsDick[i-1])/(paramsDick[i]-paramsDick[0]);
		dickCoeffs.push(coeff);
		for (var p=0; p<criticalCoeffs.length; p++) {
			if (coeff>criticalCoeffs[p]) {
				errors[p].push(paramsDick[i]);
			}
		}
	}
	dickToUI(errors, dickCoeffs, paramsDick, paramsRaw, criticalCoeffs);
};
