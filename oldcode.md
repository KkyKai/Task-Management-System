const express = require('express');
const connection = require('../sqlconnection');

const router = express.Router();

router.get('/accounts', (req, res) => {
  // Perform a query
  connection.query('SELECT * FROM accounts;', (error, results) => {
    console.log(results);
    if (error) {
      console.error('Error querying database:', error);
      res.status(500).send('Error querying database');
      return;
    }
  });
});

module.exports = router;

//example folder structure
project/
├── app.js (or index.js)
├── routes/
│   ├── authRouter.js
│   ├── productRouter.js
│   └── orderRouter.js
├── controllers/
│   ├── authController.js
│   ├── productController.js
│   └── orderController.js
└── models/
    ├── userModel.js
    ├── productModel.js
    └── orderModel.js

// Example app.js (or index.js)
const express = require('express');
const app = express();

// Import routers
const authRouter = require('./routes/authRouter');
const productRouter = require('./routes/productRouter');
const orderRouter = require('./routes/orderRouter');

// Middleware for parsing JSON bodies
app.use(express.json());

// Routes
app.use('/api/auth', authRouter);
app.use('/api/products', productRouter);
app.use('/api/orders', orderRouter);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


