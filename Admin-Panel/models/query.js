const mongoose = require('mongoose');

const querySchema = mongoose.Schema({
    customer_name: {
        type: String,
        default: "-"
    },
    customer_phone: {
        type: String,
        default: "-"
    },
    customer_email: {
        type: String,
        default: "-"
    },
    customer_query: {
        type: String,
        default: "-"
    },
    customer_message: {
        type: String,
        default: "-"
    },
    token: {
        type: String,
        default: 0
    },
    source: {
        type: String,
        default: "-"
    },
    created_at: {
        type: Date,
        default: Date.now()    
    }
});

module.exports = mongoose.model('Query', querySchema);