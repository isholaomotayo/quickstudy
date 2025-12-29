describe('test for all header related events', () => {
    it('should visit user settings', () => {
        cy.visit('http://localhost:8080/forum');
        
            cy.get('#userAvatar').click();
            cy.contains('Settings').click();
            cy.url().should('include', '/settings')
    })

    it('should visit feedback page', () => {
        cy.visit('http://localhost:8080/forum');

            cy.get('#userAvatar').click();
            cy.contains('Feedback').click();
            cy.url().should('include', '/feedback')
    })

    it('should visit help page', () => {
        cy.visit('http://localhost:8080/forum');

        cy.get('#userAvatar').click();
        cy.contains('Help').click();
        cy.url().should('include', '/help')
    })

    it('should be able to search', () => {
        cy.visit('http://localhost:8080/forum');

        cy.get('#search').click();
       
        cy.should('include', '.overlay')
    })

    it('should visit messages page', () => {
        cy.visit('http://localhost:8080/forum');

        cy.get('fa fa-envelope').click();
       
        cy.url().should('include', '/messages')
    })

    it('should visit notifications page', () => {
        cy.visit('http://localhost:8080/forum');

        cy.get('fa fa-bell').click();
       
        cy.url().should('include', '/notifications')
    })

    it('should visit homepage', () => {
        cy.visit('http://localhost:8080/forum');

        cy.contains('quickStudy').click()
        cy.url().should('visit', 'http://localhost:8080/')
    })
})