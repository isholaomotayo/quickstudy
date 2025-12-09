describe("visit the courses page of lms", () => {
  beforeEach(() => {
    cy.visit("http://localhost:8080/login");
    cy.get("input[name='email']").type("omotayoishola@gmail.com");

    cy.get("input[name='password']").type("password");

    cy.contains("Sign in").click();
  });

  // it("should visit lms page", () => {
  //   cy.visit("http://localhost:8080/lms");
  // });

  it("should visit courses page", () => {
    cy.visit("http://localhost:8080/lms");
    cy.get("li > a[href='/lms/courses']")
      .contains("Courses")
      .click({ force: true })
      .url()
      .should("include", "lms/courses");
  });
});
