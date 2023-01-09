import {
  TimeStampedTemperatureData,
  TimeStampedPressureData,
} from '../transport-manager/config/codecs'

/**
 * To strictly type all accessors and writers, remove
 *
 * [messageID: string]: any
 *
 * And replace with your entire state shape after codecs have decoded them.
 */
declare global {
  interface ElectricUIDeveloperState {
    [messageID: string]: any

    name: string
    temp: TimeStampedTemperatureData
    pres: TimeStampedPressureData
  }
  interface ElectricUIDeviceMetadataState {
    name: string
  }
}

// This exports these types into the dependency tree.
export {}
