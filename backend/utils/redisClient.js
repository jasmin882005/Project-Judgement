// const redis = require('redis');

// // Create Redis client with custom reconnect strategy
// const client = redis.createClient({
//   socket: {
//     reconnectStrategy: (retries) => {
//       if (retries > 5) {
//         console.error('Redis retry limit reached.');
//         return new Error('Retry attempts exhausted');
//       }
//       console.warn(`Redis retry attempt #${retries}`);
//       return 1000 * retries; // e.g., 1s, 2s, 3s...
//     }
//   }
// });

// // Redis error logging
// client.on('error', (err) => {
//   console.error('Redis Client Error:', err.message);
// });

// // Connect Redis with retry logic
// client.connect()
//   .then(() => console.log('Redis connected'))
//   .catch((err) => console.error('Redis initial connection failed:', err.message));

// module.exports = client;
