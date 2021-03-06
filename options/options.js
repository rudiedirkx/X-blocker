
console.time('Options init');

function ready() {
	document.body.classList.remove('loading');
	console.timeEnd('Options init');
}

function init() {
	var $patterns = document.querySelector('#patterns');
	var $form = $patterns.form;
	var $instructions = document.querySelector('details');
	var $formTest = document.querySelector('#form-test');
	var $inpTestUrl = document.querySelector('#inp-test-url');
	var $msgTestResult = document.querySelector('#msg-test-result');
	var savedTimer;

	// Open INSTRUCTIONS
	if (parseFloat($instructions.dataset.version) > parseFloat(localStorage.instructionsVersion || '0')) {
		$instructions.open = true;
	}
	$instructions.addEventListener('toggle', function(e) {
		// User closed it, so remember that
		if (!this.open) {
			localStorage.instructionsVersion = parseFloat($instructions.dataset.version);
		}
	});

	// Load
	xb.load(function(patterns) {
		$patterns.value = patterns.join("\n");

		ready();
	});

	// Save
	$form.addEventListener('submit', function(e) {
		e.preventDefault();

		// Extract lines
		var patterns = $patterns.value.trim().replace(/\r\n/g, "\n").replace(/\r/g, "\n"); // Enforce \n
		patterns = patterns.replace(/\n{2,}/, "\n\n"); // Max 1 open line
		patterns = patterns.split(/\n/); // Split to lines
		patterns = patterns.map(function(pattern) { // Trim every line
			return pattern.trim();
		});

		// Save & propagate
		xb.save(patterns, function() {
			xb.propagate();

			// Notify user
			$form.classList.add('saved');
			clearTimeout(savedTimer);
			savedTimer = setTimeout(function() {
				$form.classList.remove('saved');
			}, 1500);
		});

		// Put cleaned up patterns back into textarea
		$patterns.value = patterns.join("\n");
	});

	// Test a URL
	$formTest.addEventListener('submit', function(e) {
		e.preventDefault();

		function notify(msg) {
			$formTest.classList.add('result');
			$msgTestResult.innerHTML = msg;

			setTimeout(function() {
				$formTest.classList.remove('result');
			}, 1000);
		}

		var url = $inpTestUrl.value;
		xb.load(function(patterns) {
			var regexes = patterns.reduce(xb.strToPattern, []);
			var result = xb.testURL(regexes, url);
			if ( result ) {
				var state = result.allow ? 'ALLOW' : 'BLOCK';
				notify('Match (' + state + ') for <code>' + result.original + '</code>');
			}
			else {
				notify('No match: pass');
			}
		});
	});
}
