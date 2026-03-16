declare module '@adonisjs/lucid/build/src/test_utils/database.js' {
  import type { ApplicationService } from '@adonisjs/core/types'

  export class DatabaseTestUtils {
    constructor(app: ApplicationService, connectionName?: string)
    truncate(): Promise<() => Promise<void>>
    seed(): Promise<void>
    migrate(): Promise<() => Promise<void>>
    wrapInGlobalTransaction(): Promise<() => Promise<void>>
    withGlobalTransaction(): Promise<() => Promise<void>>
  }
}
