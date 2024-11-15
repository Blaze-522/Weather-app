import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
class City {
  id: string;
  name: string;

  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
  }
}

class HistoryService {
  filePath: string;

  constructor() {
    const __filename = fileURLToPath(import.meta.url);  // Get current file path
    const __dirname = path.dirname(__filename);         // Derive the directory name
    this.filePath = path.join(__dirname, 'searchHistory.json'); // Set the file path correctly
  }

  // Read the searchHistory.json file
  async read() {
    try {
      const data = await fs.readFile(this.filePath, 'utf-8');
      return JSON.parse(data);
    } catch (err) {
      console.error('Error reading file:', err);
      return [];
    }
  }

  // Write the updated cities array to the searchHistory.json file
  async write(cities: any) {
    try {
      await fs.writeFile(this.filePath, JSON.stringify(cities, null, 2));
    } catch (err) {
      console.error('Error writing file:', err);
    }
  }

  // Get cities from the searchHistory.json file and return as City objects
  async getCities() {
    const citiesData = await this.read();
    return citiesData.map((city: { id: string; name: string }) => new City(city.id, city.name));
  }

  // Add a city to the searchHistory.json file
  async addCity(name: string) {
    const cities = await this.getCities();
    const newCity = new City(cities.length + 1, name);
    cities.push(newCity);
    await this.write(cities);
    return newCity;
  }

  // BONUS: Remove a city from the searchHistory.json file
  async removeCity(id: number) {
    let cities = await this.getCities();
    cities = cities.filter((city: { id: number }) => city.id !== id);
    await this.write(cities);
  }
}

export default new HistoryService();