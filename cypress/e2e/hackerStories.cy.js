describe('Hacker Stories', () => {
  const initialTerm = 'React'
  const newTerm = 'Cypress'


  context('hitting the real API', () => {

    context('Search', () => {

      beforeEach(() => {
        cy.visit('/')

      

        cy.get('#search')
          .clear()
      })


      it('shows the footer', () => {
        cy.get('footer')
          .should('be.visible')
          .and('contain', 'Icons made by Freepik from www.flaticon.com')
      })

      it('shows 20 stories, then the next 20 after clicking "More"', () => {

        cy.intercept({
          method: 'GET',
          pathname: `**/search`,
          query: {
            query: 'React',
            page: '1'
          }
        }).as('getNextStories')

        cy.get('.item').should('have.length', 20)

        cy.contains('More').click()

        cy.wait('@getNextStories')

        cy.get('.item').should('have.length', 40)
      })

      it('types and hits ENTER', () => {

        cy.intercept({
          method: 'GET',
          pathname: `**/search`,
          query: {
            query: `${newTerm}`,
            page: '0'
          }
        }).as('getTypes')

        cy.get('#search')
          .type(`${newTerm}{enter}`)

        cy.wait('@getTypes')

        cy.get('.item').should('have.length', 20)
        cy.get('.item')
          .first()
          .should('contain', newTerm)
        cy.get(`button:contains(${initialTerm})`)
          .should('be.visible')
      })

      it('types and clicks the submit button', () => {
        cy.intercept({
          method: 'GET',
          pathname: `**/search`,
          query: {
            query: `${newTerm}`,
            page: '0'
          }
        }).as('getNewTerm')

        cy.get('#search')
          .type(newTerm)
        cy.contains('Submit')
          .click()

        cy.wait('@getNewTerm')

        cy.get('.item').should('have.length', 20)
        cy.get('.item')
          .first()
          .should('contain', newTerm)
        cy.get(`button:contains(${initialTerm})`)
          .should('be.visible')
      })
    })

    context('Last searches', () => {
      beforeEach(() => {
        cy.visit('/')

        cy.get('#search')
          .clear()
      })

      it.only('searches via the last searched term', () => {

        cy.intercept({
          method: 'GET',
          pathname: `**/search`,
          query: {
            query: `${newTerm}`,
            page: '0'
          }
        }).as('search')

        cy.intercept({
          method: 'GET',
          pathname: `**/search`,
          query: {
            query: `${initialTerm}`,
            page: '0'
          }
        }).as('lastSearch')

        cy.get('#search')
          .type(`${newTerm}{enter}`)

        cy.wait('@search')

        cy.getLocalStorage('search')
        .should('be.eql', newTerm)

        cy.get(`button:contains(${initialTerm})`)
          .should('be.visible')
          .click()

        cy.wait('@lastSearch')

        cy.getLocalStorage('search')
        .should('be.eql', initialTerm)

        cy.get('.item').should('have.length', 20)
        cy.get('.item')
          .first()
          .should('contain', initialTerm)
        cy.get(`button:contains(${newTerm})`)
          .should('be.visible')
      })

      it('shows a max of 5 buttons for the last searched terms', () => {
        const faker = require('faker')
        cy.intercept({
          method: 'GET',
          pathname: `**/search`,
          query: {
            query: `${name}`,
            page: '0'
          }
        }).as('faker')

        Cypress._.times(6, () => {
          var name = faker.random.word()
          cy.get('#search')
            .clear()

            .type(`${name}{enter}`)

          cy.wait('@faker')
        })



        cy.get('.last-searches button')
        .within(()=>{
          cy.get('button')
          .should('have.length', 5)

        })
          
      })
    })

    context('Errors', () => {

      it('shows "Something went wrong ..." in case of a server error', () => {

        cy.intercept(

          'GET',
          `**/search**`,
          { statusCode: 500 }
        ).as('serverError')

        cy.visit('/')
        cy.wait('@serverError')

        cy.contains('p', 'Something went wrong ...')
          .should('be.visible')

      })

      it('shows "Something went wrong ..." in case of a network error', () => {

        cy.intercept(

          'GET',
          `**/search**`,
          { forceNetworkError: true }
        ).as('netError')

        cy.visit('/')
        cy.wait('@netError')

        cy.contains('p', 'Something went wrong ...')
          .should('be.visible')

      })
    })


  })
  context('Mocking the API', () => {
    beforeEach(() => {

      cy.intercept(
        'GET',
        `**/search?query=${initialTerm}&page=0`,
        { fixture: 'stories' }

      ).as('mockApi')

      cy.visit('/')
      cy.wait('@mockApi')

    })


    it('shows only 2 stories after dimissing the first story', () => {

      cy.get('.button-small')
        .first()
        .click()

      cy.get('.item').should('have.length', 2)
    })

  })

  context('List of stories', () => {
    var search = 'linkedin'
    beforeEach(() => {
      cy.visit('/')

      cy.intercept(
        'GET',

        `**/search?query=${search}&page=0`

      ).as('waitSite')


    })
    it('shows the right data for all rendered stories', () => {
      cy.get('#search')
        .clear()
        .type(`${search}{enter}`)

      cy.wait('@waitSite')

      cy.get('button:contains(Title)').should('to.be.visible')
      cy.get('button:contains(Author)').should('to.be.visible')
      cy.get('button:contains(Comments)').should('to.be.visible')
      cy.get('button:contains(Points)').should('to.be.visible')

      cy.get('.item').should('have.length', 20)

      cy.get('button:contains(More)').should('be.visible')
    })

    context('Order by', () => {
      search = 'javascript'

      it('orders by title', () => {


        cy.get('#search')
          .clear()
          .type(`${search}{enter}`)

        cy.wait('@waitSite')

        cy.get('button:contains(Title)')
          .should('to.be.visible')
          .click()


        cy.get('.item')
          .first()
          .should('contain', 'A')


      })



      it('orders by author', () => {

        cy.get('#search')
          .clear()
          .type(`${search}{enter}`)

        cy.wait('@waitSite')

        cy.get('button:contains(Author)')
          .should('to.be.visible')
          .click()


        cy.get('.item')
          .first()
          .should('be.visible')
      })

      it('orders by comments', () => {

        cy.get('#search')
          .clear()
          .type(`${search}{enter}`)

        cy.wait('@waitSite')

        cy.get('button:contains(Comments)')
          .should('to.be.visible')
          .click()


        cy.get('.item')
          .first()
          .should('be.visible')
      })

      it('orders by points', () => {
        cy.get('#search')
          .clear()
          .type(`${search}{enter}`)

        cy.wait('@waitSite')

        cy.get('button:contains(Points)')
          .should('to.be.visible')
          .dblclick()


        cy.get('.item')
          .first()
          .should('be.visible')

      })


      // Hrm, how would I simulate such errors?
      // Since I still don't know, the tests are being skipped.
      // TODO: Find a way to test them out.

    })

  })



})


