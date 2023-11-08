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

  return (
    <div
      style={{
        padding: "10px",
        border: "1px solid #ccc",
        borderRadius: "10px",
        maxWidth: "400px",
        marginBottom: "10px",
        marginLeft: direction === 1 ? "auto" : "0",
        position: "relative",
      }}
    >
      <div style={{ whiteSpace: "pre-line" }}>{message.body}</div>
      <div style={{ fontSize: "10px", marginTop: "5px", color: "#555" }}>
        {new Date(message._creationTime).toLocaleString()}
      </div>
    </div>
  );
};

interface Props {
  employeeCode: string;
  scrollToBottom: () => void;
}

const MessageList = ({ employeeCode, scrollToBottom }: Props) => {
  const messages = useQuery(api.messages.list, { employeeCode }) || [];

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
