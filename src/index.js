// @flow
import _ from 'lodash'

type Schemas = {
   [root: string]: {
      __keys: Array<string>
   } & {[override: string]: any | Schemas}
}

type Config = {
   schemas: Schemas,
   unions: Array<string>,
   inferReference: Function
}

type Union = {
   id: string,
   schema: string
}

type Reference = {
   id: string,
   schema: string
}

export default (config: Config) => (data: Object, limiter: string | Array<string>) => {
   const {schemas, unions, inferReference} = config

   /* Given a property name, decide whether or not
    * it contains a relationship to another entity.
    * */
   const findRelationship = (property: string, currentRoot: string): ?string => {
      let reference = null

      /* First check for overrides on the current
       * schema. The current schema is inferred
       * from the provided root.
       * */
      _.forEach(schemas[currentRoot], (root, override) => {
         if (override == property) reference = root
      })

      /* Check to see if the property is a union. If
       * a match is found, return a pseudo root.
       * */
      if (!reference) {
         _.forEach(unions, union => {
            if (union == property) reference = union
         })
      }

      if (!reference) {
         _.forEach(schemas, ({__keys}, root: string) => {
            _.forEach(__keys, validKey => {
               if (validKey == property) {
                  reference = root
               }
            })
         })
      }

      return reference
   }

   /* Loop over an entities properties and check if any
    * of them map to a root. If a mapping is found,
    * replace the property with a getter.
    * */
   const applyGetters = (root: string) => (entity: Object) => {
      const parsedEntity = {...entity}

      _.forEach(entity, (value, property) => {
         const relationship = findRelationship(property, root)

         if (relationship) {

            /* Construct a reference from a value. This is used
             * to properly understand union relationships.
             * */
            const constructReference = (value: string | Union): Reference => {
               if (typeof value === 'object') {
                  if (typeof inferReference === 'function') return inferReference(value)
                  return value
               }
               return {schema: relationship, id: value}
            }

            /* Replace a property with a getter. When called
             * the getter will apply the next layer of getters
             * */
            Object.defineProperty(parsedEntity, property, {
               get() {
                  if (Array.isArray(value)) {
                     return _.map(value, (entityId) => {
                        const {id, schema} = constructReference(entityId)

                        const targetEntities = data[schema]
                        if (targetEntities && targetEntities[id]) return applyGetters(schema)(targetEntities[id])
                        return entityId
                     })
                  }

                  const {id, schema} = constructReference(value)
                  const targetEntities = data[schema]

                  if (targetEntities && targetEntities[id]) return applyGetters(schema)(targetEntities[id])
                  return value
               }
            })
         } else {

            /* If the entity property is an object, continue
             * checking nested properties for any relationships.
             * */
            if (!Array.isArray(value) && typeof value === 'object')
               parsedEntity[property] = applyGetters(root)(value)
         }
      })

      return parsedEntity
   }

   /* If a limiter has been provided, only parse the
    * roots present in the limiter and merge the
    * remaining raw data alongside it.
    * */
   if (limiter) {
      if (Array.isArray(limiter)) {
         const parsed = _.mapValues(_.pick(data, limiter), (entities, root) =>
            _.mapValues(entities, applyGetters(root))
         )

         return {
            ...data,
            ...parsed
         }
      }

      return {
         ...data,
         [limiter]: _.mapValues(data[limiter], applyGetters(limiter))
      }
   }

   /* Parse the top level of all entities to replace
    * all relationships with getters.
    * */
   return _.mapValues(data, (entities, root) =>
      _.mapValues(entities, applyGetters(root))
   )
}