import repath from '../src'

const parse = repath({
   schemas: {
      users: {
         __keys: ["user", "users", "author", "authors"]
      },
      books: {
         __keys: ["book", "books"],
         user: "awe"
      }
   },
   unions: ["group"],
})

const parsed = parse({
   users: {
      1: {
         name: "john",
         book: 1,
         nested: {
            book: 1
         },
         group: {schema: "awe", id: 1}
      }
   },
   books: {
      1: {
         title: "awesome",
         author: 1,
         users: [1],
         user: 1
      }
   },
   awe: {
      1: {
         lol: "awesome"
      }
   }
})

console.log(parsed.users[1])