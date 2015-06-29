var AWS = require("aws-sdk");
var os = require("os");
var crypto = require('crypto');
var fs = require('fs');
//zawiera funkcje pomocnicze generowania skrótów robienia z jonson obiektu ...
var helpers = require("./helpers");
//accessKeyId ... klucze do amazona 
AWS.config.loadFromPath('./config.json');
//obiekt dla instancji S3 z aws-sdk
var s3 = new AWS.S3();
//plik z linkiem do kolejki
var APP_CONFIG_FILE = "./app.json";
//dane o kolejce wyciągamy z tablicy i potrzebny link przypisujemy do linkKolejki
var tablicaKolejki = helpers.readJSONFile(APP_CONFIG_FILE);
var linkKolejki = tablicaKolejki.QueueUrl
//obiekt kolejki z aws-sdk
var sqs=new AWS.SQS();

//obiekt do obsługi simple DB z aws-sdk
var simpledb = new AWS.SimpleDB();
//GraphicsMagic
var gm = require('gm');

//funkcja - petla wykonuje sie caly czas
var myServer = function(){
	
	console.log("Server is starting");
	sqs.receiveMessage({
	   QueueUrl: linkKolejki,
	   MaxNumberOfMessages: 1, // how many messages do we wanna retrieve?
	   VisibilityTimeout: 60, // seconds - how long we want a lock on this job
	   WaitTimeSeconds: 3 // seconds - how long should we wait for a message?
	 }, function(err, data) {
	   // If there are any messages to get
	   if (data.Messages) {
		  // Get the first message (should be the only one since we said to only get one above)
		  var message = data.Messages[0],
			  body = JSON.parse(message.Body);
		  // Now this is where you'd do something with this message
		  doSomethingCool(body, message);  // whatever you wanna do
		  // Clean up after yourself... delete this message from the queue, so it's not executed again
		  removeFromQueue(message);  // We'll do this in a second
	   }
	 });
	
}			

//odpalamy petle
myServer();