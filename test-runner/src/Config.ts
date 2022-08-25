export interface Config {
    testFolder: string
    proxies?: IProxy[]
    runners: IRunner[]
    additionalScripts?: string[]
}

export interface IProxy {
    local: string
    remote: string
}

export interface IRunner {
    dependencies: string[]
    globals?: string[]
}
