const express = require('express');
const bodyParser = require('body-parser');
const graphqlHttp = require('express-graphql');
const { buildSchema } = require('graphql');
const mongoose = require("mongoose");

const Event = require('./models/event');

const app = express();

app.use(bodyParser.json());

app.use('/graphql', graphqlHttp({
    schema: buildSchema(`
            type Event {
                _id: ID!
                title: String!
                description: String!
                price: Float!
                date: String!
            }
            type User {
                _id: ID!
                email: String!
                password: String

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
                            return { ...event._doc } //remove the metadata
                        });
                    }
                )
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
                date: new Date(args.evenInput.date)
            });
            return event // wait to complete
                .save()
                .then(result => {
                    console.log(result);
                    return { ...result._doc };
                })
                .catch(err => {
                    console.log(err);
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

