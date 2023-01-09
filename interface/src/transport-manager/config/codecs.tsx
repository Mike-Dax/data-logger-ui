import { Codec, Message } from '@electricui/core'
import {
  HardwareMessageRetimer,
  HardwareTimeBasis,
} from '@electricui/protocol-binary-codecs'
import { SmartBuffer } from 'smart-buffer'

/**
 *  typedef struct
 *  {
 *    uint32_t timestamp;
 *    uint16_t temperature;
 *  } TimeStampedTemperatureData_t;
 */
export interface TimeStampedTemperatureData {
  // We'll change the name to indicate that the origin will be based on the UI's time origin
  offsetTimestamp: number
  temperature: number
}

export class TimeStampedTemperatureCodec extends Codec<
  TimeStampedTemperatureData
> {
  private retimer: HardwareMessageRetimer

  constructor(timeBasis: HardwareTimeBasis) {
    super()
    this.retimer = new HardwareMessageRetimer(timeBasis)
  }

  filter(message: Message): boolean {
    return message.messageID === 'temp'
  }

  encode(payload: TimeStampedTemperatureData): Buffer {
    throw new Error(`temp is readonly`)
  }

  decode(payload: Buffer): TimeStampedTemperatureData {
    const reader = SmartBuffer.fromBuffer(payload)
    // Read out the timestamp from hardware
    const hardwareOriginTimestamp = reader.readUInt32LE()
    // Exchange the timestamp for one in the same time basis as the UI
    const offsetTimestamp = this.retimer.exchange(hardwareOriginTimestamp)
    // Read out the data
    const data = reader.readUInt16LE()
    return {
      offsetTimestamp,
      temperature: data,
    }
  }
}

/**
 *  typedef struct
 *  {
 *    uint32_t timestamp;
 *    float pressure_1;
 *    float pressure_2;
 *  } TimeStampedPressureData_t;
 */
export interface TimeStampedPressureData {
  // We'll change the name to indicate that the origin will be based on the UI's time origin
  offsetTimestamp: number
  pressure_1: number
  pressure_2: number
}

export class TimeStampedPressureCodec extends Codec<TimeStampedPressureData> {
  private retimer: HardwareMessageRetimer

  constructor(timeBasis: HardwareTimeBasis) {
    super()
    this.retimer = new HardwareMessageRetimer(timeBasis)
  }

  filter(message: Message): boolean {
    return message.messageID === 'pres'
  }

  encode(payload: TimeStampedPressureData): Buffer {
    throw new Error(`pres is readonly`)
  }

  decode(payload: Buffer): TimeStampedPressureData {
    const reader = SmartBuffer.fromBuffer(payload)
    // Read out the timestamp from hardware
    const hardwareOriginTimestamp = reader.readUInt32LE()
    // Exchange the timestamp for one in the same time basis as the UI
    const offsetTimestamp = this.retimer.exchange(hardwareOriginTimestamp)
    // Read out the data
    const pressure_1 = reader.readFloatLE()
    const pressure_2 = reader.readFloatLE()
    return {
      offsetTimestamp,
      pressure_1,
      pressure_2,
    }
  }
}
