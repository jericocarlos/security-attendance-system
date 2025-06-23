const bcrypt = require("bcryptjs");

const password = "PASSword1234!!"; // Example password to hash
const saltRounds = 10;

bcrypt.hash(password, saltRounds, (err, hash) => {
  if (err) throw err;
  console.log("Hashed Password:", hash);
});