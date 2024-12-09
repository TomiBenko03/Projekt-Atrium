const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const agentSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    address: { type: String, required: true },
    gsm: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    emso: { type: String, required: true },
    taxNumber: { type: String, required: true },
    password: { type: String, required: true },
    role: { 
        type: String, 
        enum: ['agent', 'odvetnik'], 
        required: true,
        default: 'agent' // Default role
    }
}, { timestamps: true });

agentSchema.pre('save', async function(next){
    try{
        const hash = await bcrypt.hash(this.password, 10);
        this.password = hash;
        next();
    }
    catch(err){
        next(err);
    }
});

agentSchema.statics.authenticate = async function(email, password) {
    try {
        const user = await this.findOne({ email }).exec();
        if(!user) {
            const err = new Error('User not found');
            err.status = 401;
            throw err;
        }
        const result = await bcrypt.compare(password, user.password);
        if(result === true){
            return user;
        }
        else{
            throw new Error('Incorrect password');
        }
    }
    catch(err) {
        throw err;
    }
};

module.exports = mongoose.model('agent', agentSchema);
