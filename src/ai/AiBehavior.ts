import { ActorModel } from '../models/ActorModel';

export type AiBehavior = (actor: ActorModel) => void;
