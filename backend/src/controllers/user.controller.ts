import { Request, Response } from 'express';
import { UserService } from '../services/user.service';
import { PersonType } from '@prisma/client';

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  createPerson = async (req: Request, res: Response) => {
    try {
      const person = await this.userService.createPerson({
        ...req.body,
        profileImage: req.file
      });
      res.status(201).json(person);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  };

  getAllPersons = async (req: Request, res: Response) => {
    try {
      const persons = await this.userService.getAllPersons();
      res.json(persons);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  };

  getPersonById = async (req: Request, res: Response) => {
    try {
      const person = await this.userService.getPersonById(req.params.id);
      res.json(person);
    } catch (error: any) {
      res.status(404).json({ message: error.message });
    }
  };

  getPersonsByType = async (req: Request, res: Response) => {
    try {
      const type = req.params.type as PersonType;
      const persons = await this.userService.getPersonsByType(type);
      res.json(persons);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  };

  updatePerson = async (req: Request, res: Response) => {
    try {
      const person = await this.userService.updatePerson(req.params.id, {
        ...req.body,
        profileImage: req.file
      });
      res.json(person);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  };

  disablePerson = async (req: Request, res: Response) => {
    try {
      await this.userService.disablePerson(req.params.id);
      res.json({ message: 'Person disabled successfully' });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  };
}