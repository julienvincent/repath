// @flow
import _ from 'lodash'

type Schema = {
   [root: string]: {
      __keys: Array<string>
   } & {[override: string]: any | Schema}
}

export default (schema: Schema) => (data: Object, only: string | Array<string>) => {

   /* Given a property name, decide whether or not
    * it contains a relationship to another entity.
    * */
   const findRoot = (property: string, context: string): ?string => {
      let root = null

      /* First check for overrides on the current
       * schema. The current schema is inferred
       * from the provided context.
       * */
      _.forEach(schema[context], (rootName, override) => {
         if (override == property) root = rootName
      })

      if (!root) {
         _.forEach(schema, ({__keys}, rootName: string) => {
            _.forEach(__keys, validKey => {
               if (validKey == property) {
                  root = rootName
               }
            })
         })
      }

      return root
   }

   /* Loop over an entities properties and check if any
    * of them map to a root. If a mapping is found,
    * replace the property with a getter.
    * */
   const applyGetters = (root: string) => (entity: Object) => {
      const parsedEntity = {...entity}

      _.forEach(entity, (value, property) => {
         const propertyRoot = findRoot(property, root)

         if (propertyRoot) {

            /* Replace a property with a getter. When called
             * the getter will apply the next layer of getters
             * */
            Object.defineProperty(parsedEntity, property, {
               get() {
                  const targetEntities = data[propertyRoot]

                  if (!targetEntities) {
                     console.warn(`The root ${propertyRoot} does not exist on the provided data set`)
                     return value
                  }

                  if (Array.isArray(value)) {
                     return _.map(value, id => {
                        const targetValue = targetEntities[id]
                        if (targetValue) return applyGetters(propertyRoot)(targetValue)
                        return id
                     })
                  }

                  if (targetEntities[value]) return applyGetters(propertyRoot)(targetEntities[value])
                  return value
               }
            })
         } else {
            if (typeof value === 'object') parsedEntity[property] = applyGetters(propertyRoot)(value)
         }
      })

      return parsedEntity
   }

   if (only) {
      if (Array.isArray(only)) {
         const parsed = _.mapValues(_.pick(data, only), (entities, root) =>
            _.mapValues(entities, applyGetters(root))
         )

         return {
            ...data,
            ...parsed
         }
      }

      return {
         ...data,
         [only]: _.mapValues(data[only], applyGetters(only))
      }
   }

   return _.mapValues(data, (entities, root) =>
      _.mapValues(entities, applyGetters(root))
   )
}