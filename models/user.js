const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },

    createdEvents: [  // events created by user
        {
            type: Schema.Types.ObjectId,
            ref: 'Event' // Connection to the Event model
        }
    ] 
});

module.exports = mongoose.model("User", userSchema);