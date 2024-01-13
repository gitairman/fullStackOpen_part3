const express = require('express')
const morgan = require('morgan')
const cors = require('cors')

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

let persons = [
    {
        "id": 1,
        "name": "Arto Hellas",
        "number": "040-123456"
    },
    {
        "id": 2,
        "name": "Ada Lovelace",
        "number": "39-44-5323523"
    },
    {
        "id": 3,
        "name": "Dan Abramov",
        "number": "12-43-234345"
    },
    {
        "id": 4,
        "name": "Mary Poppendieck",
        "number": "39-23-6423122"
    }
]

const getId = () => {
    let range = 50
    let id = Math.floor(Math.random() * range)
    while (persons.some(person => person.id === id)) {
        range += 10
        id = Math.floor(Math.random() * range)
    }
    return id
}

app.get('/api/persons', (req, res) => {
    res.send(persons)
})

app.get('/info', (req, res) => {
    res.send(`<p>Phonebook has info for ${persons.length} people</p><p>${new Date()}</p>`)
})

app.get('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id)
    const personFound = persons.find(person => person.id === id)
    if (personFound) {
        res.send(personFound)
    } else {
        res.status(404).send(`Person with id ${id} not found`)
    }
})

app.post('/api/persons', assignData, (req, res) => {
    const personToAdd = req.body
    let message = ''
    if (personToAdd.name && personToAdd.number) {
        if (persons.some(person => person.name === personToAdd.name)) {
            message = 'Person already exists in the phonebook.'
        } else {
            personToAdd.id = getId()
            persons = [...persons, personToAdd]
            return res.status(201).send(personToAdd)
        }
    } else {
        message = 'Name or number is missing.'
    }
    res.status(400).send(`New entry NOT added. ${message}`)
})

app.delete('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id)
    const personFound = persons.find(person => person.id === id)
    if (personFound) {
        persons = persons.filter(person => person.id !== id)
        res.status(204).send(personFound)
    } else {
        res.status(404).send(`Person with id ${id} cannot be found`)
    }
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
