export interface IUser {
  avatar: string;
  email: string;
  name: string;
  employee_code: string;
  is_subscriber?: boolean;
  last_message_at?: number;
  seatalk_id: string;
  seatalk_nickname?: string;
  subscribed_at?: number;
  unread_count?: number;
  is_group?: boolean;
}

export enum MessageBodyType {
  Text = 0,
  Markdown = 1,
}

export enum MessageDirection {
  IN = 0,
  OUT = 1,
}

export interface IMessage {
  body: string;
  body_type: MessageBodyType;
  direction: MessageDirection;
  employee_code?: string;
  group_id?: string;
  _creationTime: number;
}
