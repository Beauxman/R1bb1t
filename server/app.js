const express = require('express')
const session = require("express-session");
const cors = require('cors');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const {v4: uuidv4} = require('uuid');
const crypto = require('crypto');
const dotenv = require('dotenv').config()
const https = require("https");
const http = require("http");
const path = require("path");
const fs = require("fs");
const multer = require('multer')

//---------------------------------------------------------------- CONFIG --------------------------------------------------------------------//

const db_host = "127.0.0.1";
const db_user = "root";
const db_password = "";
const db_name = "r1bb1t";

const key_store = 'C:/Users/Andrew/Desktop/r1bb1t/keys';

// -------------------------------------------------------------------------------------------------------------------------------------------//

const password_salt = 10;
const session_length = (7 * 24 * 60 * 60 * 1000); // One week
const generate_session_key = true;
const max_img_size_mb = 6;


const options = {
  key: fs.readFileSync(key_store + '/key.pem'),
  cert: fs.readFileSync(key_store + '/cert.pem'),
};

const con = mysql.createConnection({
	host: db_host,
	user: db_user,
	password: db_password,
	database: db_name,
	queueLimit: 0
});

const appHTTP = express()
const app = express()
app.use(express.static(__dirname + '/public_html'))
app.use(express.static(__dirname + '/image_store'))
app.use(express.json())
app.use(cors())
app.set('port', 80)

//-------------------------------------------------------------- IMAGE UPLOADS ---------------------------------------------------------------//

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "image_store");
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + "-" + Date.now() + ".jpg");
    },
});
 
const upload = multer({
    storage: storage,
    limits: { fileSize: (max_img_size_mb * 1000 * 1000) },
    fileFilter: function (req, file, cb) {
        var filetypes = /jpeg|jpg|png/;
        var mimetype = filetypes.test(file.mimetype);
 
        var extname = filetypes.test(
            path.extname(file.originalname).toLowerCase()
        );
 
        if (mimetype && extname) {
            return cb(null, true);
        }
 
        cb(
            "Error: File upload only supports the " +
                "following filetypes - " +
                filetypes
        );
    },
})

// --------------------------------------------------------------------------------------------------------------------------------------------//

