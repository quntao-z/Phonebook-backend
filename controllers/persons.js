const personsRouter = require('express').Router()
const Person = require('../models/person')

personsRouter.get('/', (request, response) => {
  Person.find().then(persons => {
    response.json(persons)
  })
  console.log(request)
})

personsRouter.get('/info', (request, response, next) => {
  let amountOfPeople = 0

  Person.find({}).then(results => {
    amountOfPeople = results.length

    let date = new Date()

    response.set('Content-Type', 'text/html')
    response.send(`<p> Phonebook has info for ${amountOfPeople} people  </br> ${date} </p>`)
  })
    .catch(error => next(error))
})

personsRouter.get('/:id', (request, response, next) => {
  const id = request.params.id

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
})

personsRouter.delete('/:id', (request, response, next) => {
  const id = request.params.id
  Person.findByIdAndDelete(id).then(
    response.status(204).end()
  )
    .catch(error => next(error))
})

personsRouter.post('/', (request, response, next) => {
  const body = request.body

  const person = new Person({
    name: body.name,
    number: body.number,
  })

  person.save()
    .then(savedPerson => {
      response.json(savedPerson)
    })
    .catch(error => next(error))

})

personsRouter.put('/:id', (request, response, next) => {
  const { name, number } = request.body

  Person.findByIdAndUpdate(
    request.params.id,
    { name, number },
    { new: true, runValidators: true, context: 'query' }
  )
    .then(updatedPerson => {
      response.json(updatedPerson)
    })
    .catch(error => next(error))
})

module.exports = personsRouter