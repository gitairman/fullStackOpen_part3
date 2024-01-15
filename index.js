require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

const app = express()

morgan.token('data', (req) => {
  return req.data
})

const assignData = (req, res, next) => {
  req.data = JSON.stringify(req.body)
  next()
}

app.use(express.static('dist'))
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :data'))
app.use(express.json())
app.use(cors())

// let persons = [
//     {
//         "id": 1,
//         "name": "Arto Hellas",
//         "number": "040-123456"
//     },
//     {
//         "id": 2,
//         "name": "Ada Lovelace",
//         "number": "39-44-5323523"
//     },
//     {
//         "id": 3,
//         "name": "Dan Abramov",
//         "number": "12-43-234345"
//     },
//     {
//         "id": 4,
//         "name": "Mary Poppendieck",
//         "number": "39-23-6423122"
//     }
// ]

// const getId = () => {
//     let range = 50
//     let id = Math.floor(Math.random() * range)
//     while (persons.some(person => person.id === id)) {
//         range += 10
//         id = Math.floor(Math.random() * range)
//     }
//     return id
// }

const errorHandler = (error, req, res, next) => {
  console.log(error.message)

  if (error.name === 'CastError') {
    return res.status(400).send('malformatted id')

  } else if (error.name === 'ValidationError') {
    return res.status(400).send(error.message)
  } else if (error.name === 'DocumentNotFoundError') {
    return res.status(404).send(error.message)
  }

  next(error)
}

const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: 'unknown endpoint' })
}

app.get('/api/persons', (req, res, next) => {
  Person.find()
    .then(persons => res.json(persons))
    .catch(error => next(error))
})

app.get('/api/persons/:id', (req, res, next) => {
  Person.findById(req.params.id)
    .then(person => res.json(person))
    .catch(error => next(error))
})

app.post('/api/persons', assignData, (req, res, next) => {
  const newPerson = req.body

  if (newPerson.name && newPerson.number) {
    const person = new Person({
      name: newPerson.name,
      number: newPerson.number
    })

    person.save().then(savedPerson => {
      res.json(savedPerson)
    })
      .catch(error => next(error))
  } else {
    res.status(400).send('New entry NOT added. Name or number is missing.')
  }
})

app.put('/api/persons/:id', (req, res, next) => {
  const options = { new: true, runValidators: true, context: 'query' }

  Person.findByIdAndUpdate(req.params.id, req.body, options)
    .then(updatedPerson => {
      res.json(updatedPerson)
    })
    .catch(error => {
      next(error)
    })
})

app.delete('/api/persons/:id', (req, res, next) => {
  Person.findByIdAndDelete(req.params.id)
    .then(result => {
      res.send(result)
    })
    .catch(error => {
      next(error)
    })
})

app.use(unknownEndpoint)
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})