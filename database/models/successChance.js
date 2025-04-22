const mongoose = require('mongoose');

const successChanceSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserDb',
        required: true
    },
    studyLevel: String,
    gradetype: String,
    grade: Number,
    dateOfBirth: String,
    nationality: String,
    majorSubject: String,
    livingCosts: {
        amount: Number,
        currency: String,
    },
    tuitionFee: {
        amount: Number,
        currency: String,
    },
    languageProficiency: {
        test: String,
        score: String,
    },
    workExperience: String,
    studyPreferenced: {
        country: String,
        degree: String,
        subject: String,
    },
}, { timestamps: true });

module.exports = mongoose.model('successChance', successChanceSchema);
