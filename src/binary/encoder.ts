/**
 * Binary ZON Encoder
 * 
 * Encodes JavaScript values to compact binary format
 */

import {
  MAGIC_HEADER,
  TypeMarker,
  createPositiveFixint,
  createNegativeFixint,
  createFixmap,
  createFixarray,
  createFixstr
} from './constants';

/**
 * Binary ZON Encoder
 */
export class BinaryZonEncoder {
  private buffer: number[] = [];
  
  /**
   * Encode data to binary ZON format
   */
  encode(data: any): Uint8Array {
    this.buffer = [];
    
    // Write magic header
    this.buffer.push(...MAGIC_HEADER);
    
    // Encode the data
    this.encodeValue(data);
    
    return new Uint8Array(this.buffer);
  }
  
  /**
   * Encode a single value
   */
  private encodeValue(value: any): void {
    if (value === null || value === undefined) {
      this.buffer.push(TypeMarker.NIL);
    } else if (typeof value === 'boolean') {
      this.buffer.push(value ? TypeMarker.TRUE : TypeMarker.FALSE);
    } else if (typeof value === 'number') {
      this.encodeNumber(value);
    } else if (typeof value === 'string') {
      this.encodeString(value);
    } else if (Array.isArray(value)) {
      this.encodeArray(value);
    } else if (typeof value === 'object') {
      this.encodeObject(value);
    } else {
      throw new Error(`Unsupported type: ${typeof value}`);
    }
  }
  
  /**
   * Encode a number (int or float)
   */
  private encodeNumber(value: number): void {
    // Check if integer
    if (Number.isInteger(value)) {
      // Positive fixint: 0-127
      if (value >= 0 && value <= 127) {
        this.buffer.push(createPositiveFixint(value));
      }
      // Negative fixint: -32 to -1
      else if (value >= -32 && value < 0) {
        this.buffer.push(createNegativeFixint(value));
      }
      // uint8: 0-255
      else if (value >= 0 && value <= 0xFF) {
        this.buffer.push(TypeMarker.UINT8);
        this.buffer.push(value);
      }
      // uint16: 0-65535
      else if (value >= 0 && value <= 0xFFFF) {
        this.buffer.push(TypeMarker.UINT16);
        this.writeUint16(value);
      }
      // uint32
      else if (value >= 0 && value <= 0xFFFFFFFF) {
        this.buffer.push(TypeMarker.UINT32);
        this.writeUint32(value);
      }
      // int8: -128 to 127
      else if (value >= -128 && value <= 127) {
        this.buffer.push(TypeMarker.INT8);
        this.buffer.push(value & 0xFF);
      }
      // int16
      else if (value >= -32768 && value <= 32767) {
        this.buffer.push(TypeMarker.INT16);
        this.writeInt16(value);
      }
      // int32
      else {
        this.buffer.push(TypeMarker.INT32);
        this.writeInt32(value);
      }
    } else {
      // Floating point
      this.buffer.push(TypeMarker.FLOAT64);
      this.writeFloat64(value);
    }
  }
  
  /**
   * Encode a string
   */
  private encodeString(value: string): void {
    const bytes = new TextEncoder().encode(value);
    const length = bytes.length;
    
    if (length <= 31) {
      // fixstr
      this.buffer.push(createFixstr(length));
    } else if (length <= 0xFF) {
      // str8
      this.buffer.push(TypeMarker.STR8);
      this.buffer.push(length);
    } else if (length <= 0xFFFF) {
      // str16
      this.buffer.push(TypeMarker.STR16);
      this.writeUint16(length);
    } else {
      // str32
      this.buffer.push(TypeMarker.STR32);
      this.writeUint32(length);
    }
    
    this.buffer.push(...bytes);
  }
  
  /**
   * Encode an array
   */
  private encodeArray(value: any[]): void {
    const length = value.length;
    
    if (length <= 15) {
      // fixarray
      this.buffer.push(createFixarray(length));
    } else if (length <= 0xFFFF) {
      // array16
      this.buffer.push(TypeMarker.ARRAY16);
      this.writeUint16(length);
    } else {
      // array32
      this.buffer.push(TypeMarker.ARRAY32);
      this.writeUint32(length);
    }
    
    for (const item of value) {
      this.encodeValue(item);
    }
  }
  
  /**
   * Encode an object/map
   */
  private encodeObject(value: Record<string, any>): void {
    const keys = Object.keys(value);
    const length = keys.length;
    
    if (length <= 15) {
      // fixmap
      this.buffer.push(createFixmap(length));
    } else if (length <= 0xFFFF) {
      // map16
      this.buffer.push(TypeMarker.MAP16);
      this.writeUint16(length);
    } else {
      // map32
      this.buffer.push(TypeMarker.MAP32);
      this.writeUint32(length);
    }
    
    for (const key of keys) {
      this.encodeString(key);
      this.encodeValue(value[key]);
    }
  }
  
  // Helper methods for writing multi-byte values
  
  private writeUint16(value: number): void {
    this.buffer.push((value >> 8) & 0xFF);
    this.buffer.push(value & 0xFF);
  }
  
  private writeUint32(value: number): void {
    this.buffer.push((value >> 24) & 0xFF);
    this.buffer.push((value >> 16) & 0xFF);
    this.buffer.push((value >> 8) & 0xFF);
    this.buffer.push(value & 0xFF);
  }
  
  private writeInt16(value: number): void {
    this.writeUint16(value & 0xFFFF);
  }
  
  private writeInt32(value: number): void {
    this.writeUint32(value & 0xFFFFFFFF);
  }
  
  private writeFloat64(value: number): void {
    const buffer = new ArrayBuffer(8);
    const view = new DataView(buffer);
    view.setFloat64(0, value, false); // big-endian
    
    for (let i = 0; i < 8; i++) {
      this.buffer.push(view.getUint8(i));
    }
  }
}

/**
 * Encode data to binary ZON format
 */
export function encodeBinary(data: any): Uint8Array {
  const encoder = new BinaryZonEncoder();
  return encoder.encode(data);
}
