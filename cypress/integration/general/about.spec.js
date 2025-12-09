describe('visit about page', () => {
    it('should return about page', () => {
        cy.visit('http://localhost:8080/about');

        cy.contains('Controlled Popup').click();

        cy.get('.modals').contains('Lorem')
    });
})