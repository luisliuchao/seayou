from enum import IntEnum


class MessageDirection(IntEnum):
    INCOMING = 0
    OUTGOING = 1


class MessageType(IntEnum):
    TEXT = 0
    MARKDOWN = 1
