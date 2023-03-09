export interface Config {
    testFolder: string
    proxies?: IProxy[]
    runners: IRunner[]
    additionalScripts?: string[]
}

export type IProxy = IProxyStrict | IProxyFromEnv

export interface IProxyStrict {
    local: string
    remote: string
}

export interface IProxyFromEnv {
    local: string
    env: string
}

export interface IRunner {
    dependencies: string[]
    globals?: string[]
}