app.enable('trust proxy');
appHTTP.use((req, res, next) => {
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

//----------------------------------------------------------- GENERAL USE FUNCTIONS -----------------------------------------------------------//

function fixInput(input) {
    const regex = /[^A-Za-z0-9.,:;!?()\[\]{}'" -_]/g;
    return input.replace(regex, '');
}

function fixInput(input, regex) {
    return input.replace(regex, '');
}

//--------------------------------------------------------------- PAGE HANDLING ---------------------------------------------------------------//

app.get('/sessions', (req, res)=>{
	if (req.session.email != null) {
		res.send(null);
	} else {
		res.send('Invalid session');
	}
}); 


app.post('/login', (req, res) => {
	req.session.email = req.body.email;
	res.type('application/json');
	res.status(200);
	res.send();
});

app.get('/logout', (req, res) => {
	req.session.destroy();
	res.type('application/json');
	res.status(200);
	res.send();
});

app.get('/about',(req,res) => {
	res.sendFile(path.join(__dirname, 'public_html/about.html'));
})

app.get('/home',(req,res) => {
	if (req.session.email != null) {
		res.sendFile(path.join(__dirname, 'public_html/home.html'));
	} else {
		res.send('<script>window.location.replace("/")</script>');
	}
});

app.get('/premium',(req,res) => {
	if (req.session.email != null) {
		res.sendFile(path.join(__dirname, 'public_html/premium.html'));
	} else {
		res.send('<script>window.location.replace("/")</script>');
	}
});

app.post('/files', upload.single('file'), (req, res) => {
    if (req.file) {
        res.send({ url: res.req.file.filename });
    } else {
        res.status(400).send('File upload failed');
    }
});

//--------------------------------------------------------------- API CALLS ---------------------------------------------------------------//

app.post('/accounts', function(req, res){
	var r_email = req.body.email;
	var r_password = req.body.password;
	var r_name = req.body.name;
	var r_birthday = req.body.birthday;
	var r_handle = req.body.handle;
	var r_photo = req.body.photo;
	
	r_name = fixInput(r_name, /[^A-Za-z0-9.,:;!?()\[\]{}'" -_]/g);
	r_handle = fixInput(r_handle, /[^0-9a-z-]/g);
	
	res.type('application/json');
	bcrypt.genSalt(password_salt, (err, salt) => {
		if (err) {
			res.status(500);
			res.json(result);
			return;
		}
		bcrypt.hash(r_password, salt, (err, hash) => {
			if (err) {
				res.status(500);
				res.json(result);
				return;
			}
			
			var sql = "INSERT INTO users (Email, Password, Name, Birthday, Handle, ImageURL) VALUES (?, ?, ?, ?, ?, ?)";
			var values = [r_email, hash, r_name, r_birthday, r_handle, r_photo];
			con.execute(sql, values, function (err, result) {
				if (err) throw err;
				res.status(200);
				res.json(result);
			})
		});
	})
})

app.post('/accounts/authenticate', function(req, res) {
	var l_email = req.body.email;
	var l_password = req.body.password;
	
	res.type('application/json');
	var sql = "SELECT Password FROM users WHERE Email = ?";
	var values = [l_email];
	con.execute(sql, values, function (err, q_result) {
		if (err) throw err;
		if (q_result.length == 1) {
			bcrypt.compare(l_password, q_result[0].Password, (err, h_result) => {				
				if (err) {
					res.status(500);
					res.json(h_result);
					return;
				}				
				if (h_result) {
					// Login success
					res.status(200);
					res.json(h_result);
				} else {
					// Invalid password
					res.status(401);
					res.json(h_result);
				}
			});
		} else {
			// Invalid email
			res.status(401);
			res.json(q_result);
		}
	})
})

app.post('/accounts/namecheck', function(req, res) {
	var t_handle = req.body.handle;

	res.type('application/json');
	var sql = "SELECT UserID FROM users WHERE Handle= ?";
	var values = [t_handle];
	con.execute(sql, values, function (err, q_result) {
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

app.post('/accounts/retrieve', function(req, res) {
	var r_email = req.session.email;
	var r_userid = req.body.userid;
	var sql = "";
	var values = [];
	
	res.type('application/json');
	if (!(r_userid === undefined)) {
		sql = `
			SELECT u.UserID, u.Name, u.Email, u.Handle, u.ImageURL, u.Description, u.Birthday, u.Created, u.BackgroundImageURL,
			IF(f.FollowerID IS NOT NULL, 1, 0) AS IsFollowing,
			(SELECT COUNT(*) FROM Followers WHERE FollowingID = u.UserID) AS FollowersCount,
			(SELECT COUNT(*) FROM Followers WHERE FollowerID = u.UserID) AS FollowingCount
			FROM users u
			LEFT JOIN followers f 
			ON u.UserID = f.FollowingID 
			AND f.FollowerID = (SELECT UserID FROM Users WHERE Email = ?)
			WHERE u.UserID = ?;
			`
		values = [r_email, r_userid];
	} else if (!(r_email === undefined)) {
		sql = "SELECT UserID, Name, Email, Handle, ImageURL FROM users WHERE Email = ?";
		values = [r_email];
	}
	con.execute(sql, values, function (err, q_result) {
		if (err) throw err;
		if (q_result.length == 1) {
			res.status(200);
			res.send(q_result)
		} else {
			res.status(401);
			res.send(null);
		}
	})
})

app.post('/posts', function(req, res) {
	var r_email = req.session.email;
	var r_content = req.body.content;
	var r_parent = req.body.parentpostid
	var r_imageurl = req.body.imageurl
	r_content = r_content.replace(/[^A-Za-z0-9.,:;!?()\[\]{}'" -_]/g, '');
	
	if (r_parent === undefined) r_parent = null;
	if (r_imageurl === undefined) r_imageurl = null;
	
	var sql = "SELECT UserID FROM users WHERE Email = ?";
	var values = [r_email];
	con.execute(sql, values, function (err, q_result) {
		if (err) throw err;
		if (q_result.length > 0) {
			var sql = "INSERT INTO posts (UserID, Content, ParentPostID, ImageURL) VALUES (?, ?, ?, ?)";
			var values = [q_result[0].UserID, r_content, r_parent, r_imageurl];
			con.execute(sql, values, function (err, result) {
				if (err) throw err;
				res.status(200);
				res.json(result);
			})
		}
	})
})

app.get('/posts', function(req, res) {
	var r_parent = req.query.parentpostid;
	var whereConstraint = "1=1";
	var extraConstraits = "";
	
	if (req.query.trending == "true") {
		extraConstraits = "ORDER BY Likes DESC LIMIT 3";
	} else if (!(req.query.userid === undefined || req.query.userid == "undefined")) {
		whereConstraint = "u.UserID = " + Number(req.query.userid);
	} else if (req.query.postid) {
		whereConstraint = "p.postID = " + Number(req.query.postid);
	} else {
		if (r_parent === undefined || r_parent == "undefined")
			whereConstraint = "p.ParentPostID IS NULL";
		else 
			whereConstraint = "p.ParentPostID = " + Number(r_parent);
	}
	
	res.type('application/json');
	var sql = "SELECT UserID FROM users WHERE Email = ?";
	var values = [req.session.email];
	con.execute(sql, values, function (err, q_result) {
		if (err) throw err;
		if (q_result.length > 0) {
			var sql = `
				SELECT u.UserID, u.Name, u.Handle, u.ImageURL, p.PostID, p.Content, p.Created, p.ImageURL AS PostImage,
				COUNT(DISTINCT l.Created) AS Likes,
				COUNT(DISTINCT c.PostID) AS Comments,
				IF(ul.UserID IS NOT NULL, 1, 0) AS UserHasLiked,
				IF(uc.UserID IS NOT NULL, 1, 0) AS UserHasCommented
				FROM Posts p
				LEFT JOIN Likes l ON p.PostID = l.PostID
				LEFT JOIN Users u ON p.UserID = u.UserID
				LEFT JOIN Posts c ON p.PostID = c.ParentPostID
				LEFT JOIN Likes ul ON p.PostID = ul.PostID AND ul.UserID = ${q_result[0].UserID}
				LEFT JOIN Posts uc ON p.PostID = uc.ParentPostID AND uc.UserID = ${q_result[0].UserID}
				WHERE ${whereConstraint} 
				GROUP BY p.PostID 
				${extraConstraits};
				`
				//ORDER BY UserID DESC
				//LIMIT 50;
			con.execute(sql, function (err, q_result) {
				if (err) throw err;
				res.status(200);
				res.send(q_result)
			})
		}
	})
})

app.post('/posts/likes', function(req, res) {
	var r_email = req.session.email;
	var r_postid = req.body.postid;

	var sql = `
		INSERT INTO likes (UserID, PostID)
		SELECT u.UserID, ?
		FROM users AS u
		WHERE u.email = ?
		`
	var values = [r_postid, r_email];
	con.execute(sql, values, function (err, q_result) {
		if (err) throw err;
		res.status(200);
		res.json(q_result);

	})
})

app.delete('/posts/likes', function(req, res) {
	var r_email = req.session.email;
	var r_postid = req.query.postid;

	var sql = `
		DELETE l FROM Likes l
		INNER JOIN Users u ON l.UserID = u.UserID
		WHERE l.PostID = ? AND u.Email = ?;
		`
	var values = [r_postid, r_email];
	con.execute(sql, values, function (err, q_result) {
		if (err) throw err;
		res.status(200);
		res.json(q_result);

	})
})

app.post('/accounts/followers', function(req, res) {
	var r_email = req.session.email;
	var r_followingid = req.body.followingid;

	var sql = `
		INSERT INTO followers (FollowerID, FollowingID)
		SELECT u.UserID, ?
		FROM users AS u
		WHERE u.email = ? AND u.UserID <> ?;
		`
	var values = [r_followingid, r_email, r_followingid];
	con.execute(sql, values, function (err, q_result) {
		if (err) throw err;
		res.status(200);
		res.json(q_result);
	})
})

app.delete('/accounts/followers', function(req, res) {
	var r_email = req.session.email;
	var r_followingid = req.query.followingid;

	var sql = `
		DELETE l FROM followers l
		INNER JOIN Users u ON l.FollowerID = u.UserID
		WHERE l.FollowingID = ? AND u.Email = ?;
		`
	var values = [r_followingid, r_email];
	con.execute(sql, values, function (err, q_result) {
		if (err) throw err;
		res.status(200);
		res.json(q_result);
	})
})

//--------------------------------------------------------------- APP ---------------------------------------------------------------//

function main() {
	console.log('Starting r1bb1t server...');
	console.log(__dirname)

	if (generate_session_key) {
		const secret = crypto.randomBytes(48, function(err, buffer) { 
			var token = buffer.toString('hex'); 
			var content = "SESSION_SECRET=" + token;
			fs.writeFile('./.env', content, err => {
			  if (err) {
				console.error(err);
			  } else {
				console.log("Generated session token"); 
			  }
			});
		});
	}

	con.connect(function(err) {
		if (err) throw err;
		console.log("Conntected to SQL server");
	});
	
	setInterval(() => {
		con.query('SELECT 1', (err, results) => {
			if (err) {
				console.error('Error executing keep-alive query:', err);
			} else {
				console.log('Keep-alive query executed successfully.');
			}
		});
	}, 3600000); 

	http.createServer(appHTTP).listen(80);
	https.createServer(options, app).listen(443);
}

main();