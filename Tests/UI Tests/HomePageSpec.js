var Homepage = function() {
	this.get = function() {
		browser.driver.get('https://sweetshop.netlify.com/index.html');
	};
	this.heading = element(by.css('h1'));	
	this.addItemButton = element.all(by.css('.btn')).last();
	this.basket = element(by.css('.badge'));
};

describe('Sweet shop homepage', function() {
	beforeEach(function() {
		// We aren't running Angular so do not want to wait for Angular promises!
		return browser.ignoreSynchronization = true;
	});
	
	it('should be displayed', function() {
		var homepage = new Homepage();
		homepage.get();

		expect(homepage.heading.getText()).toBe('Welcome to the sweet shop!')
	});

	it('should be able to add an item to the basket', function() {
		var homepage = new Homepage();
		homepage.get();
		homepage.addItemButton.click();

		expect(homepage.basket.getText()).toBe('1');	
	});
});