const request = require('request');
const requestCoord = require('request-promise');
/**
 * Makes a single API request to retrieve the user's IP address.
 * Input:
 *   - A callback (to pass back an error or the IP string)
 * Returns (via Callback):
 *   - An error, if any (nullable)
 *   - The IP address as a string (null if error). Example: "162.245.144.188"
 */
const URL = `https://api.ipify.org?format=json`;
const fetchMyIP = function(callback) {

  // use request to fetch IP address from JSON API
  request(URL,(error,response,body) => {

    // inside the request callback ...
    // error can be set if invalid domain, user is offline, etc.
    if (error) {
      callback(error, null);
      return;
    }
    // if non-200 status, assume server error
    if (response.statusCode !== 200) {
      const msg = `Status Code ${response.statusCode} when fetching IP. Response: ${body}`;
      callback(Error(msg), null);
      return;
    }

    // if we get here, all's well and we got the data
    const IP = JSON.parse(body).ip;
    callback(null, IP);
    
  });
};

const fetchCoordsByIP = function(ip, callback) {
  const curl = 'https://freegeoip.app/json/' + ip;


  requestCoord(curl)
    .then(response => {

      const CoordLatitu = JSON.parse(response).latitude;
      const CoordLongtitu = JSON.parse(response).longitude;
      let data = {latitude:CoordLatitu, longtitude: CoordLongtitu};
      
      callback(null, data);
    
    })
    .catch(error => {
      callback(error,null);
    });


};


/**
 * Makes a single API request to retrieve upcoming ISS fly over times the for the given lat/lng coordinates.
 * Input:
 *   - An object with keys `latitude` and `longitude`
 *   - A callback (to pass back an error or the array of resulting data)
 * Returns (via Callback):
 *   - An error, if any (nullable)
 *   - The fly over times as an array of objects (null if error). Example:
 *     [ { risetime: 134564234, duration: 600 }, ... ]
 */
const fetchISSFlyOverTimes = function(coords, callback) {
  const URL = `https://iss-pass.herokuapp.com/json/?lat=${coords.latitude}&lon=${coords.longtitude}`;

  // use request to fetch IP address from JSON API
  request(URL,(error,response,body) => {

    if (error) {
      callback(error, null);
      return;
    }
    // if non-200 status, assume server error
    if (response.statusCode !== 200) {
      const msg = `Status Code ${response.statusCode} when fetching IP. Response: ${body}`;
      callback(Error(msg), null);
      return;
    }

    // if we get here, all's well and we got the data
    const array = JSON.parse(body).response;
    
    callback(null, array);

  });


};

/**
 * Orchestrates multiple API requests in order to determine the next 5 upcoming ISS fly overs for the user's current location.
 * Input:
 *   - A callback with an error or results.
 * Returns (via Callback):
 *   - An error, if any (nullable)
 *   - The fly-over times as an array (null if error):
 *     [ { risetime: <number>, duration: <number> }, ... ]
 */
const nextISSTimesForMyLocation = function(callback) {
  fetchMyIP((err,ip) => {
    if (err)
      return callback(err,null);
    fetchCoordsByIP(ip, (err,loc) => {
      if (err) {
        return callback(err, null);
      }
      fetchISSFlyOverTimes(loc,(err,nextPasses) => {
        if (err) {
          return callback(err, null);
        }
        callback(null,nextPasses);
      });
    });
  });

};



module.exports = { fetchMyIP, fetchCoordsByIP, fetchISSFlyOverTimes, nextISSTimesForMyLocation};