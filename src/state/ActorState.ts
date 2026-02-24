import { ActorStateType } from '../Enums';
import { ActorModel } from '../models/ActorModel';

export type ActorState = {
  type: ActorStateType;
  enter: (actor: ActorModel) => void;
  update: (actor: ActorModel) => void;
  exit?: (actor: ActorModel) => void;
  [key: string]: any; // Allow additional properties for state-specific data
};
