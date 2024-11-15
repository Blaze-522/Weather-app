import { Router, Request, Response } from 'express';
import HistoryService from '../../service/historyService.js';
import WeatherService from '../../service/weatherService.js';

const router = Router();

// POST request to retrieve weather data and save city to search history
router.post('/', async (req: Request, res: Response) => {
  try {
    const { city } = req.body;  // Expecting city name from the request body

    // Get weather data from city name
    const weatherData = await WeatherService.getWeatherForCity(city);

    // Save city to search history
    await HistoryService.addCity(city);

    // Send the weather data back in the response
    res.status(200).json(weatherData);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving weather data', error });
  }
});

// GET search history
router.get('/history', async (_req: Request, res: Response) => {
  try {
    const history = await HistoryService.getCities();

    // Return the search history
    res.status(200).json(history);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving search history', error });
  }
});

// DELETE city from search history
router.delete('/history/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Remove city by ID from search history
    await HistoryService.removeCity(id);

    res.status(200).json({ message: 'City removed from search history' });
  } catch (error) {
    res.status(500).json({ message: 'Error removing city from history', error });
  }
});

export default router;