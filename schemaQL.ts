
export const typeDefs = `#graphql 

    type Restaurant {
        id:ID!
        name:String!
        address:String!
        temperature:Int!
        actualHour: String!
    }

    type Query {
        getRestaurants: [Restaurant!]!
        getRestaurant(id:ID!): Restaurant
    }

    type Mutation {
        addRestaurant(name:String!, address:String!, city:String!, phone:String!): Restaurant!
        deleteRestaurant(id:ID!): Boolean!
    }

`;