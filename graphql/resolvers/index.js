
const bcrypt = require("bcryptjs");
const Event = require('../../models/event');
const User = require('../../models/user');


const events = eventIds => {
    return Event.find({ _id: { $in: eventIds } })
        .then(events => {
            return events.map(event => {
                return {
                    ...event._doc,
                    _id: event.id,
                    creator: user.bind(this, event.creator)
                };
            });
        })
        .catch(err => {
            throw err;
        });
};

//fetching User by their Id
const user = userId => {
    return User.findById(userId)
        .then(user => {
            return {
                ...user._doc,
                id: user.id,
                password: null,
                CreatedEvents: events.bind(this, user._doc.CreatedEvents)
            };
        })
        .catch(err => {
            throw err;
        });
};


module.exports = {
    events: () => {
        return Event.find() // asyc event: GraphQl need to wait to finished           
            .then(
                events => {
                    return events.map(event => {
                        return {
                            ...event._doc,
                            _id: event.id,
                            creator: user.bind(this, event._doc.creator)
                        };
                    });
                })
            .catch(err => {
                console.log(err);
                throw err;
            })
    },
    createEvent: (args) => {
        const event = new Event({
            title: args.evenInput.title,
            description: args.evenInput.description,
            price: +args.evenInput.price,
            date: new Date(args.evenInput.date),
            creator: '5d5ac1306ca80d49a4c8971a'
        });
        let createdEvent;
        return event // wait to complete
            .save()
            .then(result => {
                createdEvent = {
                    ...result._doc,
                    _id: result._doc._id.toString(),
                    creator: user.bind(this, result._doc.creator)
                };
                return User.findById('5d5ac1306ca80d49a4c8971a') // dummy temp Id
            })
            .then(user => {
                if (!user) {
                    throw new Error('User not found.');
                }
                console.log(event);
                user.CreatedEvents.push(event) // associate the Event to the User
                return user.save();
            })
            .then(result => {
                return createdEvent;
            })
            .catch(err => {
                console.log(err);
                throw err;
            });
    },
    createUser: args => {
        return User.findOne({ email: args.userInput.email })
            .then(user => {
                if (user) {
                    throw new Error('User exists already.')
                }
                return bcrypt
                    .hash(args.userInput.password, 12);
            })
            .then(hashedPassword => {
                const user = new User({
                    email: args.userInput.email,
                    password: hashedPassword
                });
                return user.save();
            })
            .then(result => {
                return { ...result._doc, password: null };
            })
            .catch(err => {
                throw err;
            });
    }
};