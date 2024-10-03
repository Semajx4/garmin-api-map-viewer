import express from './config/express'
import { connect } from './config/db';
import Logger from './config/logger'
import { fetchAndStoreData } from './app/services/locationFetcher'; // Update with the correct path
import cron from 'node-cron';
import axios from 'axios';

const app = express();
const port = process.env.PORT || 8080;

// Connect to MySQL on start
async function main() {
    try {
        await connect();

        cron.schedule('*/10 * * * *', async () => {
            try {
              // Make a POST request to your own server
              await axios.post('http://localhost:8080/api/v1/location');

              Logger.info('POST request successful');
            } catch (error) {
              Logger.error('Error making POST request:', error);
            }
          });
        app.listen(port, () => {
            Logger.info('Listening on port: ' + port)
        });
    } catch (err) {
        Logger.error('Unable to connect to MySQL. '+ err)
        process.exit(1);
    }
}

main().catch(err => Logger.error(err));
