const express = require('express');
const router = express.Router();

const State = require('../models/medicento_state');
const City = require('../models/medicento_city');
const Area= require('../models/area');

router.get('/getCityByState', (req, res, next) => {

    City.find({ state: req.query.state_id })
    .exec()
    .then( cities => {
        res.status(200).json({ message: 'cities found', cities: cities });
    })
    .catch( err => {
        res.status(200).json({ message: 'error occured' });
    })
});

router.get('/getAreaByCity', (req, res, next) => {

    Area.find({area_city: req.query.city })
        .exec()
        .then( areas => {
            res.status(200).json({ message: 'areas found', areas: areas });
        })
        .catch( err => {
            res.status(200).json({ message: 'error occured' });
        });
});

router.post('/addArea', (req, res, next) => {

    var area = new Area();
    area.area_state = req.body.state;
    area.area_city = req.body.city;
    area.area_pincode = req.body.pincode;
    area.area_name = req.body.area_name;
    area.save();

    res.status(200).json({ message: 'area created', area: area});

});

module.exports = router;