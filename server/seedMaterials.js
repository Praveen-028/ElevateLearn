const mongoose = require('mongoose');
const StudyMaterial = require('./Models/StudyMaterialModel'); // Adjust the path

const materials = [
  { topic: 'Probability', url: 'https://ncert.nic.in/textbook/pdf/jemh115.pdf' },
  { topic: 'Statistics', url: 'https://ncert.nic.in/ncerts/l/iemh114.pdf' },
  { topic: 'Algebra', url: 'https://www.math.purdue.edu/~arapura/algebra/algebra.pdf' },
  { topic: 'Coordinate geometry', url: 'https://ncert.nic.in/ncerts/l/jemh107.pdf' },
  { topic: 'Trigonometry', url: 'https://ncert.nic.in/ncerts/l/jemh108.pdf' },
  { topic: 'Mensuration', url: 'https://ncert.nic.in/textbook/pdf/hemh109.pdf' },
  { topic: 'Numbers and Sequences', url: 'https://ncert.nic.in/ncerts/l/kemh109.pdf' },
  { topic: 'Relations and Functions', url: 'https://ncert.nic.in/pdf/publication/exemplarproblem/classXI/mathematics/keep202.pdf' },
  { topic: 'Geometry', url: 'https://www.science.edu/Acellus/teacher/notes/Geometry/GEONotes.pdf' }
];

async function seedMaterials() {
  try {
    await mongoose.connect('mongodb+srv://elevatelearnadmin:123Admin@elevatelearn.wptmq.mongodb.net/?retryWrites=true&w=majority&appName=Elevatelearn', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    await StudyMaterial.insertMany(materials);
    console.log('Study materials added successfully');
    mongoose.disconnect();
  } catch (error) {
    console.error('Error seeding materials:', error);
  }
}

seedMaterials();
