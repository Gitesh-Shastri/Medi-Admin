const mongoose = require('mongoose');

const userCodeSchema = mongoose.Schema({
code: {
        type: Number
    }
});

module.exports = mongoose.model('USerCode', userCodeSchema);
