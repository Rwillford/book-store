const express = require('express');
const path = require('path');
const { ApolloServer } = require('apollo-server-express');
const { authMiddleware } = require('./utils/auth');
const { typeDefs, resolvers } = require('./schemas');
const db = require('./config/connection');


const app = express();
const PORT = process.env.PORT || 3001;

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: authMiddleware
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());


const startApolloServer = async (typeDefs, resolvers) => {
  await server.start();
  //intergrate our Apollo server with Express applications as middleWare
  server.applyMiddleware({ app });

  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/build')));
  }

  app.get('*', (req,res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
  })

  app.get('*', (req, res) => {
    res.status(404).sendFile(path.join(__dirname, './public/404.html'));
  });

  db.once('open', () => {
    app.listen(PORT, () => {
      console.log(`API server running on port ${PORT}!`);
      //log where we can go to test our GQL API
      console.log(`Use GraphQL at http://localhost:${PORT}${server.graphqlPath}`);
    })
  })
};

//Call the async function to start the server
startApolloServer(typeDefs, resolvers);
