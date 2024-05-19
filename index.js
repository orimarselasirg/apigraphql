import { ApolloServer, gql, UserInputError } from "apollo-server"
import {v1 as uuid} from 'uuid'
import axios from 'axios'

const personas = [
  {
    name: 'Ramiro',
    age: '26',
    phone: '234234',
    street: 'Calle 35',
    city: 'Medellin',
    id: '123123123'
  },
  {
    name: 'Enrique',
    age: '17',
    phone: '234234234',
    street: 'Calle 40',
    city: 'Medellin',
    id: '234234234'
  },
  {
    name: 'Grisales',
    age: '22',
    street: 'Calle 20',
    city: 'Medellin',
    id: '768678678'
  }
]

const typeDefinitions = gql`
  enum YesNo{
    YES
    NO
  }
  type Address {
    street: String!
    city: String!
  }

  type Person {
    name: String!
    age: String!
    phone: String
    address: Address!
    id: ID!
    isOlder: Boolean
  }

  type Query {
    personCount: Int!
    allPersonas(phone: YesNo): [Person]!
    findPerson (name: String): Person
  }

  type Mutation {
    addPerson (
      name: String!
      phone: String!
      street: String
      city: String!
      age: String!
    ): Person

    editPhone(
      phone: String!
      name: String!
    ) : Person
  }
`

const resolvers = {
  Query: {
    personCount: ()=> personas.length,
    allPersonas: async (rrot, args)=> {
      // const {data: personasTest} = await axios.get('http://localhost:3000/persons')
      // if(!args.phone) return personasTest
      if(!args.phone) return personas
      return personas.filter(p => args.phone === "YES" ? p.phone : !p.phone)
    },
      
    findPerson: (root, args) => {
      const {name} = args
      return personas.find(p => p.name === name)
    }
  },
  Mutation: {
    addPerson: (root, args) => {
      if(personas.find(p => p.name === args.name)){
        throw new UserInputError('Name must be unique', {
          invalidArgs: `${args.name} ya esta en uso`
        })
      }
      const person = {...args, id: uuid()}
      personas.push(person)
      return person
    },
    editPhone: (root, args) => {
      const {phone, name} = args
      const foundPerson = personas.find(p => p.name === name)
      if(!foundPerson){
        throw new UserInputError('No existe esta persona', {
          invalidArgs: `${name} No existe`
        })
      }
      foundPerson.phone = phone
      return foundPerson

    }
  },
  Person: {
    isOlder: (root) => root.age > 18,
    address: (root) => {
      return {
        street: root.street,
        city: root.city
      }
    }
  }
}

const server = new ApolloServer({
  typeDefs: typeDefinitions,
  resolvers: resolvers
})

server.listen().then(({url})=>{
  console.log(`server ${url}`)
})