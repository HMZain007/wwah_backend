const mongoose = require('mongoose');

const successChanceSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserDb',
        required: true,
        index: true // Add index for faster lookups
    },
    studyLevel: {
        type: String,
        required: [true, 'Study level is required'],
        trim: true
    },
    gradeType: {
        type: String,
        required: [true, 'Grade type is required'],
        trim: true
    },
    grade: {
        type: Number,
        required: [true, 'Grade score is required']
    },
    dateOfBirth: {
        type: String,
        required: [true, 'Date of birth is required'],
        validate: {
            validator: function (v) {
                return /^\d{4}-\d{2}-\d{2}$/.test(v);
            },
            message: props => `${props.value} is not a valid date format (YYYY-MM-DD)!`
        }
    },
    nationality: {
        type: String,
        required: [true, 'Nationality is required'],
        trim: true
    },
    majorSubject: {
        type: String,
        required: [true, 'Major subject is required'],
        trim: true
    },
    livingCosts: {
        amount: {
            type: Number,
            required: [true, 'Living costs amount is required']
        },
        currency: {
            type: String,
            required: [true, 'Living costs currency is required'],
            trim: true
        }
    },
    tuitionFee: {
        amount: {
            type: Number,
            required: [true, 'Tuition fee amount is required']
        },
        currency: {
            type: String,
            required: [true, 'Tuition fee currency is required'],
            trim: true
        }
    },
    languageProficiency: {
        test: {
            type: String,
            trim: true
        },
        score: {
            type: String,
            trim: true
        }
    },
    workExperience: Number,
    studyPreferenced: {
        country: {
            type: String,
            required: [true, 'Preferred study country is required'],
            trim: true
        },
        degree: {
            type: String,
            required: [true, 'Preferred degree is required'],
            trim: true
        },
        subject: {
            type: String,
            required: [true, 'Preferred subject is required'],
            trim: true
        }
    },
}, {
    timestamps: true,
    // Add unique compound index to prevent multiple entries per user
    index: { userId: 1 },
    // Add schema options for better error messages
    validateBeforeSave: true
});

// Pre-save middleware for data cleaning/normalization
successChanceSchema.pre('save', function (next) {
    // Make sure numeric values are stored as numbers, not strings
    if (typeof this.grade === 'string') this.grade = parseFloat(this.grade);
    if (typeof this.livingCosts.amount === 'string') this.livingCosts.amount = parseFloat(this.livingCosts.amount);
    if (typeof this.tuitionFee.amount === 'string') this.tuitionFee.amount = parseFloat(this.tuitionFee.amount);
    if (typeof this.workExperience === 'string') this.workExperience = parseInt(this.workExperience, 10);
    next();
});

const successChance = mongoose.model('successChance', successChanceSchema);

module.exports = successChance;