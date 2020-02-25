const express = require('express');
const Login = require('../models/login');
const auth = require('../middlewares/auth');

const router = new express.Router();

// Create new login (anonymous)
router.post('/login/create', async (req, res) => {
  // Router only focuses on router items since the model is taking care of the data integrity
  const login = new Login(req.body);

  try {
    await login.save();
    const token = await login.generateAuthToken();
    res.status(201).send({ token });
  } catch (e) {
    let themsg = (e.name === 'ValidationError') ? e.message : process.env.MSG_LOGIN_CREATE_FAILED;
    res.status(400).send({ 'error': themsg });
  }
});

// Simple login (anonymous)
router.post('/login', async (req, res) => {
  try {
    // static Login.ValidateCredentials keeps the router from having to perform the validation itself
    const login = await Login.ValidateCredentials(req.body.email, req.body.password);
    // ValidateCredentials returns a login object if the login is valid, so now we can call the generateAuthToken() of the login object
    const token = await login.generateAuthToken();
    res.send({ token });
  } catch (e) {
    res.status(401).send();
  }
});

// logout (auth required)
router.post('/logout', auth, async (req, res) => {
  try {
    // User can have multiple logins, we're only getting ride of the current login
    req.user.tokens = req.user.tokens.filter(token => token.token !== req.token);
    await req.user.save();
    res.send(process.env.MSG_LOGOUT_SUCCESS);
  } catch (e) {
    res.status(500).send();
  }
});

// dump all login tokens (auth required)
router.post('/logout/all', auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.send(process.env.MSG_LOGOUT_ALL_SUCCESS);
  } catch (e) {
    res.status(500).send();
  }
});

router.get('/login/profile', auth, async (req, res) => {
  res.send(req.user);
});

// update login profile  (auth required)
router.patch('/login', auth, async (req, res) => {
  const updates = Object.keys(req.body);
  // Only allow certain attributes to be updated. Perhaps we can put this in the .env file?
  const allowedUpdates = ['email', 'password', 'name'];
  const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

  if (!isValidOperation) {
    return res.status(400).send({ error: 'Invalid updates!' });
  }

  try {
    updates.forEach(update => req.user[update] = req.body[update]);
    await req.user.save();
    res.send(req.user);
  } catch (e) {
    res.status(400).send(e);
  }
});

// Remove login from collection (auth required)
router.delete('/login', auth, async (req, res) => {
  try {
    // Require the email address and password on the delete request, not just the jwt
    const login = await Login.ValidateCredentials(req.body.email, req.body.password);
    await req.user.remove();
    res.send(process.env.MSG_LOGIN_DELETE_SUCCESS);
  } catch (e) {
    res.status(500).send();
  }
});

module.exports = router;