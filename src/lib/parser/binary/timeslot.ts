import { BinaryReader } from "./reader";
import { parseAction } from "./actions";
import type { RawTimeSlot, RawCommandBlock, RawAction } from "./types";

export interface TimeSlotParseResult {
  timeSlots: RawTimeSlot[];
  chatMessages: Array<{ playerId: number; message: string; flags: number }>;
  leaveEvents: Array<{
    reason: number;
    playerId: number;
    result: number;
    unknownDword: number;
  }>;
}

/**
 * Parse the replay data stream (after player records and game start)
 * into TimeSlot blocks + chat messages + leave events.
 */
export function parseReplayBody(
  reader: BinaryReader,
  gameVersion: number
): TimeSlotParseResult {
  const timeSlots: RawTimeSlot[] = [];
  const chatMessages: Array<{
    playerId: number;
    message: string;
    flags: number;
  }> = [];
  const leaveEvents: Array<{
    reason: number;
    playerId: number;
    result: number;
    unknownDword: number;
  }> = [];

  while (reader.hasMore()) {
    const blockId = reader.readUInt8();

    switch (blockId) {
      // Player leave
      case 0x17: {
        const reason = reader.readUInt32LE();
        const playerId = reader.readUInt8();
        const result = reader.readUInt32LE();
        const unknownDword = reader.readUInt32LE();
        leaveEvents.push({ reason, playerId, result, unknownDword });
        break;
      }

      // TimeSlot (old format)
      case 0x1e:
      // TimeSlot (standard)
      case 0x1f: {
        const byteCount = reader.readUInt16LE();
        const timeIncrementMs = reader.readUInt16LE();

        const commandData: RawCommandBlock[] = [];
        const commandBytesLength = byteCount - 2; // subtract the time increment bytes

        if (commandBytesLength > 0) {
          const cmdReader = reader.fork(commandBytesLength);

          while (cmdReader.hasMore()) {
            const playerId = cmdReader.readUInt8();
            const actionBlockLength = cmdReader.readUInt16LE();

            if (actionBlockLength === 0) continue;

            const actionReader = cmdReader.fork(actionBlockLength);
            const actions: RawAction[] = [];

            while (actionReader.hasMore()) {
              const action = parseAction(actionReader, gameVersion);
              if (action) {
                // If we got an unknown action with raw bytes, stop parsing
                // this command block (we don't know the action size)
                if (action.rawBytes && action.actionId !== action.rawBytes[0]) {
                  break;
                }
                actions.push(action);

                // Unknown action: skip remaining bytes in this command block
                if (action.rawBytes) {
                  break;
                }
              } else {
                break;
              }
            }

            commandData.push({ playerId, actions });
          }
        }

        timeSlots.push({
          blockId,
          timeIncrementMs,
          commandData,
        });
        break;
      }

      // Chat message
      case 0x20: {
        const playerId = reader.readUInt8();
        const byteCount = reader.readUInt16LE();
        const flags = reader.readUInt8();
        if (flags === 0x20) {
          // All chat or ally chat
          reader.skip(4); // chat mode
        }
        const message = reader.readString();
        chatMessages.push({ playerId, message, flags });
        break;
      }

      // Pre-game unknown blocks (Reforged)
      // 0x1A, 0x1B, 0x1C: appear before first timeslot
      case 0x1a:
      case 0x1b:
      case 0x1c: {
        reader.skip(4); // each has a 4-byte payload
        break;
      }

      // Checksum / tick count
      case 0x22: {
        const n = reader.readUInt8();
        reader.skip(n);
        break;
      }

      // Unknown 0x23
      case 0x23: {
        reader.skip(10);
        break;
      }

      // Forced game end countdown
      case 0x2f: {
        reader.skip(8);
        break;
      }

      default: {
        // Unknown block type — try to skip gracefully
        // This is a recovery mechanism; we lose the rest of the replay
        return { timeSlots, chatMessages, leaveEvents };
      }
    }
  }

  return { timeSlots, chatMessages, leaveEvents };
}
