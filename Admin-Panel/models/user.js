const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = mongoose.Schema({
    useremail: {
        type: String
    },
    password: {
        type: String
    },
    usercode: {
        type: String
    },
    phone: {
        type: String
    }
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', userSchema);