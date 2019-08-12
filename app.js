const express = require('express');
const bodyParser = require('body-parser');
const graphqlHttp = require('express-graphql');
const { buildSchema } = require('graphql');

const app = express();

app.use(bodyParser.json());

app.use('/graphql', graphqlHttp({
    schema: buildSchema(`
    type rootQuery {                 
        events: [String!]!
    }

    type rootMutation {
        createEvent(name: String): String

    }

    schema {
        query: rootQuery
        mutation: rootMutation
    }
  
  
  `),                     // where to find the schemas, queries, result...etc
    rootValue: {}
}));



app.listen(3000);