import {
  ChartContainer,
  DataSourcePrinter,
  LineChart,
  RealTimeDomain,
  TimeAxis,
  VerticalAxis,
  ZoomWrapper,
} from '@electricui/components-desktop-charts'

import { Card, Icon, Tag } from '@blueprintjs/core'
import { Composition } from 'atomic-layout'
import { IntervalRequester } from '@electricui/components-core'
import { MessageDataSource, Queryable } from '@electricui/core-timeseries'
import React from 'react'
import { RouteComponentProps } from '@reach/router'
import { Slider } from '@electricui/components-desktop-blueprint'
import {
  TimeStampedTemperatureData,
  TimeStampedPressureData,
} from '../../../transport-manager/config/codecs'

import { mean, map, min, max } from '@electricui/dataflow'

import { Colors } from '@blueprintjs/core'
import { IconName, IconNames } from '@blueprintjs/icons'

const layoutDescription = `
TemperatureChart TemperatureDetails
PressureChart PressureDetails
`

const temperatureDataSource = new MessageDataSource<number>('temp')
const pressureDataSource = new MessageDataSource<{
  pressure_1: number
  pressure_2: number
}>('pres')

function DataEntry(props: {
  icon: IconName
  title: string
  color: typeof Colors[keyof typeof Colors]
  dataSource: Queryable
  unit?: string
}) {
  return (
    <>
      <div>
        <Icon
          icon={props.icon}
          color={props.color}
          style={{ marginRight: '1em' }}
        />
        {props.title}{' '}
      </div>
      <div style={{ textAlign: 'right' }}>
        <DataSourcePrinter dataSource={props.dataSource} /> {props.unit}
      </div>
    </>
  )
}

export const OverviewPage = (props: RouteComponentProps) => {
  const meanTemperatureDS = mean(temperatureDataSource)

  const pressure1DS = map(pressureDataSource, data => data.pressure_1)
  const pressure2DS = map(pressureDataSource, data => data.pressure_2)

  const meanPressure1DS = mean(pressure1DS)
  const meanPressure2DS = mean(pressure2DS)

  const minPressure1DS = min(pressure1DS)
  const minPressure2DS = min(pressure2DS)
  const maxPressure1DS = max(pressure1DS)
  const maxPressure2DS = max(pressure2DS)

  return (
    <React.Fragment>
      <IntervalRequester interval={1000} variables={['loop']} />

      <Composition
        areas={layoutDescription}
        gap={10}
        autoCols="1fr 300px"
        autoRows="1fr"
      >
        {Areas => (
          <React.Fragment>
            <ZoomWrapper>
              <Areas.TemperatureChart>
                <Card>
                  <div style={{ textAlign: 'center', marginBottom: '1em' }}>
                    <b>Temperature</b>
                  </div>
                  <ChartContainer>
                    <LineChart
                      dataSource={temperatureDataSource}
                      color={Colors.GOLD3}
                    />
                    <RealTimeDomain
                      window={[
                        30_000,
                        60_000,
                        120_000,
                        5 * 60_000,
                        10 * 60_000,
                      ]} // up to 10 minutes of data at a time
                      yMin={0}
                      yMinSoft={5}
                      yMax={100}
                      yMaxSoft={70} // I presume the temperature measurements are in degrees C?
                    />
                    <TimeAxis />
                    <VerticalAxis label="Temperature (°C)" labelPadding={50} />
                  </ChartContainer>
                </Card>
              </Areas.TemperatureChart>

              <Areas.TemperatureDetails>
                <Card style={{ height: '100%' }}>
                  <Composition templateCols="2fr 1fr">
                    <DataEntry
                      icon={IconNames.TEMPERATURE}
                      color={Colors.GOLD3}
                      title="Mean Temperature"
                      dataSource={meanTemperatureDS}
                      unit="°C"
                    />
                  </Composition>
                </Card>
              </Areas.TemperatureDetails>
            </ZoomWrapper>

            <ZoomWrapper>
              <Areas.PressureChart>
                <Card>
                  <div style={{ textAlign: 'center', marginBottom: '1em' }}>
                    <b>Pressure</b>
                  </div>
                  <ChartContainer>
                    <LineChart
                      dataSource={pressureDataSource}
                      accessor={data => data.pressure_1}
                      color={Colors.RED4}
                    />
                    <LineChart
                      dataSource={pressureDataSource}
                      accessor={data => data.pressure_2}
                      color={Colors.BLUE4}
                    />
                    <RealTimeDomain window={5000} yMin={0} yMax={200} />
                    <TimeAxis />
                    <VerticalAxis label="Pressure (kPa)" labelPadding={50} />
                  </ChartContainer>
                </Card>
              </Areas.PressureChart>

              <Areas.PressureDetails>
                <Card
                  style={{
                    height: '100%',
                  }}
                >
                  <div
                    style={{
                      alignContent: 'center',
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: 10,
                      marginBottom: 20,
                      alignSelf: 'start',
                    }}
                  >
                    <Tag
                      style={{
                        backgroundColor: Colors.RED3,
                        color: Colors.WHITE,
                        textAlign: 'center',
                      }}
                    >
                      Pressure 1
                    </Tag>
                    <Tag
                      style={{
                        backgroundColor: Colors.BLUE3,
                        color: Colors.WHITE,
                        textAlign: 'center',
                      }}
                    >
                      Pressure 2
                    </Tag>
                  </div>

                  <Composition templateCols="2fr 1fr" gapRow={3}>
                    <DataEntry
                      icon={IconNames.DOT}
                      color={Colors.RED4}
                      title="Mean Pressure 1"
                      dataSource={meanPressure1DS}
                      unit="kPa"
                    />
                    <DataEntry
                      icon={IconNames.SMALL_MINUS}
                      color={Colors.RED4}
                      title="Min Pressure 1"
                      dataSource={minPressure1DS}
                      unit="kPa"
                    />
                    <DataEntry
                      icon={IconNames.SMALL_PLUS}
                      color={Colors.RED4}
                      title="Max Pressure 1"
                      dataSource={maxPressure1DS}
                      unit="kPa"
                    />
                  </Composition>

                  <br />
                  <br />

                  <Composition templateCols="2fr 1fr" gapRow={3}>
                    <DataEntry
                      icon={IconNames.DOT}
                      color={Colors.BLUE4}
                      title="Mean Pressure 2"
                      dataSource={meanPressure2DS}
                      unit="kPa"
                    />
                    <DataEntry
                      icon={IconNames.SMALL_MINUS}
                      color={Colors.BLUE4}
                      title="Min Pressure 2"
                      dataSource={minPressure2DS}
                      unit="kPa"
                    />
                    <DataEntry
                      icon={IconNames.SMALL_PLUS}
                      color={Colors.BLUE4}
                      title="Max Pressure 2"
                      dataSource={maxPressure2DS}
                      unit="kPa"
                    />
                  </Composition>
                </Card>
              </Areas.PressureDetails>
            </ZoomWrapper>
          </React.Fragment>
        )}
      </Composition>
    </React.Fragment>
  )
}
