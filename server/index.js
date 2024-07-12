
const express = require('express')
const app = express()
app.set('port', 3000)

//app.use(express.static(__dirname + '/app'))
app.use(express.static(__dirname))

app.listen(app.get('port'), function(){
	console.log('Starting r1bb1t API server on http://localhost:' + app.get('port'));
	console.log(__dirname)
})
