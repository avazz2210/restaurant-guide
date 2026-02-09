// Netlify Serverless Function
// This runs on Netlify's servers (backend) and keeps your API key safe

const https = require('https');

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Get the restaurant info from the request
    const { restaurantName, state, city } = JSON.parse(event.body);

    // Get API key from environment variable (hidden from users!)
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;

    if (!apiKey) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'API key not configured' })
      };
    }

    // Build search query
    const searchQuery = `${restaurantName}${city ? ' ' + city : ''}${state ? ' ' + state : ''}`;

    console.log('Searching for:', searchQuery);

    // Step 1: Search for the place using Text Search
    const searchResults = await callGoogleAPI(
      `/maps/api/place/textsearch/json?query=${encodeURIComponent(searchQuery)}&key=${apiKey}`
    );

    if (!searchResults.results || searchResults.results.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          error: 'Restaurant not found',
          message: `Could not find "${searchQuery}" on Google Places`
        })
      };
    }

    // Get the first result
    const place = searchResults.results[0];
    const placeId = place.place_id;

    // Step 2: Get detailed information using Place Details
    const details = await callGoogleAPI(
      `/maps/api/place/details/json?place_id=${placeId}&fields=name,formatted_address,formatted_phone_number,website,opening_hours,rating,user_ratings_total,geometry,address_components&key=${apiKey}`
    );

    if (!details.result) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Could not fetch place details' })
      };
    }

    const result = details.result;

    // Extract address components
    let streetAddress = '';
    let extractedCity = '';
    let extractedState = '';
    let zipCode = '';
    let county = '';

    if (result.address_components) {
      result.address_components.forEach(component => {
        if (component.types.includes('street_number')) {
          streetAddress = component.long_name + ' ';
        }
        if (component.types.includes('route')) {
          streetAddress += component.long_name;
        }
        if (component.types.includes('locality')) {
          extractedCity = component.long_name;
        }
        if (component.types.includes('administrative_area_level_1')) {
          extractedState = component.short_name;
        }
        if (component.types.includes('postal_code')) {
          zipCode = component.long_name;
        }
        if (component.types.includes('administrative_area_level_2')) {
          county = component.long_name;
        }
      });
    }

    // Format hours of operation
    let hoursOfOperation = '';
    if (result.opening_hours && result.opening_hours.weekday_text) {
      hoursOfOperation = result.opening_hours.weekday_text.join(', ');
    }

    // Return the extracted data
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        data: {
          name: result.name,
          address: streetAddress.trim(),
          city: extractedCity,
          state: extractedState,
          zip: zipCode,
          county: county,
          phone: result.formatted_phone_number || '',
          websiteURL: result.website || '',
          hoursOfOperation: hoursOfOperation,
          yelpRating: result.rating ? result.rating.toString() : '',
          googleRating: result.rating,
          totalRatings: result.user_ratings_total,
          latitude: result.geometry?.location?.lat,
          longitude: result.geometry?.location?.lng
        }
      })
    };

  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        error: 'Failed to fetch restaurant data',
        message: error.message
      })
    };
  }
};

// Helper function to call Google API
function callGoogleAPI(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'maps.googleapis.com',
      path: path,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.status === 'OK' || parsed.status === 'ZERO_RESULTS') {
            resolve(parsed);
          } else {
            reject(new Error(`Google API error: ${parsed.status}`));
          }
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}
