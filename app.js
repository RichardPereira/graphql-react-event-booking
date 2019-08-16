const express = require('express');
const bodyParser = require('body-parser');
const graphqlHttp = require('express-graphql');
const { buildSchema } = require('graphql');

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



app.listen(3000);