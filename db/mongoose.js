const mongoose = require("mongoose");
const confidentials = require("../confidentials");

mongoose.connect(confidentials.mongodbURL, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
});
