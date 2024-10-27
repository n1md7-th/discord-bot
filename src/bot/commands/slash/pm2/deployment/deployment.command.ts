import type { Deployment } from '@bot/commands/slash/pm2/deployment/deployment.abstract.ts';
import { PicoDeployment } from '@bot/commands/slash/pm2/deployment/pico.deployment.ts';

export class DeploymentCommand {
  private readonly deployment: Record<'Pico', Deployment>;

  constructor() {
    this.deployment = {
      Pico: new PicoDeployment(),
    };
  }

  get Pico() {
    return this.deployment.Pico;
  }

  toChoices() {
    return Object.entries(this.deployment).map(([key]) => ({
      name: key,
      value: key.toLowerCase(),
    }));
  }
}
