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
    password: { type: String, required: true }
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
        const agent = await this.findOne({ email }).exec();
        if(!agent) {
            const err = new Error('Agent not found');
            err.status = 401;
            throw err;
        }
        const result = await bcrypt.compare(password, agent.password);
        if(result === true){
            return agent;
        }
        else{
            throw new Error('Incorrect password');
        }
    }
    catch(err) {
        throw err;
    }
};


module.exports = mongoose.model('Agent', agentSchema);
