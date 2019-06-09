exports.config = {
  capabilities: {
    'browserName': 'firefox'
    },
  framework: 'jasmine',
  seleniumAddress: 'http://localhost:4444/wd/hub',
  specs: [
    'HomePageSpec.js',
    'LoginPageSpec.js'
		]
}