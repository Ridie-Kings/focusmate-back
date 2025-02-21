import { Request } from "express";

export interface RequestWithUser extends Request {
  user?: any; // O mejor, usa una interfaz específica para el payload del token
}