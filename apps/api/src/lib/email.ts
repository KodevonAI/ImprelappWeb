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
