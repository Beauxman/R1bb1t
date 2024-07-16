const express = require('express');
const cors = require('cors');
const mysql = require('mysql');
const bcrypt = require('bcrypt');

const https = require("https");
const http = require("http");
const path = require("path");
const fs = require("fs");

const port = 3000;
const db_host = "127.0.0.1";
const db_user = "root";
const db_password = "";
const db_name = "r1bb1t";

const password_salt = 10;
const generate_secret = false;

if (generate_secret) {
	const secret = crypto.randomBytes(48, function(err, buffer) { 
		var token = buffer.toString('hex'); 
		console.log(token); 
	});
}

const app = express();
app.set('port', port)
app.use(express.static(__dirname + '/API_modules'))
app.use(express.static(__dirname))
app.use(express.json())
app.use(cors())

var con = mysql.createConnection({
	host: db_host,
	user: db_user,
	password: db_password,
	database: db_name
});

con.connect(function(err) {
	if (err) throw err;
	console.log("Conntected to SQL server @" + db_host);
});

app.post('/api/accounts', function(req, res){
	console.log("Account creation request received.");

	var r_email = req.body.email;
	var r_password = req.body.password;
	
	res.type('application/json');
	bcrypt.genSalt(password_salt, (err, salt) => {
		if (err) {
			res.status(500);
			res.json(result);
			console.log('Failed to salt.');
			return;
		}
		bcrypt.hash(r_password, salt, (err, hash) => {
			if (err) {
				res.status(500);
				res.json(result);
				console.log('Failed to hash.');
				return;
			}
			
			var sql = "INSERT INTO users (email, password) VALUES ('" + r_email + "', '" + hash + "')";
			con.query(sql, function (err, result) {
				if (err) throw err;
				console.log("Record inserted.");
				res.status(200);
				res.json(result);
			});
		});
	});
})

app.post('/api/accounts/authenticate', function(req, res){
	var l_email = req.body.email;
	var l_password = req.body.password;
	
	res.type('application/json');
	var sql = "SELECT password FROM users WHERE email = '" + l_email + "'";
	con.query(sql, function (err, q_result) {
		if (err) throw err;
		if (q_result.length == 1) {
			bcrypt.compare(l_password, q_result[0].password, (err, h_result) => {				
				if (err) {
					res.status(500);
					res.json(h_result);
					console.error('Error comparing passwords:', err);
					return;
				}
				
				if (h_result) {
					console.log("Account authenticated (" + l_email + ").");
					res.status(200);
					res.json(h_result);
				} else {
					console.log("Failed authentication attempt (" + l_email + "). Invalid password.");
					res.status(401);
					res.json(h_result);
				}
			});
		} else {
			console.log("Failed authentication attempt (" + l_email + "). Invalid email.");
			res.status(401);
			res.json(q_result);
		}
	});
})

app.listen(app.get('port'), function(){
	console.log('Starting r1bb1t API server on http://localhost:' + app.get('port'));
	console.log(__dirname)
})
