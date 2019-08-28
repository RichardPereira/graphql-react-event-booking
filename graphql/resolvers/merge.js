const Event = require('../../models/event');
const User = require('../../models/user');
const { dateToString } = require('../../helpers/date');

/**
 * Fetching all the events
 * @param {String} eventIds 
 */
const events = async eventIds => {
    try {
        const events = await Event.find({ _id: { $in: eventIds } });
        return events.map(event => {
            return transformEvent(event);
        });
    }
    catch (err) {
        throw err;
    }
};
/**
 * Fetching a single event using the Id as argument
 * @param {String} eventId 
 */
const singleEvent = async eventId => {

    try {
        const event = await Event.findById(eventId);
        return transformEvent(event);
    } catch (error) {
        throw error;
    }
};

/**
 * Fetching an user by their Id
 * @param {String} userId 
 */
const user = async userId => {
    try {
        const user = await User.findById(userId);
        return {
            ...user._doc,
            id: user.id,
            password: null,
            createdEvents: events.bind(this, user._doc.createdEvents)
        };
    }
    catch (err) {
        throw err;
    }
};

const transformEvent = event => {
    return {
        ...event._doc,
        _id: event.id,
        date: dateToString(event._doc.date),
        creator: user.bind(this, event._doc.creator)
    }
};

const transformBooking = booking => {
    return {
        ...booking._doc,
        _id: booking.id,
        user: user.bind(this, booking._doc.user),
        event: singleEvent.bind(this, booking._doc.event),
        createdAt: dateToString(booking._doc.createdAt),
        updatedAt: dateToString(booking._doc.updatedAt)
    };
};


exports.transformBooking = transformBooking;
exports.transformEvent = transformEvent;

//exports.user = user;
//exports.event = events;
//exports.singleEvent = singleEvent;