const mongoose = require('mongoose');

const ContributionSchema = new mongoose.Schema({
  member: {
    type: mongoose.Schema.ObjectId,
    ref: 'Member',
    required: true
  },
  year: {
    type: Number,
    required: true,
    default: new Date().getFullYear()
  },
  january: { type: Number, default: 0 },
  february: { type: Number, default: 0 },
  march: { type: Number, default: 0 },
  april: { type: Number, default: 0 },
  may: { type: Number, default: 0 },
  june: { type: Number, default: 0 },
  july: { type: Number, default: 0 },
  august: { type: Number, default: 0 },
  september: { type: Number, default: 0 },
  october: { type: Number, default: 0 },
  november: { type: Number, default: 0 },
  december: { type: Number, default: 0 },
  total: { type: Number, default: 0 }
});

// Calculate total before saving
ContributionSchema.pre('save', function(next) {
  this.total = this.january + this.february + this.march + this.april + 
               this.may + this.june + this.july + this.august + 
               this.september + this.october + this.november + this.december;
  next();
});

module.exports =  mongoose.model.Contributions ||  mongoose.model('Contribution', ContributionSchema);