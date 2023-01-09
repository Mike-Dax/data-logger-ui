import 'source-map-support/register'

import { deviceManager } from './config'
import { setupProxyAndDebugInterface } from '@electricui/components-desktop-blueprint'
import { setupTransportWindow } from '@electricui/utility-electron'

import {
  TimeStampedTemperatureData,
  TimeStampedPressureData,
} from './config/codecs'
import {
  ElectronIPCRemoteQueryExecutor,
  QueryableMessageIDProvider,
  Event,
} from '@electricui/core-timeseries'
import { Message } from '@electricui/core'

import { FocusStyleManager } from '@blueprintjs/core'

import './styles.css'

FocusStyleManager.onlyShowFocusOnTabs()

const root = document.createElement('div')
document.body.appendChild(root)

const hotReloadHandler = setupProxyAndDebugInterface(root, deviceManager)
setupTransportWindow()

const remoteQueryExecutor = new ElectronIPCRemoteQueryExecutor()
const queryableMessageIDProvider = new QueryableMessageIDProvider(
  deviceManager,
  remoteQueryExecutor,
)

queryableMessageIDProvider.setCustomProcessor(
  'temp',
  (message: Message<TimeStampedTemperatureData>, emit) => {
    if (!message.payload) {
      // If there's no payload, do nothing
      return
    }

    // Emit an event with the data directly, at the offset timestamp
    emit(
      new Event(message.payload.offsetTimestamp, message.payload.temperature),
    )
  },
)

queryableMessageIDProvider.setCustomProcessor(
  'pres',
  (message: Message<TimeStampedPressureData>, emit) => {
    if (!message.payload) {
      // If there's no payload, do nothing
      return
    }

    // Emit an event with the data as an object containing each pressure value, at the offset timestamp
    emit(
      new Event(message.payload.offsetTimestamp, {
        pressure_1: message.payload.pressure_1,
        pressure_2: message.payload.pressure_2,
      }),
    )
  },
)

if (module.hot) {
  module.hot.accept('./config', () => hotReloadHandler(root, deviceManager))
}
