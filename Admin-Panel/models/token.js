const mongoose = require('mongoose');

const queryToeknSchema = mongoose.Schema({
    code: {
        type: Number
    }
});

module.exports = mongoose.model('QueryToken', queryToeknSchema);