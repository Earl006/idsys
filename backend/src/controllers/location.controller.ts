import { Request, Response } from 'express';
import { LocationService } from '../services/location.service';

export class LocationController {
  private locationService: LocationService;

  constructor() {
    this.locationService = new LocationService();
  }

  createLocation = async (req: Request, res: Response) => {
    try {
      const location = await this.locationService.createLocation(req.body);
      res.status(201).json(location);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  };

  getAllLocations = async (req: Request, res: Response) => {
    try {
      const locations = await this.locationService.getAllLocations();
      res.json(locations);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  };

  getLocationLogs = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { date } = req.query;
      const logs = await this.locationService.getLocationLogs(
        id,
        date ? new Date(date as string) : undefined
      );
      res.json(logs);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  };

  getBreachLogs = async (req: Request, res: Response) => {
    try {
      const logs = await this.locationService.getBreachLogs();
      res.json(logs);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  };

  assignSecurity = async (req: Request, res: Response) => {
    try {
      const { locationId, securityId } = req.body;
      const location = await this.locationService.assignSecurity(locationId, securityId);
      res.json(location);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  };

  unassignSecurity = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const location = await this.locationService.unassignSecurity(id);
      res.json(location);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  };
}