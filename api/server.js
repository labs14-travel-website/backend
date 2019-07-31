// Import dependencies and general middleware
const express = require('express');
const googleMapsClient = require('@google/maps').createClient({
  key: process.env.PLACES_API_KEY,
  Promise,
});
const configureMiddleware = require('./middleware.js');

const server = express();
const decodeToken = require('./auth/token.js');
const authorize = require('./auth/login.js');

// Pass server through middleware file
configureMiddleware(server);

// require("../config/passport.js")(passport);

// Custom restricted middleware import
// const restricted = require("../auth/restricted.js");

// Import various split API routes
const usersRouter = require('../users/usersRouter.js');
// const authRouter = require("../auth/authRouter.js");
// Router assignments
server.use('/api/users', usersRouter);
server.post('/api/auth', decodeToken, authorize, (req, res) => {
  // id, token, email, name
  // console.log("req.headers.authorization", req.headers.authorization);
  // console.log("res.googleId", res.googleId);
  res.json({
    message: 'success auth',
  });
});
/** 
 * @description Filters results from a places query, and organizes it by ratings. Parses the data and adds to Database if needed.
 * @return  {string} name
 * @return {string} placeId
 * @return {string} price
 * @return {float} rating
 * @return {array} types
 * @return {string} picture
*/

server.get('/a', async (req, res) => {
  try {
    // gets a results array of places objects
    // query.q should be a city e.g. San Francisco
    const { json: { results: city } } = await googleMapsClient.places({
      query: req.query.q,
      language: 'en',
    }).asPromise();

    const { geometry: { location } } = city[0];

    const { json: { results } } = await googleMapsClient.places({
      query: 'stuff to do',
      location: Object.values(location),
      language: 'en',
    }).asPromise();

    const places = await Promise.all(results.filter(({ photos }) => photos).map(async ({
      name,
      place_id: placeId,
      price_level: price,
      photos,
      rating,
      types,
    }) => {
      const picRef = photos[0].photo_reference;
      const pictureReq = await googleMapsClient.placesPhoto({
        photoreference: picRef,
        maxwidth: 400,
      }).asPromise();
      const picture = `https://${pictureReq.req.socket.servername}${pictureReq.req.path}`;

      return {
        name,
        placeId,
        price,
        rating,
        types,
        picture,
      };
    }));

    // parse data and cache to db if needed

    res.json({
      status: 'success',
      places: places.sort((a, b) => (b.rating - a.rating)),
    });
  } catch ({message}) {

    res.json({message});
  }
});
/**
 * @description Searches for a specific place and relevant info. Returns geographical information, photo references, and reviews.
 */
server.get('/a/:placeid', async (req, res) => {
  try {
    const data = await googleMapsClient.place({
      placeid: req.params.placeid,
      language: 'en',
    }).asPromise();

    res.json({
      status: 'success',
      data,
    });
  } catch (error) {
    console.log(error); // eslint-disable-line
    res.status(500).json({
      status: 'error',
      error,
    });
  }
});
 
// The following example is a search request for places of type 'restaurant' within a 1500m radius of a point in Sydney, Australia, containing the word 'cruise':
// https://github.com/googlemaps/google-maps-services-js/blob/master/spec/e2e/places-spec.js EXAMPLE TEST CODE
// Example nearby req URL: https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=-33.8670522,151.1957362&radius=1500&type=restaurant&keyword=cruise&key=YOUR_API_KEY
// URL that we have to target: https://maps.googleapis.com/maps/api/place/nearbysearch/output?parameters

server.get('/a/nearby', async (req, res) => {
  try {
    const nearby = await googleMapsClient.placesNearby({
      language: 'en',
      location: [33.8670522, 151.1957362],
      radius: 2000,
      opennow: true
    }).asPromise();

    res.json({
      status: 'success',
      nearby,
    });
  } catch (error) {
    console.log(error); // eslint-disable-line
    res.status(500).json({
      status: 'error',
      error,
    });
  }
});


server.get('/a', async (req, res) => {
  try {
    // gets a results array of places objects
    // query.q should be a city e.g. San Francisco
    const { json: { results: city } } = await googleMapsClient.places({
      query: req.query.q,
      language: 'en',
    }).asPromise();

    const { geometry: { location } } = city[0];

    const { json: { results } } = await googleMapsClient.places({
      query: 'stuff to do',
      location: Object.values(location),
      language: 'en',
    }).asPromise();

    const places = await Promise.all(results.filter(({ photos }) => photos).map(async ({
      name,
      place_id: placeId,
      price_level: price,
      photos,
      rating,
      types,
    }) => {
      const picRef = photos[0].photo_reference;
      const pictureReq = await googleMapsClient.placesPhoto({
        photoreference: picRef,
        maxwidth: 400,
      }).asPromise();
      const picture = `https://${pictureReq.req.socket.servername}${pictureReq.req.path}`;

      return {
        name,
        placeId,
        price,
        rating,
        types,
        picture,
      };
    }));

    // parse data and cache to db if needed

    res.json({
      status: 'success',
      places: places.sort((a, b) => (b.rating - a.rating)),
    });
  } catch ({message}) {

    res.json({message});
  }
});

server.get('/a/:placeid', async (req, res) => {
  try {
    const data = await googleMapsClient.place({
      placeid: req.params.placeid,
      language: 'en',
    }).asPromise();

    res.json({
      status: 'success',
      data,
    });
  } catch (error) {
    console.log(error); // eslint-disable-line
    res.status(500).json({
      status: 'error',
      error,
    });
  }
});

// The following example is a search request for places of type 'restaurant' within a 1500m radius of a point in Sydney, Australia, containing the word 'cruise':
// https://github.com/googlemaps/google-maps-services-js/blob/master/spec/e2e/places-spec.js EXAMPLE TEST CODE
// Example nearby req URL: https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=-33.8670522,151.1957362&radius=1500&type=restaurant&keyword=cruise&key=YOUR_API_KEY
// URL that we have to target: https://maps.googleapis.com/maps/api/place/nearbysearch/output?parameters

server.get('/a/nearby', async (req, res) => {
  try {
    const nearby = await googleMapsClient.placesNearby({
      language: 'en',
      location: [33.8670522, 151.1957362],
      radius: 2000,
      opennow: true
    }).asPromise();

    res.json({
      status: 'success',
      nearby,
    });
  } catch (error) {
    console.log(error); // eslint-disable-line
    res.status(500).json({
      status: 'error',
      error,
    });
  }
});

// Generic / route for initial server online status check
const projectName = process.env.PROJECT_NAME || 'test';
server.get('/', (req, res) => {
  res.send(`The ${projectName} server is up and running!`);
});

// Server export to be used in index.js
module.exports = server;

// Login sign-up post
// middleware checking the token
