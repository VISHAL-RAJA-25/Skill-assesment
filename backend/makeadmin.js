require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const EMAIL = process.argv[2];
if (!EMAIL) { console.log('Usage: node makeAdmin.js your@email.com'); process.exit(1); }

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/skillassessment')
    .then(async () => {
        const user = await User.findOneAndUpdate({ email: EMAIL }, { isAdmin: true }, { new: true });
        if (!user) { console.log('❌ User not found:', EMAIL); }
        else { console.log('✅ Admin granted to:', user.email); }
        mongoose.disconnect();
    });