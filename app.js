const express = require('express');
const bodyParser = require('body-parser');
const graphqlHttp = require('express-graphql');
const { buildSchema } = require('graphql');

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
            type rootQuery {                 
                events: [Event!]!
            }

            type rootMutation {
                createEvent(name: String): Event
            }

            schema {
                query: rootQuery
                mutation: rootMutation
        }
    `),                     // where to find the schemas, queries, result...etc
        rootValue: {
            events: () => {
                return ['Romantic Cooking', 'Sailing', 'Camping']
            },
            createEvent: (args) => {
                const eventName = args.name;
                return eventName;
            }
        },
        graphiql: true //UI 
    })

);



app.listen(3000);