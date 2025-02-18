import mongoose from 'mongoose';

const mongoURI = 'mongodb+srv://sagareoxysit:kTEtpmkApEjgnjSQ@cluster0.qin7c.mongodb.net/testnodejs';

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.error('MongoDB connection error:', err));

const config = mongoose;

export default config;

