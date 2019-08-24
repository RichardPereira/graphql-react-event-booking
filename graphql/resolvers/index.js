
const bcrypt = require("bcryptjs");
const Event = require('../../models/event');
const User = require('../../models/user');


const events = async eventIds => {
    try {
        const events = await Event.find({ _id: { $in: eventIds } });
        return events.map(event => {
            return {
                ...event._doc,
                _id: event.id,
                date: new Date(event._doc.date).toISOString(),
                creator: user.bind(this, event._doc.creator)
            };
        });
    }
    catch (err) {
        throw err;
    }
};

//fetching User by their Id
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
                return {
                    ...event._doc,
                    _id: event.id,
                    password: null,
                    date: new Date(event._doc.date).toISOString(),
                    creator: user.bind(this, event._doc.creator)
                };
            });
        }
        catch (err) {
            console.log(err);
            throw err;
        }
    },
    createEvent: async (args) => {
        const event = new Event({
            title: args.evenInput.title,
            description: args.evenInput.description,
            price: +args.evenInput.price,
            date: new Date(args.evenInput.date),
            creator: '5d5e977f0eef6436ec2e3638'
        });
        let createdEvent;
        try {
            const result = await event.save();
            createdEvent = {
                ...result._doc,
                date: new Date(event._doc.date).toISOString(),
                _id: result._doc._id.toString(),
                creator: user.bind(this, result._doc.creator)
            };
            const user = await User.findById('5d5e977f0eef6436ec2e3638') // dummy temp Id
                ;
            if (!user) {
                throw new Error('User not found.');
            }
            user.createdEvents.push(event); // associate the Event to the User
            const result_1 = await user.save();
            return createdEvent;
        }
        catch (err) {
            console.log(err);
            throw err;
        }
    },
    createUser: async args => {
        try {
            const user = await User.findOne({ email: args.userInput.email });
            if (user) {
                throw new Error('User exists already.');
            }
            const hashedPassword = await bcrypt
                .hash(args.userInput.password, 12);
            const user_1 = new User({
                email: args.userInput.email,
                password: hashedPassword
            });
            const result = await user_1.save();
            return { ...result._doc, password: null };
        }
        catch (err) {
            throw err;
        }
    }
};