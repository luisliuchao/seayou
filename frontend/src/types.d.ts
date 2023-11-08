export interface IUser {
  _id: any;
  avatar: string;
  chatgpt_replies?: string[];
  custom_fields: { name: string; type: number; value: string }[];
  departments: string[];
  email: string;
  employee_code: string;
  gender: number;
  is_subscriber?: boolean;
  last_message_at?: number;
  mobile: string;
  name: string;
  reporting_manager_employee_code: string;
  seatalk_id: string;
  seatalk_nickname: string;
  subscribed_at?: number;
  unread_count?: number;
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
  employee_code: string;
  _creationTime: number;
}
