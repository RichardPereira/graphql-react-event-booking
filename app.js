const express = require('express');
const bodyParser = require('body-parser');
const graphqlHttp = require('express-graphql');
const mongoose = require("mongoose");
const app = express();
const graphQlSchema = require('./graphql/schema/index');
const graphQlResolvers = require('./graphql/resolvers/index');

app.use(bodyParser.json());

app.use('/graphql', graphqlHttp({                     // where to find the schemas, queries, result...etc
    schema: graphQlSchema,
    rootValue: graphQlResolvers,
    graphiql: true //UI 
    })
);

mongoose.connect(`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@eventbooking-nznmx.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`, { useNewUrlParser: true })
    .then(() => {
        app.listen(3000);
    }).catch(err => {
        console.log(err);
    });