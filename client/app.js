const express = require('express')
const session = require("express-session");
const cors = require('cors');
var path = require('path');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');
const dotenv = require('dotenv').config()

const app = express()
app.set('port', 81)

const session_length = 60000;

//app.use(express.static(__dirname + '/app'))
app.use(express.static(__dirname))
app.use(express.json())
app.use(cors())

app.use(session( {
	genid: function(req) {
		return uuidv4();
	},
	secret: process.env.SESSION_SECRET,
	resave: true,
	saveUninitialized: true,
	cookie: { secure: false, expires: session_length }
}));

app.get('/', (req, res)=>{ 
	res.send();
}); 

app.post('/login', (req, res) => {
	req.session.email = req.body.email;
	res.redirect('/home');
	//res.send();
});

app.get('/home',(req,res)=>{
	if (req.session.email == 'andrewasus@gmail.com') {
		//res.send('<h2>You have accessed Secret Page</h2>');
		res.sendFile(path.join(__dirname, '/home.html'));
	} else {
		res.send('403 Forbidden');
	}
});


app.listen(app.get('port'), function(){
	console.log('Starting r1bb1t page server on http://localhost:' + app.get('port'));
	console.log(__dirname)
})
