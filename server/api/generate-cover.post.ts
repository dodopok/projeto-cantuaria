import { defineEventHandler, readBody } from 'h3'

export default defineEventHandler(async (event) => {
  const { title, author } = await readBody(event)

  // Gerador de SVG Elegante (Estilo Acadêmico)
  // Usamos tons de Oxford Blue e Cream
  const svg = `
    <svg width="600" height="900" viewBox="0 0 600 900" xmlns="http://www.w3.org/2000/svg">
      <rect width="600" height="900" fill="#FDFCF8"/>
      <rect width="560" height="860" x="20" y="20" fill="none" stroke="#002147" stroke-width="2"/>
      <rect width="540" height="840" x="30" y="30" fill="none" stroke="#002147" stroke-width="0.5"/>
      
      <!-- Cabeçalho Institucional -->
      <text x="300" y="100" font-family="serif" font-size="12" letter-spacing="4" fill="#002147" text-anchor="middle" font-weight="bold">PROJETO CANTUÁRIA</text>
      <line x1="200" y1="115" x2="400" y2="115" stroke="#C5A059" stroke-width="1"/>
      
      <!-- Título Central -->
      <foreignObject x="80" y="250" width="440" height="400">
        <div xmlns="http://www.w3.org/1999/xhtml" style="display: flex; align-items: center; justify-content: center; height: 100%; text-align: center;">
          <h1 style="font-family: 'EB Garamond', serif; font-size: 48px; color: #002147; margin: 0; line-height: 1.1; font-style: italic;">
            ${title}
          </h1>
        </div>
      </foreignObject>
      
      <!-- Autor -->
      <text x="300" y="700" font-family="sans-serif" font-size="16" letter-spacing="2" fill="#1A1A1A" text-anchor="middle" font-weight="500">
        ${author?.toUpperCase() || 'DOCUMENTO HISTÓRICO'}
      </text>
      
      <!-- Selo/Logo Inferior -->
      <circle cx="300" y="800" r="30" fill="#002147"/>
      <text x="300" y="810" font-family="serif" font-size="24" fill="#FDFCF8" text-anchor="middle">C</text>
      
      <text x="300" y="860" font-family="serif" font-size="10" font-style="italic" fill="#002147" text-anchor="middle">Ad Majorem Dei Gloriam</text>
    </svg>
  `.trim()

  const base64 = Buffer.from(svg).toString('base64')
  return {
    url: `data:image/svg+xml;base64,${base64}`
  }
})
