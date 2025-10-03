"use client"

import { useEffect, useRef } from "react"
import QRCode from "qrcode"

interface GatePassQRCodeProps {
  value: string
}

export function GatePassQRCode({ value }: GatePassQRCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(
        canvasRef.current,
        value,
        {
          width: 200,
          margin: 2,
          color: {
            dark: "#000000",
            light: "#FFFFFF",
          },
        },
        (error) => {
          if (error) console.error("[v0] Error generating QR code:", error)
        },
      )
    }
  }, [value])

  return (
    <div className="flex flex-col items-center gap-3">
      <canvas ref={canvasRef} className="rounded-md border" />
      <div className="w-full space-y-1 rounded-md bg-muted p-3">
        <p className="text-xs font-medium text-muted-foreground">Gate Pass ID:</p>
        <p className="break-all font-mono text-sm">{value}</p>
      </div>
    </div>
  )
}
