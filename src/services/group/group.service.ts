// Initializes the `group` service on path `/group`
import { ServiceAddons } from '@feathersjs/feathers'
import { Application } from '../../declarations'
import { Group } from './group.class'
import createModel from '../../models/group.model'
import hooks from './group.hooks'

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'group': Group & ServiceAddons<any>
  }
}

export default (app: Application): void => {
  const options = {
    Model: createModel(app)
  }

  app.use('/group', new Group(options, app))

  const service = app.service('group')

  service.hooks(hooks)
}
