import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT ?? 587),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export async function sendMessageNotification(data: {
  from: string
  email: string
  phone?: string | null
  subject: string
  body: string
  productName?: string | null
}) {
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: process.env.SMTP_USER,
    subject: `[Imprelapp] Nuevo mensaje: ${data.subject}`,
    html: `
      <h2>Nuevo mensaje de contacto</h2>
      <p><strong>De:</strong> ${data.from} (${data.email})</p>
      ${data.phone ? `<p><strong>Teléfono:</strong> ${data.phone}</p>` : ''}
      ${data.productName ? `<p><strong>Producto:</strong> ${data.productName}</p>` : ''}
      <p><strong>Asunto:</strong> ${data.subject}</p>
      <hr />
      <p>${data.body}</p>
    `,
  })
}

export async function sendOrderNotification(data: {
  orderId: number
  customerName: string
  customerEmail: string
  customerPhone: string
  customerAddress: string
  notes?: string | null
  total: string
  items: Array<{ productName: string; quantity: number; unitPrice: string; subtotal: string }>
}) {
  const itemsHtml = data.items
    .map((it) => `<tr><td>${it.productName}</td><td>${it.quantity}</td><td>${it.unitPrice}</td><td>${it.subtotal}</td></tr>`)
    .join('')

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: process.env.SMTP_USER,
    subject: `[Imprelapp] Nuevo pedido #${data.orderId}`,
    html: `
      <h2>Nuevo pedido #${data.orderId}</h2>
      <p><strong>Cliente:</strong> ${data.customerName}</p>
      <p><strong>Correo:</strong> ${data.customerEmail}</p>
      <p><strong>Teléfono:</strong> ${data.customerPhone}</p>
      <p><strong>Dirección:</strong> ${data.customerAddress}</p>
      ${data.notes ? `<p><strong>Notas:</strong> ${data.notes}</p>` : ''}
      <table border="1" cellpadding="6" cellspacing="0">
        <thead><tr><th>Producto</th><th>Cant.</th><th>Precio</th><th>Subtotal</th></tr></thead>
        <tbody>${itemsHtml}</tbody>
      </table>
      <p><strong>Total: ${data.total}</strong></p>
    `,
  })
}
