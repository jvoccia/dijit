// Supplies useLoader with a dojoConfig enabling require.undef()
// dojoConfig needs to be defined here, otherwise it's too late to affect the dojo loader api
/* globals dojoConfig */
/* jshint -W020 */
dojoConfig = {
	async: true,
	tlmSiblingOfDojo: false,
	useDeferredInstrumentation: false,
	has: {
		'dojo-undef-api': true
	}
};

// Learn more about configuring this file at <https://github.com/theintern/intern/wiki/Configuring-Intern>.
// These default settings work OK for most people. The options that *must* be changed below are the
// packages, suites, excludeInstrumentation, and (if you want functional tests) functionalSuites.
define({
	// The port on which the instrumenting proxy will listen
	proxyPort: 9000,

	// A fully qualified URL to the Intern proxy
	proxyUrl: 'http://localhost:9000/',

	// Default desired capabilities for all environments. Individual capabilities can be overridden by any of the
	// specified browser environments in the `environments` array below as well. See
	// https://code.google.com/p/selenium/wiki/DesiredCapabilities for standard Selenium capabilities and
	// https://saucelabs.com/docs/additional-config#desired-capabilities for Sauce Labs capabilities.
	// Note that the `build` capability will be filled in with the current commit ID from the Travis CI environment
	// automatically
	capabilities: {
		'selenium-version': '2.41.0',
		'record-screenshots': false,
		'sauce-advisor': false,
		'video-upload-on-pass': false,
		'max-duration': 300
	},

	// Browsers to run integration testing against. Note that version numbers must be strings if used with Sauce
	// OnDemand. Options that will be permutated are browserName, version, platform, and platformVersion; any other
	// capabilities options specified for an environment will be copied as-is
	environments: [
		{ browserName: 'internet explorer', version: '11', platform: 'Windows 8.1', 'prerun': 'http://localhost:9001/tests-intern/support/prerun.bat' },
		{ browserName: 'internet explorer', version: '10', platform: 'Windows 8', 'prerun': 'http://localhost:9001/tests-intern/support/prerun.bat' },
		{ browserName: 'internet explorer', version: [ '8', '9', '10' ], platform: 'Windows 7', 'prerun': 'http://localhost:9001/tests-intern/support/prerun.bat' },
		// { browserName: 'internet explorer', version: [ '6', '7', '8' ], platform: 'Windows XP', 'iedriver-version': '2.41.0', 'prerun': 'http://localhost:9001/tests-intern/support/prerun.bat' },
		{ browserName: 'firefox', version: '', platform: [ 'OS X 10.9', 'Windows 7', 'Windows XP', 'Linux' ] },
		{ browserName: 'chrome', version: '', platform: [ 'Linux', 'OS X 10.8', /* TODO: SauceLabs is giving an Unknown command 'WaitForAllTabsToStopLoading' on 'OS X 10.9',*/ 'Windows XP', 'Windows 7', 'Windows 8', 'Windows 8.1' ] },
		{ browserName: 'safari', version: '6', platform: 'OS X 10.8' }/*,
		 TODO: SauceLabs is having problems with the proxy { browserName: 'safari', version: '7', platform: 'OS X 10.9' }*/
	],

	// Maximum number of simultaneous integration tests that should be executed on the remote WebDriver service
	maxConcurrency: 1,
	tunnel: 'SauceLabsTunnel',

	// The desired AMD loader to use when running unit tests (client.html/client.js). Omit to use the default Dojo
	// loader
	//useLoader: {
	//	'host-node': '../../../../dojo',  // relative path from the launcher
	//	'host-browser': '../dojo.js'
	//},

	// Configuration options for the module loader; any AMD configuration options supported by the specified AMD loader
	// can be used here
	loader: {
		packages: [
			{ name: 'dijit', location: '.' },
			// The dojo used for testing Dijit
			{ name: 'dojo', location: 'node_modules/dojo' },
			{ name: 'sinon', location: 'node_modules/sinon/lib', main: 'sinon'}
		],
		map: {
			intern: {
				dojo: 'intern/node_modules/dojo',
				chai: 'intern/node_modules/chai/chai'
			},

			// Tests should use dojo in node_modules
			'dijit/tests-intern': {
				dojo: 'dojo',
				// Once this section matches, the star section will not, so intern/dojo needs to be
				// defined here as well
				'intern/dojo': 'intern/node_modules/dojo'
			},
			testing: {
			},
			'*': {
				'intern/dojo': 'intern/node_modules/dojo'
			}
		}
	},

	// Non-functional test suite(s) to run in each browser
	//suites: [ 'testing/tests-intern/unit/all' ],

	// Functional test suite(s) to run in each browser once non-functional tests are completed
	functionalSuites: [ 'dijit/tests-intern/functional/all' ],

	// A regular expression matching URLs to files that should not be included in code coverage analysis
	excludeInstrumentation: /^(?:node_modules|tests-intern|tests)\//
});