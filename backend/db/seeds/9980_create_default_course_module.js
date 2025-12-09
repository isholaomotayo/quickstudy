exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex("course_module")
    .del()
    .then(function() {
      // Inserts seed entries
      return knex("course_module").insert([
        {
          id: 1,
          course_id: 8,
          name: "ISSUES IN MANAGERIAL ECONOMICS",
          order: 0,
          description:
            "Managerial economics as a discipline has come to represent a vital source of knowledge for decision making at different levels of business. Decision sciences, basic management, economics and other relevant courses are brought together to form this vital field of study. In this module, the introductory elements of managerial economics are considered. Also, you the definitional issues in managerial economics, its interdisciplinary relationship as well as its relevance in decision making are discussed."
        },
        {
          id: 2,
          course_id: 8,
          name: "PRICE MECHANISM",
          order: 1,
          description:
            "One of the areas highlighted in the foregoing module in which managerial economics plays a relevant role is pricing. Price being the exchange value of goods and services represents a strategic decision area. The interplay of the forces that are related to price represents an area of uncertainty which any business cannot overlook. In this module, you will study learn the role of price mechanism as well demand and supply analyses."
        },
        {
          id: 3,
          course_id: 8,
          name: "MARKET MODELS AND COMPETITION",
          order: 2,
          description:
            "Profit output decisions vary across market models. In making managerial decisions, one of the factors of interest the market make-up as well as its inert characteristics. This module focuses on the issue of market models and competition. The module is divided into four units and each unit would take you a minimum of three hours to cover. The units you will encounter in this module will include:"
        },
        {
          id: 4,
          course_id: 33,
          name: "Nature of Finance and Types of Business Organisations",
          order: 1,
          description:
            "In every sphere of life, everyone deals with matters of finance. Basically, finance as a subject matter and activity is part of all disciplines and all aspects of human life. That is why it is normally referred to as the lifeblood of every business. At the levels of household, business and government, no activity can be undertaken without finance. In this introductory module, you will be exposed to the nature and definition of finance, the various fields, and the importance of finance and its relationship with other disciplines and functional areas of business. You will also be thought the various types of business organisations where finance functions are being performed as well as the functions of the financial manager. It is very important for you to pay every attention to this module so that you will be able to grasp the rest of the course."
        },
        {
          id: 5,
          course_id: 33,
          name: "Sources of Business Finance",
          order: 2,
          description:
            "Finance is the lifeblood of every business. When one is thinking of starting a business, he at the same time will be meditating on the sources of funds because without it, the business will not leave the drawing board. In this module, you will learn the sources of funds available to business organisations of every type. There is short term, medium-term and long term sources which you will learn under three study session. We will present the short-term sources in Study Session 1. The medium-term sources in study Session 2 and the long-term sources in study unit 3. It is very important that you master the content of this module because it forms the basis for your further study in financial management."
        },
        {
          id: 6,
          course_id: 33,
          name: "The Nigerian Financial System",
          order: 3,
          description:
            "A financial system is comprised of financial intermediaries, financial institutions, financial markets, rules, norms and conventions that facilitate and regulate the flow of funds from the savings surplus unit to the savings deficit unit in the economy. You have in the previous modules and sessions studied the nature and concept of finance, the functions of finance and financial management, the types and financing of business organisation and the various sources of funds to the businesses. All these activities take place and are facilitated by the financial system. This is why it is very important for you to study and master this module."
        },
        {
          id: 7,
          course_id: 33,
          name: "The Nigerian Banking System",
          order: 4,
          description:
            "In this module, you will learn about the Nigerian Banking system, the institutions and classifications, the Central Bank, deposit money bank the merchant and development banks. You will also look at the modes of payment and conclude with bank lending activities and credit administration. This module contains three study units. It is important that you study this module with every seriousness because this is a major part of your programme in finance."
        }
      ]);
    });
};
