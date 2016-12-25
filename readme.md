# repath [![Build Status](https://travis-ci.org/julienvincent/repath.svg?branch=master)](https://travis-ci.org/julienvincent/repath) [![Coverage Status](https://coveralls.io/repos/github/julienvincent/repath/badge.svg?branch=master)](https://coveralls.io/github/julienvincent/repath?branch=master) [![npm version](https://badge.fury.io/js/repath.svg)](https://badge.fury.io/js/repath)

A utility for repathing or denormalizing normalized data using JavaScript getters.

## Installation

`$ yarn add repath`

## Explanation

It's often preferred to store data in a flat map instead of nesting it, however it's hard to work with data in this format as all references need to be manually
reconstructed, or the data needs to go through some kind of denormalization process. Repath leaves your data in a flat map but replaces all entity references with
getter functions that return the expected data.

Repath only ever parses the top of the data tree, any nested processing that may be required is done when the getters are invoked to prevent any unnecessary work.

## Example

```javascript
import repath from 'repath'

const data = {
   users: {
      1: {
         name: "John",
         book: 1
      }
   },
   
   books: {
      1: {
         title: "Book A",
         author: 1
      }
   }
}

const join = repath({
   schemas: {
      users: {
         __keys: ["author"]
      },
      books: {
         __keys: ["book"]
      }
   }
})

const parsedData = join(data)
```

```javascript
// parsedData
{
   users: {
      1: {
         name: "John",
         book: [getter]
      }
   },
      
   books: {
     1: {
        title: "Book A",
        author: [getter]
     }
  }
}

// parsedData.users[1].book
{
   title: "Book A",
   author: [getter]
}
```

## API

#### `repath(config): parser`

Invoke repath with some initial config. This will return a parser function.

```javascript
config = {
   schemas: {
      rootA: {
         __keys: ["a", "b"] // array of property keys that are references to 'root',
         ...overrides // key => root properties that override the __keys of other roots. 
      },
      rootB: {
         __keys: [],
         b: "rootC", // instead of mapping b to rootA, map b to rootC
         a: null // specifying an override with value 'null' prevents any relationship mapping from occurring.
      },
      rootC: {
         ...
      }
   },
   unions: ["c", "d"], // array of properties that are unions of other schemas,
   
   /* By default, repath expects unions to be referenced by an object: {schema, id}.
    * If your union does not follow this pattern, you can provide a function to
    * infer the reference.
    * */
   inferReference: union => ({schema: string, id: string | number})
}
```

#### `parser(data [, limiter]): Object`

This is a function that will replace entity references with `getter` functions.

+ data: `Object` - The collection of entities you want to parse
+ limiter: `Array<string> | string` - Either a root or an array of roots to exclusively parse. All other roots will be ignored

## Credits

Repath was inspired by a conversation with [Alexis Vincent](https://github.com/alexisvincent) and was built as a collaboration.