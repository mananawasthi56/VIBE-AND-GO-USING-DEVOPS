import nodemailer from 'nodemailer'

const otpStore = new Map()

export async function POST(req) {
  try {
    const { email } = await req.json()

    if (!email) {
      return Response.json({ error: 'Email is required' }, { status: 400 })
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString()

    otpStore.set(email, {
      otp,
      expiry: Date.now() + 5 * 60 * 1000,
    })

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT),
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    })

    await transporter.sendMail({
      from: `"Vibe & Go" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: '🎯 Your Vibe & Go OTP Code',
      html: `...your HTML stays same...`,
    })

    return Response.json({ success: true, message: 'OTP sent successfully!' })

  } catch (err) {
    console.error('OTP error:', err) // ✅ using err → no lint issue
    return Response.json({ error: 'Failed to send OTP' }, { status: 500 })
  }
}

export async function PUT(req) {
  try {
    const { email, otp } = await req.json()

    const stored = otpStore.get(email)

    if (!stored) {
      return Response.json({ error: 'OTP not found. Please request again.' }, { status: 400 })
    }

    if (Date.now() > stored.expiry) {
      otpStore.delete(email)
      return Response.json({ error: 'OTP expired. Please request again.' }, { status: 400 })
    }

    if (stored.otp !== otp) {
      return Response.json({ error: 'Invalid OTP. Please try again.' }, { status: 400 })
    }

    otpStore.delete(email)
    return Response.json({ success: true, message: 'OTP verified successfully!' })

  } catch (err) {
    console.error('Verification error:', err) // ✅ FIXED HERE
    return Response.json({ error: 'Verification failed' }, { status: 500 })
  }
}