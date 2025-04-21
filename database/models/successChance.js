const mongoose = require('mongoose');
const { parseNumberDef } = require('openai/_vendor/zod-to-json-schema/index.mjs');

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
    livingCosts: String,
    tuitionFee: String,
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
