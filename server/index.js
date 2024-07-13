const express = require('express')
const cors = require('cors')
const mysql = require('mysql'); 
const app = express()

const port = 3000;
const db_host = "127.0.0.1";
const db_user = "root";
const db_password = "";
const db_name = "r1bb1t";

app.set('port', port)
//app.use(express.static(__dirname + '/app'))
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

	var sql = "INSERT INTO users (email, password) VALUES ('" + r_email + "', '" + r_password + "')";
	con.query(sql, function (err, result) {
		if (err) throw err;
		console.log("1 record inserted.");
	});
})

app.listen(app.get('port'), function(){
	console.log('Starting r1bb1t API server on http://localhost:' + app.get('port'));
	console.log(__dirname)
})
