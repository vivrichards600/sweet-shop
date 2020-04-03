var LoginPage = function() {
	this.get = function() {
		browser.driver.get('https://sweetshop.netlify.com/login.html');
	};
	this.heading = element(by.css('h1'));	
	this.emailInput = element(by.id('exampleInputEmail'));
	this.passwordInput = element(by.id('exampleInputPassword'));
	this.loginButton = element(by.css('.btn'));
};

var MyAccountPage = function() { 
	this.get = function() {
		browser.driver.get('http://computer-database.herokuapp.com/00efc23d-b605-4f31-b97b-6bb276de447e.html');
	};
	this.heading = element(by.css('h1'));	
	this.headerText = element(by.css('.my-4')).element(by.css('.lead'));
};

describe('Sweet shop login page', function() {
	beforeEach(function() {
		// We aren't running Angular so do not want to wait for Angular promises!
		return browser.ignoreSynchronization = true;
	});
	
	it('should be displayed', function() {
		var loginPage = new LoginPage();
		loginPage.get();

		expect(loginPage.heading.getText()).toBe('Login')

	});

	it('should be able to login to my account', function() {
		var loginPage = new LoginPage();
		loginPage.get();
		loginPage.emailInput.sendKeys('test@user.com');
		loginPage.passwordInput.sendKeys('qwerty');
		
		loginPage.loginButton.click();

		var myAccountPage = new MyAccountPage();
		
		expect(myAccountPage.headerText.getText()).toBe('Welcome back test@user.com');	
	});
});