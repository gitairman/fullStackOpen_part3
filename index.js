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

app.get('/api/persons', (req, res) => {
    Person.find()
        .then(persons => res.json(persons))
        .catch(error => console.log(error.message))
})

app.get('/api/persons/:id', (req, res) => {
    Person.findById(req.params.id)
        .then(person => res.json(person))
        .catch(error => console.log(error.message))
})

app.post('/api/persons', assignData, (req, res) => {
    const newPerson = req.body

    if (newPerson.name && newPerson.number) {
        const person = new Person({
            name: newPerson.name,
            number: newPerson.number
        })

        person.save().then(savedPerson => {
            console.log(savedPerson)
            return res.json(savedPerson)
        })
    }
    res.status(400).send('New entry NOT added. Name or number is missing.')
})

app.delete('/api/persons/:id', (req, res) => {
    Person.findByIdAndDelete(req.params.id)
        .then(result => res.send(result))
        .catch(error => console.log(error.message))
})

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
