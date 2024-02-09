const mongoose = require('mongoose')

mongoose.set('strictQuery', false)

const url = process.env.MONGODB_URI

console.log('connecting to', url)

mongoose
  .connect(url, { dbName: 'phonebook' })
  .then((result) =>
    console.log('connected to MongoDB', result.connections[0].name)
  )
  .catch((error) => console.log('error connecting to MongoDB:', error.message))

const personSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      minLength: [5, 'must be at least 5 characters!'],
      match: [
        /(^[A-Za-z]{3,16})([ ]{0,1})([A-Za-z]{3,16})/,
        'must include a first name and last name separated by a space',
      ],
      required: true,
    },
    number: {
      type: String,
      match: [
        /\d{2,3}-\d{7,8}/,
        'must be in format 01-23456789 or 012-3456789!',
      ],
      required: true,
    },
    email: {
      type: String,
      match: [/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, 'must be an email address'],
      required: true,
    },
    addedBy: {
      type: String,
      required: true,
    },
  },
  { versionKey: false }
)

personSchema.set('toJSON', {
  transform: (document, returnedObj) => {
    returnedObj.id = returnedObj._id.toString()
    delete returnedObj._id
    delete returnedObj.__v
  },
})

module.exports = mongoose.model('Person', personSchema)
