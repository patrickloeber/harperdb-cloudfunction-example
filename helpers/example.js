'use strict';

const config = require('./config.js')

const customValidation = async (request, logger) => {
  let username = config.HDB_USER
  let password = config.HDB_PASSWORD
  let auth = "Basic " + Buffer.from(username + ':' + password).toString('base64')
  let ok = auth === request.headers.authorization

  if (!ok) {
    let errorString = 'Sorry, there was an error authenticating your request';
    logger.error(errorString);
    throw new Error(errorString);
  }
  return request;
};

module.exports = customValidation;
