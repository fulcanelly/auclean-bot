
export namespace config {
  export type DefaultModuleSettings = {
    enabled: boolean
    run_at_start: boolean
    timeout: number
    name: string
  }

  export interface Modules {
  }


  export interface Config {
    modules: Modules
  }
}

export const appConfig: config.Config = {
  modules: {
    scan_retry: {
      enabled: true,
      run_at_start: true,
      timeout: 10_000,
      name: 'scan retry',
      max_attempts: 10,
      max_timout: 10_000
    },
    scan_recursivelly: {
      enabled: false,
      run_at_start: false,
      timeout: 60_000,
      name: 'recursive chan scan'
    },
    scan_timout_job: {
      enabled: true,
      run_at_start: true,
      timeout: 10_000,
      name: 'find timout jobs'
    }
  }
}

