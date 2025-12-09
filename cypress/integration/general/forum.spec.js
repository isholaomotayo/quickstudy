describe('visit the forum page', () => {
    it('should visit the forum page', () => {
        cy.visit('http://localhost:8080/forum');

            cy.contains('Add');
        
    })

   
})

//TODO: Add auth components