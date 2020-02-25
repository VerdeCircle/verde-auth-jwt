const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const MSG_AUTHENTICATION_FAILED = process.env.MSG_AUTHENTICATION_FAILED;

// Client level password strength is useful, but always ensure strength at the server level
const PASSWORD_REGEX = (process.env.PASSWORD_REGEX === 'STRONG')
  ? '^(?=.{8,})(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*\\W).*$'
  : '^(?=.{7,})(((?=.*[A-Z])(?=.*[a-z]))|((?=.*[A-Z])(?=.*[0-9]))|((?=.*[a-z])(?=.*[0-9]))).*$'
;

const loginSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: true,
    trim: true,
    lowercase: true,
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error('Email is invalid');
      }
    }
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    trim: true,
    validate(value) {
      if (!new RegExp(PASSWORD_REGEX.toString(), "g").test(value)) {
        throw new Error('Password is not strong enough.');
      }
    }
  },
  name: {
    type: String,
    trim: true
  },
  verified: {
    type: Boolean,
    default: false
  },
  tokens: [{
    token: {
      type: String,
      required: true
    }
  }]
}, {
  timestamps: true
});

loginSchema.methods.toJSON = function () {
  // Strip out the password and token(s) here instead of hoping it's done at the router level
  const login = this;
  const loginObject = login.toObject();

  delete loginObject.password;
  delete loginObject.tokens;
  delete loginObject.verified;

  return loginObject;
};

loginSchema.methods.generateAuthToken = async function () {
  const login = this;
  const token = jwt.sign({ _id: login._id.toString() }, process.env.JWT_SECRET);
  login.tokens = login.tokens.concat({ token });
  try {
    await login.save();
  } catch (errr) {
    throw new Error(MSG_AUTHENTICATION_FAILED);
  }

  return token;
};

loginSchema.statics.ValidateCredentials = async (email, password) => {
  try {
    const login = await Login.findOne({ email });
    if (!login) throw new Error(MSG_AUTHENTICATION_FAILED);

    const isMatch = await bcrypt.compare(password, login.password);
    if (!isMatch) throw new Error(MSG_AUTHENTICATION_FAILED);

    return login;
  } catch (err) {
    throw new Error(MSG_AUTHENTICATION_FAILED);
  }
};

loginSchema.pre('save', async function (next) {
  // ensure encrypted passwords only and prevent someone from faking verified
  const login = this;
  if (login.isModified('verified') && login.isNew) throw new Error(MSG_AUTHENTICATION_FAILED);

  if (login.isModified('password')) {
    login.password = await bcrypt.hash(login.password, 10);
  }

  next();
});

const Login = mongoose.model('Login', loginSchema);

module.exports = Login;