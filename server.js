var express = require('express');
var bodyParser = require('body-parser');
var app = express();

var Promise = require('promise');

var stringIncr = require('string-incr');
var redis = require('redis');
var redisClient = redis.createClient({host: 'localhost', port: 6379});

redisClient.on('ready', function () {
    console.log("Redis is ready");
});

redisClient.on('error', function () {
    console.log("Error in Redis");
});

function addEntry(entry) {
    //Get next Redis key value and save a new tip
    redisClient.keys("*", function (err, reply) {
        if (err) {
            console.error(err.stack || err.message);
            return;
        }

        var nextkey = '1';
        if (reply.toString() != "") {
            var array = reply.toString().split(',');
            array.sort(function (a, b) {
                return parseInt(a, 10) - parseInt(b, 10)
            });
            nextkey = stringIncr(array[array.length - 1]);
        }

        console.log("addEntry: Next key=" + nextkey);

        redisClient.set(nextkey, entry, function (err, reply) {
            console.log(reply);
        });
    });
}

function getEntries() {
    return new Promise(function (fulfill, reject) {
        redisClient.keys("*", function (err, reply) {
            if (err) {
                console.error(err.stack || err.message);
                return;
            }

            if (reply.toString() == "") {
                console.log("got empty reply");
                return;
            }

            var array = reply.toString().split(',');

            array.sort(function (a, b) {
                return parseInt(a, 10) - parseInt(b, 10)
            });

            var promisesArray = []
            array.forEach(function (element, index, array) {
                promisesArray.push(getEntry(element))
            });

            Promise.all(promisesArray).then(function (entries) {
                fulfill(entries)
            })
        });
    });
}

function getEntry(element) {
    return new Promise(function (resolve, reject) {
        redisClient.get(element, function (err, reply) {
            if (err) {
                return reject(err);
            }
            var obj = JSON.parse(reply);
            console.log("Getting entry: "+element + ': ' + obj.tip + '; ' + obj.value);
            resolve(JSON.parse(JSON.stringify({"serialNumber": element, "tip": obj.tip, "value": obj.value})));
        });
    })
}

// index.html will be at http://localhost:8080/
app.use(express.static(__dirname + '/'));

// json will be at http://localhost:8080/getEntries
app.get('/getEntries', function (req, res) {
    var getEntriesPromise = getEntries();
    getEntriesPromise.then(function (result) {
        res.json(result);
    });
});

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json());

app.post('/addEntry', function (request, response) {
    console.log("addEntry request received: " + JSON.stringify(request.body));
    addEntry(JSON.stringify(request.body));
    response.send("entry_added");
});

app.listen(8080);