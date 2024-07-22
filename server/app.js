const express = require('express')
const session = require("express-session");
const cors = require('cors');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const {v4: uuidv4} = require('uuid');
const crypto = require('crypto');
const dotenv = require('dotenv').config()
const https = require("https");
const http = require("http");
const path = require("path");
const fs = require("fs");

// ------------------------- CONFIG -----------------------------

const db_host = "127.0.0.1";
const db_user = "root";
const db_password = "";
const db_name = "r1bb1t";

const key_store = 'C:/Users/Andrew/Desktop/r1bb1t/keys';

// --------------------------------------------------------------

const port = 80;
const password_salt = 10;
const session_length = 600000; //60000;
const generate_session_key = false; //true

const options = {
  key: fs.readFileSync(key_store + '/key.pem'),
  cert: fs.readFileSync(key_store + '/cert.pem'),
};

const con = mysql.createConnection({
	host: db_host,
	user: db_user,
	password: db_password,
	database: db_name
});

const app = express()
app.use(express.static(__dirname + '/public_html'))
app.use(express.json())
app.use(cors())
app.set('port', port)

app.enable('trust proxy');
app.use((req, res, next) => {
    if (req.secure) {
        next();
    } else {
        res.redirect('https://' + req.headers.host + req.url);
    }
});

app.use(session( {
	genid: function(req) {
		return uuidv4();
	},
	httpOnly: true,
	secret: process.env.SESSION_SECRET,
	resave: true,
	saveUninitialized: true,
	cookie: { sameSite: 'strict', secure: true, expires: session_length }
}));

//--------------------------------------------------------------- PAGE HANDLING ---------------------------------------------------------------//

app.get('/', (req, res)=>{ 
	res.send();
}); 
/*
app.get('/app.js', (req, res)=>{ 
	res.send('<script>window.location.replace("/")</script>');
}); 
*/
app.get('/session', (req, res)=>{
	if (req.session.email != null) {
		res.send(req.session.email);
	} else {
		res.send('403 Forbidden');
	}
}); 


app.post('/login', (req, res) => {
	req.session.email = req.body.email;
	res.type('application/json');
	res.status(200);
	res.send();
});

app.get('/home',(req,res) => {
	if (req.session.email != null) {
		res.sendFile(path.join(__dirname, 'public_html/home.html'));
	} else {
		res.send('<script>window.location.replace("/")</script>');
	}
});

//--------------------------------------------------------------- API CALLS ---------------------------------------------------------------//

app.post('/api/accounts', function(req, res){
	console.log("Account creation request received.");

	var r_email = req.body.email;
	var r_password = req.body.password;
	var r_name = req.body.name;
	var r_birthday = req.body.birthday;
	var r_handle = req.body.handle;
	
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
			
			var sql = "INSERT INTO users (email, password, name, birthday, handle) VALUES ('" + r_email + "', '" + hash + "', '" + r_name + "', '" + r_birthday + "', '" + r_handle + "')";
			con.query(sql, function (err, result) {
				if (err) throw err;
				console.log("Record inserted.");
				res.status(200);
				res.json(result);
			})
		});
	})
})

app.post('/api/accounts/authenticate', function(req, res) {
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
	})
})

app.post('/api/accounts/namecheck', function(req, res) {
	var t_handle = req.body.handle;

	res.type('application/json');
	var sql = "SELECT id FROM users WHERE handle= '" + t_handle + "'";
	con.query(sql, function (err, q_result) {
		if (err) throw err;
		if (q_result.length >= 1) {
			res.status(401);
			res.send(null);
		} else {
			res.status(200);
			res.send(null);
		}
	})
})

app.post('/api/posts', function(req, res) {
	var r_email = req.body.email;
	var r_content = req.body.content;
	
	var sql = "SELECT id FROM users WHERE email = '" + r_email + "'";
	con.query(sql, function (err, q_result) {
		if (err) throw err;
		var sql = "INSERT INTO posts (poster, content) VALUES ('" + q_result[0].id + "', '" + r_content + "')";
		con.query(sql, function (err, result) {
			if (err) throw err;
			res.status(200);
			res.json(result);
		})
	})
})

app.get('/api/posts', function(req, res) {
	var sql = "SELECT users.name, users.handle, posts.created, posts.content FROM users INNER JOIN posts ON users.id=posts.poster;";
	con.query(sql, function (err, q_result) {
		if (err) throw err;
		res.status(200);
		res.send(q_result)
	})
})

//--------------------------------------------------------------- APP ---------------------------------------------------------------//

function main() {
	console.log('Starting r1bb1t page server on http://localhost:' + app.get('port'));
	console.log(__dirname)

	if (generate_session_key) {
		const secret = crypto.randomBytes(48, function(err, buffer) { 
			var token = buffer.toString('hex'); 
			var content = "SESSION_SECRET=" + token;
			fs.writeFile('./.env', content, err => {
			  if (err) {
				console.error(err);
			  } else {
				console.log("Generated session token."); 
			  }
			});
		});
	}

	con.connect(function(err) {
		if (err) throw err;
		console.log("Conntected to SQL server.");
	});

	http.createServer(app).listen(80);
	https.createServer(options, app).listen(443);
}

main();
