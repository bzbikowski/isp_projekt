var express = require('express');
var router = express.Router();
var model = require("../models/bme_sensor.model");
var moment = require("moment");

/* GET home page. */
router.get('/', function (req, res, next) {
    // todo init data from database to client
    res.render('index', {title: 'Express'});
});

module.exports = router;