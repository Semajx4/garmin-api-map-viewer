import express from 'express';
import axios from 'axios';
import { parseString } from 'xml2js';
import Logger from '../../config/logger';

// Fetch and store data from the KML file
function fetchAndStoreData(): Promise<mapPing> {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await axios.get('https://share.garmin.com/Feed/Share/5R9V2');
      const xmlData: string = response.data;
      // Logger.info(xmlData);
      // Parse KML file
      parseString(xmlData, (err, result) => {
        if (err) {
          Logger.error('Error parsing KML file:', err);
          return;
        }

          const userName = result.kml.Document[0].Folder[0].Placemark[0].ExtendedData[0].Data.find((dataItem: any) => dataItem.$.name === 'Name')?.value[0];
          const textMessage = result.kml.Document[0].Folder[0].Placemark[0].ExtendedData[0].Data.find((dataItem: any) => dataItem.$.name === 'Text')?.value[0].toString();
          const latitude = result.kml.Document[0].Folder[0].Placemark[0].ExtendedData[0].Data.find((dataItem: any) => dataItem.$.name === 'Latitude')?.value[0];
          const longitude = result.kml.Document[0].Folder[0].Placemark[0].ExtendedData[0].Data.find((dataItem: any) => dataItem.$.name === 'Longitude')?.value[0];
          const velocity = result.kml.Document[0].Folder[0].Placemark[0].ExtendedData[0].Data.find((dataItem: any) => dataItem.$.name === 'Velocity')?.value[0];
          const elevation = result.kml.Document[0].Folder[0].Placemark[0].ExtendedData[0].Data.find((dataItem: any) => dataItem.$.name === 'Elevation')?.value[0];
          const timeStamp = result.kml.Document[0].Folder[0].Placemark[0].TimeStamp[0].when[0];
          const resultPing: mapPing = {
            pingTime: new Date(Date.parse(timeStamp)),
            pingLatitude: parseFloat(latitude),
            pingLongitude: parseFloat(longitude),
            pingElevation: parseFloat(elevation.split(' ')[0]),
            pingVelocity: parseFloat(velocity.split(' ')[0]),
            pingMessage: textMessage
          }
          resolve(resultPing);
      });

    } catch (error) {
      Logger.error('Error fetching or parsing KML file:', error);
    }
  });

};

export {fetchAndStoreData}