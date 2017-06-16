var express = require('express');
var app = express();
var path = require('path');

app.use(express.static(path.join(__dirname, 'public')));
// viewed at http://localhost:8080
app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + 'public/index.html'));
});
let port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log(`magic happens on ${port}`)
});

/*Running the App, Steps:

1) npm run build (converts all typescript files in the src folder to javascript files in the dist folder)
2) webpack (bundles everything from the dist folder into bundle.js in the public folder)
3) node server.js (serves the index.html file which references bundle.js and the .css files to render the React into the DOM)

Note: Make this process more elegant (needed to get something together so I could actually get back to coding!)
*/