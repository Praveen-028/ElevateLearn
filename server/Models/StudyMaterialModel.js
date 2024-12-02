const mongoose = require('mongoose');

const studyMaterialSchema = new mongoose.Schema({
  topic: { type: String, required: true, unique: true },
  url: { type: String, required: true }
});

module.exports = mongoose.model('StudyMaterial', studyMaterialSchema);
