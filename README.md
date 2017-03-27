#Full Stack Calculator
##Weekend Challenge 3
Welcome to your third weekend challenge!

We are going to be building a calculator application using jQuery, Node, and Express, all hosted on Heroku!

###Server Logic & Client Functionality
IMPORTANT: The logic for the calculator needs to be housed on the Server.

The Client will take in the values (via 2 input fields) and the type of mathematical operation (selected using a button on the DOM). Each numerical value and the mathematical operator type will be bundled up in an object and then sent to the server via a POST request. So when the object leaves the Client, it should look something like this:

{
   x: 3,
   y: 4,
   type: "Add"
}
Once the Server receives it, create the logic to compute the numbers in 1 of 4 different ways: The server should be able to handle (1) addition, (2) subtraction, (3) multiplication, and (4) division. Once the result of the mathematical operation is determined, it should be sent back down to the Client where it will be displayed on the DOM.

Finally, build a clear button that resets the whole experience.

###HARD MODE

Convert the input fields for the two values to buttons. This experience would allow the user to

* click on a numerical button
* click on a mathematical operator
* click on a numerical button
* click on an equal button that sends all of the information to the server

###PRO MODE

Style the whole experience using Bootstrap to resemble the design of a physical calculator. Then, include decimal points in your number logic. Finally, convert your logic to have the Client handle which mathematical operation is run. Once it determines this, it will use that to change the URL or the POST request to pair with a Server route that handles that type of mathematical operation.

For example, the Client code might look like this

	$.ajax({
	    type: "POST",
	    url: "/division",
	    success: function(data){
	       //something here
   		}
	});

and the Server code would have something like

	router.post('/division', function(req, res){
  		//some code here
	});