import { BinaryReader } from "./reader";
import type { RawAction } from "./types";

/**
 * Parse a single action from the command block data.
 * Returns the parsed action and advances the reader past it.
 *
 * Action IDs and their sizes are version-dependent.
 * This implementation targets post-1.13 (TFT) format.
 */
export function parseAction(
  reader: BinaryReader,
  gameVersion: number
): RawAction | null {
  if (!reader.hasMore()) return null;

  const actionId = reader.readUInt8();
  const action: RawAction = { actionId };

  try {
    switch (actionId) {
      // Pause game
      case 0x01:
        break;

      // Resume game
      case 0x02:
        break;

      // Set game speed
      case 0x03:
        action.speed = reader.readUInt8();
        break;

      // Increase / Decrease game speed
      case 0x04:
      case 0x05:
        break;

      // Save game
      case 0x06:
        action.message = reader.readString();
        break;

      // Save game finished
      case 0x07:
        reader.skip(4);
        break;

      // Ability with no target
      case 0x10: {
        action.abilityFlags = reader.readUInt16LE();
        action.itemId = reader.readItemId();
        action.unknownA = reader.readUInt32LE();
        action.unknownB = reader.readUInt32LE();
        break;
      }

      // Ability with position target
      case 0x11: {
        action.abilityFlags = reader.readUInt16LE();
        action.itemId = reader.readItemId();
        action.unknownA = reader.readUInt32LE();
        action.unknownB = reader.readUInt32LE();
        action.targetX = reader.readFloat32LE();
        action.targetY = reader.readFloat32LE();
        break;
      }

      // Ability with unit target
      case 0x12: {
        action.abilityFlags = reader.readUInt16LE();
        action.itemId = reader.readItemId();
        action.unknownA = reader.readUInt32LE();
        action.unknownB = reader.readUInt32LE();
        action.targetX = reader.readFloat32LE();
        action.targetY = reader.readFloat32LE();
        action.targetObjectId1 = reader.readUInt32LE();
        action.targetObjectId2 = reader.readUInt32LE();
        break;
      }

      // Give item to unit / drop item on ground
      case 0x13: {
        action.abilityFlags = reader.readUInt16LE();
        action.itemId = reader.readItemId();
        action.unknownA = reader.readUInt32LE();
        action.unknownB = reader.readUInt32LE();
        action.targetX = reader.readFloat32LE();
        action.targetY = reader.readFloat32LE();
        action.targetObjectId1 = reader.readUInt32LE();
        action.targetObjectId2 = reader.readUInt32LE();
        action.itemObjectId1 = reader.readUInt32LE();
        action.itemObjectId2 = reader.readUInt32LE();
        break;
      }

      // Two-target ability
      case 0x14: {
        action.abilityFlags = reader.readUInt16LE();
        action.itemId = reader.readItemId();
        action.unknownA = reader.readUInt32LE();
        action.unknownB = reader.readUInt32LE();
        action.targetX = reader.readFloat32LE();
        action.targetY = reader.readFloat32LE();
        action.targetObjectId1 = reader.readUInt32LE();
        action.targetObjectId2 = reader.readUInt32LE();
        action.targetX2 = reader.readFloat32LE();
        action.targetY2 = reader.readFloat32LE();
        break;
      }

      // Change selection (select / deselect)
      case 0x16: {
        action.selectMode = reader.readUInt8();
        const count = reader.readUInt16LE();
        action.unitCount = count;
        action.units = [];
        for (let i = 0; i < count; i++) {
          action.units.push({
            objectId1: reader.readUInt32LE(),
            objectId2: reader.readUInt32LE(),
          });
        }
        break;
      }

      // Assign group hotkey
      case 0x17: {
        action.groupNumber = reader.readUInt8();
        const count = reader.readUInt16LE();
        action.unitCount = count;
        action.units = [];
        for (let i = 0; i < count; i++) {
          action.units.push({
            objectId1: reader.readUInt32LE(),
            objectId2: reader.readUInt32LE(),
          });
        }
        break;
      }

      // Select group hotkey
      case 0x18: {
        action.groupNumber = reader.readUInt8();
        reader.skip(1); // unknown
        break;
      }

      // Select sub-group (version dependent)
      case 0x19: {
        if (gameVersion >= 14) {
          // Post 1.14b: itemId(4) + objectId1(4) + objectId2(4)
          action.itemId = reader.readItemId();
          action.targetObjectId1 = reader.readUInt32LE();
          action.targetObjectId2 = reader.readUInt32LE();
        } else {
          // Pre 1.14b: 1 byte only
          reader.skip(1);
        }
        break;
      }

      // Pre-subselection
      case 0x1a:
        break;

      // Unknown (1.14b+)
      case 0x1b: {
        reader.skip(9);
        break;
      }

      // Select ground item
      case 0x1c: {
        reader.skip(1); // unknown flag
        action.targetObjectId1 = reader.readUInt32LE();
        action.targetObjectId2 = reader.readUInt32LE();
        break;
      }

      // Cancel hero revival
      case 0x1d: {
        action.targetObjectId1 = reader.readUInt32LE();
        action.targetObjectId2 = reader.readUInt32LE();
        break;
      }

      // Remove unit from building queue
      case 0x1e: {
        action.slotNumber = reader.readUInt8();
        action.itemId = reader.readItemId();
        break;
      }

      // Unknown 0x21
      case 0x21: {
        reader.skip(8);
        break;
      }

      // Change ally options
      case 0x50: {
        reader.skip(5);
        break;
      }

      // Transfer resources
      case 0x51: {
        reader.skip(1); // target player slot
        action.gold = reader.readUInt32LE();
        action.lumber = reader.readUInt32LE();
        break;
      }

      // Trigger chat command (single player)
      case 0x60: {
        reader.skip(8);
        action.message = reader.readString();
        break;
      }

      // ESC pressed
      case 0x61:
        break;

      // Scenario trigger
      case 0x62: {
        reader.skip(12);
        break;
      }

      // Hero skill submenu (enter)
      case 0x65:
        break;

      // Hero skill submenu (exit)
      case 0x66:
        break;

      // Enter build submenu
      case 0x67:
        break;

      // Minimap signal (ping)
      case 0x68: {
        action.targetX = reader.readFloat32LE();
        action.targetY = reader.readFloat32LE();
        reader.skip(4); // unknown dword
        break;
      }

      // Continue game (block B)
      case 0x69:
      case 0x6a: {
        reader.skip(16);
        break;
      }

      // W3MMD / stats data
      case 0x6b: {
        reader.skip(16);
        break;
      }

      // Reforged extended ability (no target) — equivalent of 0x10
      // Format: flags(4) + flags_dup(4) + abilityId(4) + itemId(4) = 16 bytes
      case 0x7a: {
        action.abilityFlags = reader.readUInt32LE();
        reader.skip(4); // duplicate flags
        reader.readItemId(); // ability ID (internal, e.g. "AHbu" for Human Build)
        action.itemId = reader.readItemId(); // entity being trained/built
        break;
      }

      // Reforged extended ability (position target) — equivalent of 0x11
      // Format: flags(4) + flags_dup(4) + abilityId(4) + itemId(4) + x(4) + y(4) = 24 bytes
      case 0x7b: {
        action.abilityFlags = reader.readUInt32LE();
        reader.skip(4);
        reader.readItemId(); // ability ID
        action.itemId = reader.readItemId();
        action.targetX = reader.readFloat32LE();
        action.targetY = reader.readFloat32LE();
        break;
      }

      // Reforged extended ability (unit target) — equivalent of 0x12
      // Format: flags(4) + flags_dup(4) + abilityId(4) + itemId(4) + x(4) + y(4) + targetObj(8) = 32 bytes
      case 0x7c: {
        action.abilityFlags = reader.readUInt32LE();
        reader.skip(4);
        reader.readItemId(); // ability ID
        action.itemId = reader.readItemId();
        action.targetX = reader.readFloat32LE();
        action.targetY = reader.readFloat32LE();
        action.targetObjectId1 = reader.readUInt32LE();
        action.targetObjectId2 = reader.readUInt32LE();
        break;
      }

      // Unknown action — store raw bytes up to end of command block
      default: {
        // We can't know the size of unknown actions, so we mark it
        // and the timeslot parser will handle the boundary
        action.rawBytes = Buffer.from([actionId]);
        return action;
      }
    }
  } catch {
    // If we run out of bytes mid-action, return what we have
    action.rawBytes = Buffer.from([actionId]);
    return action;
  }

  return action;
}
