const { Order, CartItem } = require("../models/order");
const { errorHandler } = require("../helpers/dbErrorHandler");
const sgmail = require("@sendgrid/mail");
sgmail.setApiKey(process.env.SENDGRID_API_KEY);

exports.orderById = (req, res, next, id) => {
  Order.findById(id)
    .populate("products.product", "name price")
    .exec((err, order) => {
      if (err || !order) {
        return res.status(400).json({
          error: errorHandler(err),
        });
      }
      req.order = order;
      next();
    });
};

exports.create = (req, res) => {
  // console.log("CREATE ORDER: ", req.body);
  req.body.order.user = req.profile;
  const order = new Order(req.body.order);
  order.save((error, data) => {
    if (error) {
      return res.status(400).json({
        error: errorHandler(error),
      });
    }
    console.log(`ORDER IS JUST SAVED>>>`, order);

    const emailData = {
      to: "Abhishekgithub2022@gmail.com",
      from: "kitabpasal3@gmail.com",
      subject: `A new order is received`,
      html: `
      <h1>Hey Admin, Somebody just made a purchase in your ecommerce store</h1>
      <h2>Customer name: ${order.user.name}</h2>
      <h2>Customer address: ${order.address}</h2>
      <h2>User's purchase history: ${order.user.history.length} purchase </h2>
      <h2>User's email: ${order.user.email}</h2>
      <h2>Total products: ${order.products.length}</h2>
      <h2>Transaction ID: ${order.transaction_id}</h2>
      <h2>Order status: ${order.status}</h2>
      <h2>Product Details:</h2>
      ${order.products
        .map((p) => {
          return `
        <div>
        <h3>Product Name: ${p.name}</h3>
        <h3>Product Price: ${p.price}</h3>
        <h3>Product Quantity: ${p.count}</h3>
        </div>
        `;
        })
        .join("-------------------------------")}

    <h2>Total order cost: ${order.amount}</h2>
    <p><a>Login to the dashboard</a> to see the order in detail</p>
      
      `,
    };
    sgmail
      .send(emailData)
      .then((sent) => console.log("SENT >>>", sent))
      .catch((err) => console.log("Error>>>", err));

    const emailData2 = {
      to: order.user.email,
      from: "kitabpasal3@gmail.com",
      subject: `Your order is in process`,
      html: `
          <h1>Hey ${req.profile.name}, Thank you for shopping with us.</h1>
          <h2>Total Products: ${order.products.length}</h2>
          <h2>Transaction ID: ${order.transaction_id}</h2>
          <h2>Order status: ${order.status}</h2>
          <h2>Product details:</h2>
          <hr/>
          ${order.products
            .map((p) => {
              return `
            <div>
            <h3>Product Name: ${p.name}</h3>
            <h3>Product Price: ${p.price}</h3>
            <h3>Product Quantity: ${p.count}</h3>
            </div>
            `;
            })
            .join("-------------------------")}
        <h2>Total order cost: ${order.amount}<h2>
        <p>Thank you for shopping with us</p>
      `,
    };

    sgmail
      .send(emailData2)
      .then((sent) => console.log("SENT>>>", sent))
      .catch((err) => console.log("Error >>>>", err));
    res.json(data);
  });
};

exports.listOrders = (req, res) => {
  Order.find()
    .populate("user", "_id name address")
    .sort("-created")
    .exec((err, orders) => {
      if (err) {
        return res.status(400).json({
          error: errorHandler(error),
        });
      }
      res.json(orders);
    });
};

exports.getStatusValues = (req, res) => {
  res.json(Order.schema.path("status").enumValues);
};

exports.updateOrderStatus = (req, res) => {
  Order.updateOne(
    { _id: req.body.orderId },
    { $set: { status: req.body.status } },
    (error, order) => {
      if (error) {
        return res.status(400).json({
          error: errorHandler(error),
        });
      }
      res.json(order);
    }
  );
};
