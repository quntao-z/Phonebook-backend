require('dotenv').config()
const express = require("express");
const app = express();
const Person = require('./models/person')

var morgan = require('morgan')
app.use(express.json());

const cors = require('cors')
app.use(cors())

app.use(express.static('dist'))

morgan.token('body', (req, res) => JSON.stringify(req.body))

app.use(morgan(function (tokens, req, res) {
  return [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, 'content-length'), '-',
    tokens['response-time'](req, res), 'ms',
    tokens.body(req, res)
  ].join(' ')
}))

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message})
  }

  next(error)
}

app.get("/api/persons", (request, response) => {
  Person.find().then(persons => {
    response.json(persons)
  })
});

app.get("/info", (request, response) => {
  let amountOfPeople = 0;

  Person.find({}).then(results => {
    amountOfPeople = results.length

    let date = new Date();

    response.set("Content-Type", "text/html");
    response.send(`<p> Phonebook has info for ${amountOfPeople} people  </br> ${date} </p>`);
    
  })
  .catch(error => next(error))
});

app.get("/api/persons/:id", (request, response, next) => {
  const id = request.params.id;

  Person.findById(id)
    .then(person => {
      if(person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => {
      next(error)
    })
});

app.delete("/api/persons/:id", (request, response, next) => {
  const id = request.params.id;
  Person.findByIdAndDelete(id).then(result => {
    response.status(204).end()
  })
  .catch(error => next(error)) 
});

app.post("/api/persons", (request, response, next) => {
  const body = request.body;

  const person = new Person({
    name: body.name,
    number: body.number,
  });

  person.save()
    .then(savedPerson => {
      response.json(savedPerson)
    })
    .catch(error => next(error))

});

app.put('/api/persons/:id', (request, response, next) => {
  const { name, number } = request.body

  Person.findByIdAndUpdate(
    request.params.id, 
    { name, number }, 
    { new: true, runValidators: true, context: 'query'}
  )
  .then(updatedPerson => {
    response.json(updatedPerson)
  })
  .catch(error => next(error))
})

app.use(unknownEndpoint)
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
