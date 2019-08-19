const express = require('express');
const bodyParser = require('body-parser');
const graphqlHttp = require('express-graphql');
const { buildSchema } = require('graphql');
const mongoose = require("mongoose");

const app = express();

const events = []; //temp until database

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
            return events;
        },
        createEvent: (args) => {
            const event = {
                _id: Math.random().toString(),
                title: args.evenInput.title,
                description: args.evenInput.description,
                price: +args.evenInput.price,
                date: args.evenInput.date
            };
            events.push(event) // Insert new events to the Event List

            return event;
        }
    },
    graphiql: true //UI 
})

);

// mongoose.connect(`mongodb+srv://${process.env.MONGO_USER}:DqxJRduDF5CDKhnf@eventbooking-nznmx.mongodb.net/events-rect-dev?retryWrites=true&w=majority`,{ useNewUrlParser: true })
//                                 .then( () => {
//                                     app.listen(3000);
//                                 }).catch(err => {
//                                     console.log(err);
//                                 });

mongoose.connect(`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@eventbooking-nznmx.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`,{ useNewUrlParser: true })
                                .then( () => {
                                    app.listen(3000);
                                }).catch(err => {
                                    console.log(err);
                                });

