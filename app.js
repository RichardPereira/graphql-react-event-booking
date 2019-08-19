const express = require('express');
const bodyParser = require('body-parser');
const graphqlHttp = require('express-graphql');
const { buildSchema } = require('graphql');
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const Event = require('./models/event');
const User = require('./models/user');

const app = express();

app.use(bodyParser.json());

//fetching User by their Id
const user = userId => {
    return User.findById(userId)
        .then(user => {
            return { ...user._doc, id: user.id }
        })
        .catch(err => {
            throw err;
        });
};

app.use('/graphql', graphqlHttp({
    schema: buildSchema(`
            type Event {
                _id: ID!
                title: String!
                description: String!
                price: Float!
                date: String!
                creator: User!
            }
            type User {
                _id: ID!
                email: String!
                password: String
                createdEvents: [Event!]

            }

            input UserInput {
                email: String!
                password: String!
            }

            input EventInput{
                title: String!
                description: String!
                price: Float!
                date: String!
            }

            type rootQuery {                 
                events: [Event!]!
            }

            type rootMutation {
                createEvent(evenInput: EventInput): Event
                createUser(userInput: UserInput) : User
            }

            schema {
                query: rootQuery
                mutation: rootMutation
        }
    `),                     // where to find the schemas, queries, result...etc
    rootValue: {
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
                    createdEvent = { ...result._doc, _id: result._doc._id.toString() };
                    return User.findById('5d5ac1306ca80d49a4c8971a') // dummy temp Id
                })
                .then(user => {
                    if (!user) {
                        throw new Error('User not found.');
                    }
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
    },
    graphiql: true //UI 
})

);

mongoose.connect(`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@eventbooking-nznmx.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`, { useNewUrlParser: true })
    .then(() => {
        app.listen(3000);
    }).catch(err => {
        console.log(err);
    });

