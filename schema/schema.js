const axios = require("axios");
const graphql = require("graphql");

const { GraphQLObjectType, GraphQLInt, GraphQLString, GraphQLList } = graphql;

const notNull = (type) => new graphql.GraphQLNonNull(type)

const CompanyType = new GraphQLObjectType({
  name: "Company",
  // Closure that'll be only ran after the rest of the file
  // Has done executing
  fields: () => ({
    id: { type: GraphQLString },
    name: { type: GraphQLString },
    description: { type: GraphQLString },
    users: {
      type: new GraphQLList(UserType),
      resolve(parentValue, args) {
        return axios
          .get(`http://localhost:3000/companies/${parentValue.id}/users`)
          .then((response) => response.data);
      }
    }
  })
});

const UserType = new GraphQLObjectType({
  name: "User",
  fields: {
    id: { type: GraphQLString },
    firstName: { type: GraphQLString },
    age: { type: GraphQLInt },
    company: {
      type: CompanyType,
      resolve(parentValue, _args) {
        return axios
          .get(`http://localhost:3000/companies/${parentValue.companyId}`)
          .then((response) => response.data);
      },
    },
  },
});

const RootQuery = new GraphQLObjectType({
  name: "RootQueryType",
  fields: {
    user: {
      type: UserType,
      args: {
        id: {
          type: GraphQLString,
        },
      },
      resolve(_parentValue, args) {
        return axios
          .get(`http://localhost:3000/users/${args.id}`)
          .then((response) => response.data);
      },
    },
    company: {
      type: CompanyType,
      args: {
        id: {
          type: GraphQLString,
        },
      },
      resolve(_parentValue, args) {
        return axios
          .get(`http://localhost:3000/companies/${args.id}`)
          .then((response) => response.data);
      },
    },
  },
});

const mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    // Field in a mutation describes
    // What the mutation is doing
    addUser: {
      type: UserType,
      args: {
        firstName: {type: notNull(GraphQLString)},
        age: {type: notNull(GraphQLInt)},
        companyId: {type: GraphQLString}
      },
      resolve(_parentValue, {firstName, age}) {
        return axios.post('http://localhost:3000/users', {firstName, age})
        .then(r => r.data);
      }
    },
    deleteUser: {
      type: UserType,
      args: {
        id: {type: notNull(GraphQLInt)},
      },
      resolve(_parentValue, {id}) {
        return axios.delete(`http://localhost:3000/users/${id}`)
        .then(r => r.data);
      }
    },
    editUser: {
      type: UserType,
      args: {
        id: {type: notNull(GraphQLString)},
        firstName: {type: GraphQLString},
        age: {type: GraphQLInt},
        companyId: {type: GraphQLString}
      },
      resolve(_parentValue, args) {
        return axios.patch(`http://localhost:3000/users/${args.id}`, args)
        .then(r => r.data);
      }
    }
  },
})

module.exports = new graphql.GraphQLSchema({
  query: RootQuery,
  mutation
});
