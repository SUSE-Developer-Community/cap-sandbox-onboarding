import opentelemetry from '@opentelemetry/api'
import { NodeTracerProvider } from '@opentelemetry/node'

import { SimpleSpanProcessor }  from '@opentelemetry/tracing'
import { ZipkinExporter}  from '@opentelemetry/exporter-zipkin'
import { LogLevel } from '@opentelemetry/core'

const url = process.env.TRACING_URL

if(url){

  const provider = new NodeTracerProvider({
    logLevel: LogLevel.ERROR
  })
  provider.register()

  provider.addSpanProcessor(
    new SimpleSpanProcessor(
      new ZipkinExporter({
        serviceName: 'onboarding',
        url
      })
    )
  )

  opentelemetry.trace.setGlobalTracerProvider(provider)

}