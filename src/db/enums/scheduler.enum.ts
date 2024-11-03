export enum SchedulerStatusEnum {
  Active = 'Active',
  Failed = 'Failed',
  Disabled = 'Disabled',
  Cancelled = 'Cancelled',
  Completed = 'Completed',
}

export enum SchedulerSendStrategy {
  DM = 'DM',
  Channel = 'Channel',
  Thread = 'Thread',
}

export enum SchedulerAuthorStrategy {
  Bot = 'Bot',
  User = 'User',
}
