import { useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

import { IMessage } from "../types";

/*
message
  direction: 0 - incoming, 1 - outgoing
  employee_code: number
  body_type: 0 - text , 1 - markdown
  body: string
*/

const MessageCard = ({ message }: { message: IMessage }) => {
  const { direction } = message;

  const user =
    message.group_id && message.employee_code &&
    useQuery(api.users.get, { employee_code: message.employee_code });

  return (
    <div>
      {user && (
        <div style={{ marginBottom: "5px" }}>
          {user.name} ({user.seatalk_id})
        </div>
      )}
      <div
        style={{
          padding: "10px",
          border: "1px solid #ccc",
          borderRadius: "10px",
          maxWidth: "400px",
          marginBottom: "20px",
          marginLeft: direction === 1 ? "auto" : "0",
          position: "relative",
        }}
      >
        <div style={{ whiteSpace: "pre-line" }}>{message.body}</div>
        <div style={{ fontSize: "10px", marginTop: "5px", color: "#555" }}>
          {new Date(message._creationTime).toLocaleString()}
        </div>
      </div>
    </div>
  );
};

interface Props {
  employeeCode: string;
  scrollToBottom: () => void;
  isGroup?: boolean;
}

const MessageList = ({ employeeCode, scrollToBottom, isGroup }: Props) => {
  const messages = isGroup
    ? useQuery(api.messages.listGroup, { groupId: employeeCode }) || []
    : useQuery(api.messages.listUser, { employeeCode }) || [];

  useEffect(() => {
    setTimeout(() => {
      scrollToBottom();
    }, 0);
  }, [messages]);

  return (
    <div>
      {messages.map((message) => {
        return <MessageCard message={message} key={message._id.toString()} />;
      })}
    </div>
  );
};

export default MessageList;
