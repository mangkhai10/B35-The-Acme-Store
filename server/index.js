// Import necessary modules and set up the Express app
const {
    client,
    createTables,
    createUser,
    createProduct,
    createFavorite,
    fetchUsers,
    fetchProducts,
    fetchFavorites,
    destroyFavorite,
  } = require('./db');
  const express = require('express');
  const app = express();
  app.use(express.json());
  
  app.get('/api/products', async (req, res, next) => {
    try {
      res.send(await fetchProducts());
    } catch (ex) {
      next(ex);
    }
  });
  
  app.get('/api/users', async (req, res, next) => {
    try {
      res.send(await fetchUsers());
    } catch (ex) {
      next(ex);
    }
  });
  
  app.get('/api/users/:id/favorites', async (req, res, next) => {
    try {
      res.send(await fetchFavorites(req.params.id));
    } catch (ex) {
      next(ex);
    }
  });
  
  app.delete('/api/users/:userId/favorites/:id', async (req, res, next) => {
    try {
      await destroyFavorite({ user_id: req.params.userId, id: req.params.id });
      res.sendStatus(204);
    } catch (ex) {
      next(ex);
    }
  });
  
  app.post('/api/users/:id/favorites', async (req, res, next) => {
    try {
      res.status(201).send(await createFavorite({ user_id: req.params.id, product_id: req.body.product_id }));
    } catch (ex) {
      next(ex);
    }
  });
  
  // Initialize the server
  const init = async () => {
    const port = process.env.PORT || 3000;
  
    try {
      // Connect to the database
      await client.connect();
      console.log('Connected to the database');
  
      // Create database tables
      await createTables();
      console.log('Tables created');
  
      // Create sample users and products
      const [moe, lucy, larry, ethyl] = await Promise.all([
        createUser({ username: 'moe', password: 'moe_pw' }),
        createUser({ username: 'lucy', password: 'lucy_pw' }),
        createUser({ username: 'larry', password: 'larry_pw' }),
        createUser({ username: 'ethyl', password: 'ethyl_pw' }),
      ]);
  
      const [dancing, singing, plateSpinning, juggling] = await Promise.all([
        createProduct({ name: 'dancing' }),
        createProduct({ name: 'singing' }),
        createProduct({ name: 'plate spinning' }),
        createProduct({ name: 'juggling' }),
      ]);
  
      // Log users and products after creation
      console.log('Users:', await fetchUsers());
      console.log('Products:', await fetchProducts());
  
      const userFavorites = await Promise.all([
        createFavorite({ user_id: moe.id, product_id: plateSpinning.id }),
        createFavorite({ user_id: moe.id, product_id: dancing.id }),
        createFavorite({ user_id: ethyl.id, product_id: singing.id }),
        createFavorite({ user_id: ethyl.id, product_id: juggling.id }),
      ]);
  
      // Log favorites and perform deletion
      console.log('User favorites:', await fetchFavorites(moe.id));
      await destroyFavorite({ user_id: moe.id, id: userFavorites[0].id });
      console.log('User favorites after deletion:', await fetchFavorites(moe.id));
  
      // Start the server
      app.listen(port, () => console.log(`Listening on port ${port}`));
    } catch (err) {
      console.error('Initialization error:', err.message);
    }
  };
  
  // Call the initialization function
  init();
  