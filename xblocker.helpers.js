xb = {
	load: function(callback) {
		chrome.storage.sync.get('patterns', function(items) {
			var patterns = items.patterns || [];
			if ( patterns.length == 0 ) {
				patterns = xb.defaults();
			}
			callback(patterns);
		});
	},

	testURL: function(regexes, url) {
		for (var i=0, L=regexes.length; i<L; i++) {
			var regex = regexes[i];
			if (regex.regex.test(url)) {
				return regex;
			}
		}
	},

	strToPattern: function(list, str) {
		if ( str.trim() && str[0] != '#' ) {
			var pattern = {
				original: str,
				allow: false,
			};

			str.split(': ').forEach(function(component) {
				if ( component == 'allow' ) {
					pattern.allow = true;
				}
				else {
					pattern.regex = new RegExp(component, 'i');
				}
			});

			list.push(pattern);
		}

		return list;
	},

	save: function(patterns, callback) {
		chrome.storage.sync.set({patterns: patterns}, function() {
			callback();
		});
	},

	propagate: function(callback) {
		chrome.runtime.sendMessage({RELOAD: true}, function(response) {
			callback && callback();
		});

	},

	defaults: function() {
		return [
			'\\Wfacebook\\.com\\W',
			'\\Wfacebook\\.net\\W',
			'\\Wfbcdn\\.net\\W',
			'\\Wplatform\\.twitter\\.com\\W',
			'\\Wgoogletagservices\\.com\\W',
			'\\Wgoogleadservices\\.com\\W',
		];
	}
};
