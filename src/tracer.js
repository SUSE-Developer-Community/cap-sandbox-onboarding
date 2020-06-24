import { NodeTracerProvider } from '@opentelemetry/node'
import { SimpleSpanProcessor }  from '@opentelemetry/tracing'
import { ZipkinExporter}  from '@opentelemetry/exporter-zipkin'
import { LogLevel } from '@opentelemetry/core'

const url = process.env.TRACING_URL


const provider = new NodeTracerProvider({
  logLevel: LogLevel.ERROR
})
provider.register()

if(url){
  provider.addSpanProcessor(
    new SimpleSpanProcessor(
      new ZipkinExporter({
        serviceName: 'onboarding',
        url
      })
    )
  )

}