describe('R8 - Todo items', () => {
  // define variables that we need on multiple occasions
  let uid // user id
  let name // name of the user (firstName + ' ' + lastName)
  let email // email of the user
  let taskTitle
  let taskUrl
  let todoItem

  before(function () {
    // create a fabricated user from a fixture
    cy.fixture('user.json')
      .then((user) => {
        cy.request({
          method: 'POST',
          url: 'http://localhost:5000/users/create',
          form: true,
          body: user
        }).then((response) => {
          uid = response.body._id.$oid
          name = user.firstName + ' ' + user.lastName
          email = user.email
        })
      })

    // read task data from fixture
    cy.fixture('task.json')
      .then((task) => {
        taskTitle = task.title
        taskUrl = task.url
        todoItem = task.todos
      })
  })

  // open the website and log in to the dashboard
  function loginToSystem(email, name) {
    cy.visit('http://localhost:3000')

    cy.contains('div', 'Email Address')
      .find('input[type=text]')
      .type(email)

    cy.get('form')
      .submit()

    cy.get('h1')
      .should('contain.text', 'Your tasks, ' + name)
  }

  // create a task
  function createTask() {
    cy.get('input[placeholder="Title of your Task"]')
      .type('taskTitle')

    cy.get('input[placeholder*="Viewkey"]')
      .type('taskUrl')

    cy.get('input[type="submit"][value="Create new Task"]')
      .click()

    cy.get('img')
      .first()
      .click()

    cy.get('input[placeholder="Add a new todo item"]')
      .should('be.visible')
  }

  // automate tests by using cypress
  it('R8 tests: creates, toggles, and deletes a todo item', () => {
    loginToSystem(email, name)
    createTask()

    // R8UC1: create a todo item
    cy.get('input[placeholder="Add a new todo item"]')
      .type(todoItem)

    cy.get('input[type="submit"][value="Add"]')
      .click()

    cy.contains('li.todo-item', todoItem)
      .should('be.visible')

    // R8UC2: toggle the todo item
    cy.contains('li.todo-item', todoItem)
      .find('span.checker.unchecked')
      .click()

    cy.contains('li.todo-item', todoItem)
      .find('span.checker.checked')
      .should('be.visible')

    // R8UC3: delete the todo item
    cy.contains('li.todo-item', todoItem)
      .find('span.remover')
      .click()

    cy.contains('li.todo-item', todoItem)
      .should('not.exist')
  })

  after(function () {
    // clean up by deleting the user from the database
    cy.request({
      method: 'DELETE',
      url: `http://localhost:5000/users/${uid}`,
      failOnStatusCode: false
    }).then((response) => {
      cy.log(response.body)
    })
  })
})
