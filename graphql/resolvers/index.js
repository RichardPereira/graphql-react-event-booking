
const bcrypt = require("bcryptjs");
const Event = require('../../models/event');
const User = require('../../models/user');
const Booking = require('../../models/booking');

const transformEvent = event => {
    return {
        ...event._doc,
        _id: event.id,
        date: new Date(event._doc.date).toISOString(),
        creator: user.bind(this, event._doc.creator)
    }

};

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
        return transformEvent (event);
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


module.exports = {
    events: async () => {
        try {
            const events = await Event.find() // asyc event: GraphQl need to wait to finished           
                ;
            return events.map(event => {
                return transformEvent (event);
            });
        }
        catch (err) {
            console.log(err);
            throw err;
        }
    },
    booking: async () => {
        try {
            const bookings = await Booking.find();
            return bookings.map(booking => {
                return {
                    ...booking._doc,
                    _id: booking.id,
                    user: user.bind(this, booking._doc.user),
                    event: singleEvent.bind(this, booking._doc.event),
                    createdAt: new Date(booking._doc.createdAt).toISOString(),
                    updatedAt: new Date(booking._doc.updatedAt).toISOString()
                };
            });

        } catch (err) {
            throw err;
        }
    },
    createEvent: async (args) => {
        const event = new Event({
            title: args.evenInput.title,
            description: args.evenInput.description,
            price: +args.evenInput.price,
            date: new Date(args.evenInput.date),
            creator: '5d61589462b8a8280cc9cb61'
        });
        let createdEvent;
        try {
            const result = await event.save();
            createdEvent = transformEvent(result);

            const creator = await User.findById('5d61589462b8a8280cc9cb61') // dummy temp Id
                ;
            if (!creator) {
                throw new Error('User not found.');
            }
            creator.createdEvents.push(event); // associate the Event to the User
            await creator.save();
            return createdEvent;
        }
        catch (err) {
            console.log(err);
            throw err;
        }
    },
    createUser: async args => {
        try {
            const existingUser = await User.findOne({ email: args.userInput.email });
            if (existingUser) {
                throw new Error('User exists already.');
            }
            const hashedPassword = await bcrypt
                .hash(args.userInput.password, 12);
            const user = new User({
                email: args.userInput.email,
                password: hashedPassword
            });
            const result = await user.save();
            return { ...result._doc, password: null };
        }
        catch (err) {
            throw err;
        }
    },
    bookEvent: async args => {
        try {
            const fetchedEvent = await Event.findOne({
                _id: args.eventId
            });
            const booking = new Booking({
                user: '5d61589462b8a8280cc9cb61',
                event: fetchedEvent

            });
            const result = await booking.save();
            return {
                ...result._doc,
                _id: result.id,
                createdAt: new Date(result._doc.createdAt).toISOString(),
                updatedAt: new Date(result._doc.updatedAt).toISOString(),
                user: user.bind(this, booking._doc.user),
                event: singleEvent.bind(this, booking._doc.event),
            };

        } catch (error) {
            throw error
        }
    },
    cancelBooking: async args => {
        try {
            const booking = await Booking.findById(args.bookingId).populate('event');
            const event = transformEvent(booking.event);
            await Booking.deleteOne({ _id: args.bookingId });
            return event;
        } catch (error) {
            throw error;
        }
    }

};