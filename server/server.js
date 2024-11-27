const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const sgMail = require('@sendgrid/mail');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Supabase client with service role key
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Test route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Customer creation endpoint
app.post('/api/customers', async (req, res) => {
  try {
    const { 
      email, 
      business_name, 
      contact_name, 
      phone, 
      address, 
      state, 
      postcode, 
      country 
    } = req.body;

    // Generate a random password
    const tempPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        business_name
      }
    });

    if (authError) throw authError;

    // Create customer record
    const { data: customerData, error: customerError } = await supabase
      .from('customers')
      .insert([{
        auth_user_id: authData.user.id,
        business_name,
        contact_name,
        email,
        phone,
        address,
        state,
        postcode,
        country,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (customerError) throw customerError;

    // After creating the customer record, before sending email:
    try {
      // Prepare email
      const msg = {
        to: email,
        from: process.env.SENDGRID_FROM_EMAIL,
        subject: 'Welcome to Wholesale Portal',
        text: `Welcome to the Wholesale Portal!\n\nYour temporary password is: ${tempPassword}\n\nPlease login and change your password.`,
        html: `<h1>Welcome to the Wholesale Portal!</h1><p>Your temporary password is: <strong>${tempPassword}</strong></p><p>Please login and change your password.</p>`
      };

      console.log('Attempting to send email with config:', {
        to: email,
        from: process.env.SENDGRID_FROM_EMAIL,
        sendgridKeyExists: !!process.env.SENDGRID_API_KEY
      });

      await sgMail.send(msg);
      console.log('Email sent successfully');
    } catch (emailError) {
      console.error('SendGrid Error:', emailError);
      // Still return success since user was created
      res.json(customerData);
      return;
    }

    res.json(customerData);
  } catch (error) {
    console.error('Detailed error creating customer:', {
      message: error.message,
      stack: error.stack,
      details: error
    });
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
